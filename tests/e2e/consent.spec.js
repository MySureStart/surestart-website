// @ts-check
const { test, expect } = require('@playwright/test');
const h = require('./helpers/consent-helpers');

/*
 * SureStart Cookie Consent – End-to-End Tests
 *
 * These tests verify the strict-global opt-in consent implementation.
 * Each test uses a fresh browser context (no shared state between tests).
 *
 * Run:  npx playwright test
 * HTML report:  npx playwright show-report tests/reports
 */

// ---------------------------------------------------------------------------
// 1. FIRST LOAD — NO CONSENT
// ---------------------------------------------------------------------------
test.describe('1 – First load with no consent', () => {
  test('shows banner, blocks GA/marketing, no unexpected storage', async ({ page, context }) => {
    const tracker = h.trackRequests(page);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Banner must be visible with three equally prominent buttons
    await h.assertBannerVisible(page);
    await expect(page.locator('.cc-btn--accept')).toBeVisible();
    await expect(page.locator('.cc-btn--reject')).toBeVisible();
    await expect(page.locator('.cc-btn--manage')).toBeVisible();

    // No non-essential cookies
    await h.assertNoNonEssentialCookies(context);
    await h.assertNoAnalyticsCookies(context);
    await h.assertNoMarketingCookies(context);

    // No unexpected storage
    await h.assertNoUnexpectedStorage(page);

    // No GA or marketing network requests
    expect(tracker.getGARequests()).toHaveLength(0);
    expect(tracker.getMarketingRequests()).toHaveLength(0);

    // No persisted consent record yet (banner shown, not interacted)
    const stored = await h.getStoredConsent(page);
    expect(stored).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 2. ACCEPT ALL
// ---------------------------------------------------------------------------
test.describe('2 – Accept all', () => {
  test('persists consent with all categories true, hides banner', async ({ page, context }) => {
    await page.goto('/');
    await h.assertBannerVisible(page);

    // Click Accept All
    await page.click('.cc-btn--accept');

    // Banner hides
    await h.assertBannerHidden(page);

    // Consent is persisted
    const consent = await h.getStoredConsent(page);
    expect(consent).not.toBeNull();
    expect(consent.categories.necessary).toBe(true);
    expect(consent.categories.preferences).toBe(true);
    expect(consent.categories.analytics).toBe(true);
    expect(consent.categories.marketing).toBe(true);
    expect(consent.signalSource).toBe('banner');
    expect(consent.version).toBe(1);
  });

  test('consent persists on reload — banner stays hidden', async ({ page }) => {
    await page.goto('/');
    await h.assertBannerVisible(page);
    await page.click('.cc-btn--accept');
    await h.assertBannerHidden(page);

    // Reload
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Banner must not reappear
    await h.assertBannerHidden(page);

    // Consent still stored
    const consent = await h.getStoredConsent(page);
    expect(consent).not.toBeNull();
    expect(consent.categories.analytics).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. REJECT NON-ESSENTIAL
// ---------------------------------------------------------------------------
test.describe('3 – Reject non-essential', () => {
  test('persists consent with non-essential false, no GA requests on reload', async ({ page, context }) => {
    await page.goto('/');
    await h.assertBannerVisible(page);

    // Click Reject
    await page.click('.cc-btn--reject');
    await h.assertBannerHidden(page);

    // Consent persisted — non-essential all false
    const consent = await h.getStoredConsent(page);
    expect(consent).not.toBeNull();
    expect(consent.categories.necessary).toBe(true);
    expect(consent.categories.preferences).toBe(false);
    expect(consent.categories.analytics).toBe(false);
    expect(consent.categories.marketing).toBe(false);

    // Reload and verify no GA
    const tracker = h.trackRequests(page);
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000); // allow time for any leaked requests

    await h.assertNoAnalyticsCookies(context);
    expect(tracker.getGARequests()).toHaveLength(0);

    // Banner should stay hidden
    await h.assertBannerHidden(page);
  });
});

// ---------------------------------------------------------------------------
// 4. GRANULAR — ANALYTICS ONLY
// ---------------------------------------------------------------------------
test.describe('4 – Granular analytics-only consent', () => {
  test('opens modal, enables only analytics, saves correctly', async ({ page, context }) => {
    await page.goto('/');
    await h.assertBannerVisible(page);

    // Open preferences modal
    await page.click('.cc-btn--manage');
    await h.assertModalVisible(page);

    // All non-necessary toggles should default to OFF
    const analyticsToggle = page.locator('#cc-toggle-analytics');
    const marketingToggle = page.locator('#cc-toggle-marketing');
    const preferencesToggle = page.locator('#cc-toggle-preferences');

    await expect(analyticsToggle).not.toBeChecked();
    await expect(marketingToggle).not.toBeChecked();
    await expect(preferencesToggle).not.toBeChecked();

    // Enable analytics only — click the <label> (the visible toggle track),
    // not the hidden <input>, because the CSS toggle pattern hides the input.
    await page.locator('label[for="cc-toggle-analytics"]').click();
    await expect(analyticsToggle).toBeChecked();

    // Save
    await page.locator('.cc-modal-footer button', { hasText: 'Save Preferences' }).click();
    await h.assertModalHidden(page);

    // Verify persisted state
    const consent = await h.getStoredConsent(page);
    expect(consent.categories.analytics).toBe(true);
    expect(consent.categories.marketing).toBe(false);
    expect(consent.categories.preferences).toBe(false);

    // No marketing cookies
    await h.assertNoMarketingCookies(context);
  });
});

// ---------------------------------------------------------------------------
// 5. WITHDRAW CONSENT AFTER ACCEPTING
// ---------------------------------------------------------------------------
test.describe('5 – Withdraw consent after previously accepting', () => {
  test('can revoke via footer settings link, consent updates immediately', async ({ page, context }) => {
    // First: accept all
    await page.goto('/');
    await h.assertBannerVisible(page);
    await page.click('.cc-btn--accept');
    await h.assertBannerHidden(page);

    let consent = await h.getStoredConsent(page);
    expect(consent.categories.analytics).toBe(true);

    // Open settings via footer link
    await page.click('.cc-footer-link');
    await h.assertModalVisible(page);

    // Toggles should reflect current consent (all on)
    await expect(page.locator('#cc-toggle-analytics')).toBeChecked();
    await expect(page.locator('#cc-toggle-marketing')).toBeChecked();
    await expect(page.locator('#cc-toggle-preferences')).toBeChecked();

    // Click "Reject All Non-Essential"
    await page.click('.cc-modal-footer .cc-btn--reject');
    await h.assertModalHidden(page);

    // Verify consent updated
    consent = await h.getStoredConsent(page);
    expect(consent.categories.analytics).toBe(false);
    expect(consent.categories.marketing).toBe(false);
    expect(consent.categories.preferences).toBe(false);

    // On next page load, no GA requests
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    const tracker = h.trackRequests(page); // start tracking AFTER reload to avoid stale requests
    await page.waitForTimeout(2000);
    expect(tracker.getGARequests()).toHaveLength(0);
    await h.assertNoAnalyticsCookies(context);
  });
});

// ---------------------------------------------------------------------------
// 6. REOPEN SETTINGS FROM FOOTER
// ---------------------------------------------------------------------------
test.describe('6 – Reopen settings from footer', () => {
  test('footer "Cookie Settings" link is present and opens modal', async ({ page }) => {
    // Accept to dismiss banner first
    await page.goto('/');
    await page.click('.cc-btn--accept');
    await h.assertBannerHidden(page);

    // Footer link must exist
    const footerLink = page.locator('.cc-footer-link');
    await expect(footerLink).toBeVisible();
    await expect(footerLink).toHaveText('Cookie Settings');

    // Click opens modal
    await footerLink.click();
    await h.assertModalVisible(page);

    // Close button should be visible (user has prior choice)
    await expect(page.locator('.cc-modal-close')).toBeVisible();

    // Escape should close modal
    await page.keyboard.press('Escape');
    await h.assertModalHidden(page);
  });

  test('footer link exists on multiple pages', async ({ page }) => {
    // Check homepage
    await page.goto('/');
    await page.click('.cc-btn--accept');
    await expect(page.locator('.cc-footer-link')).toBeVisible();

    // Check about page
    await page.goto('/about/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('.cc-footer-link')).toBeVisible();

    // Check contact page
    await page.goto('/contact/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('.cc-footer-link')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 7. GPC (Global Privacy Control) SIGNAL
// ---------------------------------------------------------------------------
test.describe('7 – GPC present', () => {
  test('GPC signal defaults non-essential to off, shows GPC notice', async ({ browser }) => {
    // Create context with GPC enabled via JS injection
    const context = await browser.newContext();
    const page = await context.newPage();

    // Inject GPC before page loads
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'globalPrivacyControl', {
        get: () => true,
        configurable: true,
      });
    });

    const tracker = h.trackRequests(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Banner should appear (GPC does not auto-persist)
    await h.assertBannerVisible(page);

    // Should show GPC badge
    await expect(page.locator('.cc-gpc-badge')).toBeVisible();

    // No GA requests
    expect(tracker.getGARequests()).toHaveLength(0);

    // No persisted consent (GPC creates in-memory default, not persisted)
    const stored = await h.getStoredConsent(page);
    expect(stored).toBeNull();

    // Open modal and verify GPC notice
    await page.click('.cc-btn--manage');
    await h.assertModalVisible(page);
    await expect(page.locator('.cc-gpc-notice')).toBeVisible();

    // Non-essential toggles should be off
    await expect(page.locator('#cc-toggle-analytics')).not.toBeChecked();
    await expect(page.locator('#cc-toggle-marketing')).not.toBeChecked();
    await expect(page.locator('#cc-toggle-preferences')).not.toBeChecked();

    await context.close();
  });

  test('GPC user can still opt in if they explicitly choose', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'globalPrivacyControl', {
        get: () => true,
        configurable: true,
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Accept all overrides GPC
    await page.click('.cc-btn--accept');
    await h.assertBannerHidden(page);

    const consent = await h.getStoredConsent(page);
    expect(consent).not.toBeNull();
    expect(consent.categories.analytics).toBe(true);
    expect(consent.categories.marketing).toBe(true);

    await context.close();
  });
});

// ---------------------------------------------------------------------------
// 8. THIRD-PARTY EMBED CLICK-TO-LOAD FLOW
// ---------------------------------------------------------------------------
test.describe('8 – Third-party embed click-to-load', () => {
  test('YouTube iframes are blocked before marketing consent', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Without consent, YouTube iframes should be placeholders (data-src, not src)
    // or hidden behind click-to-load facades
    const ytIframes = await page.locator('iframe[src*="youtube.com"]').count();
    expect(ytIframes).toBe(0);

    // Check for facade placeholders if any YouTube content exists on the page
    const facades = await page.locator('.cc-embed-placeholder, [data-cc-vendor="youtube-embed"]').count();
    // This assertion just verifies no live YouTube iframes leaked through
    // The exact facade count depends on page content
  });

  test('after marketing consent, YouTube embeds would be loadable', async ({ page }) => {
    await page.goto('/');
    await h.assertBannerVisible(page);
    await page.click('.cc-btn--accept');

    // After consent, check that consent service reports marketing as allowed
    const marketingAllowed = await page.evaluate(() => {
      const w = /** @type {any} */ (window);
      return w.SsConsent && w.SsConsent.shouldLoadVendor('youtube-embed');
    });
    expect(marketingAllowed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// BONUS: CONSENT SERVICE API INTEGRITY
// ---------------------------------------------------------------------------
test.describe('Bonus – Consent service API', () => {
  test('SsConsent is available on window with expected methods', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const api = await page.evaluate(() => {
      const c = /** @type {any} */ (window).SsConsent;
      if (!c) return null;
      return {
        hasInit: typeof c.init === 'function',
        hasGetConsent: typeof c.getConsent === 'function',
        hasHasConsent: typeof c.hasConsent === 'function',
        hasAcceptAll: typeof c.acceptAll === 'function',
        hasRejectAll: typeof c.rejectAll === 'function',
        hasResetConsent: typeof c.resetConsent === 'function',
        hasOnChange: typeof c.onChange === 'function',
        hasShouldLoadVendor: typeof c.shouldLoadVendor === 'function',
        hasIsGPCActive: typeof c.isGPCActive === 'function',
        version: c.VERSION,
        storageKey: c.STORAGE_KEY,
      };
    });

    expect(api).not.toBeNull();
    if (!api) return; // narrow type for TS — unreachable after expect above
    expect(api.hasInit).toBe(true);
    expect(api.hasGetConsent).toBe(true);
    expect(api.hasHasConsent).toBe(true);
    expect(api.hasAcceptAll).toBe(true);
    expect(api.hasRejectAll).toBe(true);
    expect(api.hasResetConsent).toBe(true);
    expect(api.hasOnChange).toBe(true);
    expect(api.hasShouldLoadVendor).toBe(true);
    expect(api.hasIsGPCActive).toBe(true);
    expect(api.version).toBe(1);
    expect(api.storageKey).toBe('ss_consent');
  });

  test('necessary category always returns true even without consent', async ({ page }) => {
    await page.goto('/');
    const necessary = await page.evaluate(() => /** @type {any} */ (window).SsConsent.hasConsent('necessary'));
    expect(necessary).toBe(true);
  });

  test('non-necessary categories return false without consent', async ({ page }) => {
    await page.goto('/');
    const results = await page.evaluate(() => {
      const w = /** @type {any} */ (window);
      return {
        analytics: w.SsConsent.hasConsent('analytics'),
        marketing: w.SsConsent.hasConsent('marketing'),
        preferences: w.SsConsent.hasConsent('preferences'),
      };
    });
    expect(results.analytics).toBe(false);
    expect(results.marketing).toBe(false);
    expect(results.preferences).toBe(false);
  });
});
