/**
 * Shared helpers for consent E2E tests.
 */
const { expect } = require('@playwright/test');

/** Known non-essential cookie name prefixes / exact names. */
const GA_COOKIES = ['_ga', '_gid'];
const MARKETING_COOKIES = ['YSC', 'VISITOR_INFO1_LIVE', 'GPS', 'IDE'];
const ALL_NON_ESSENTIAL_COOKIES = [...GA_COOKIES, ...MARKETING_COOKIES];

/** The localStorage key used by SsConsent. */
const CONSENT_STORAGE_KEY = 'ss_consent';

/** Allowed localStorage keys before consent (only consent record itself). */
const ALLOWED_LS_KEYS = [CONSENT_STORAGE_KEY];

/**
 * Assert that zero non-essential cookies exist in the browser context.
 */
async function assertNoNonEssentialCookies(context) {
  const cookies = await context.cookies();
  for (const c of cookies) {
    const isNonEssential = ALL_NON_ESSENTIAL_COOKIES.some(
      (name) => c.name === name || c.name.startsWith(name)
    );
    expect(isNonEssential, `Unexpected non-essential cookie found: ${c.name}`).toBe(false);
  }
}

/**
 * Assert no GA cookies specifically.
 */
async function assertNoAnalyticsCookies(context) {
  const cookies = await context.cookies();
  for (const c of cookies) {
    const isGA = GA_COOKIES.some((name) => c.name === name || c.name.startsWith(name));
    expect(isGA, `Unexpected analytics cookie: ${c.name}`).toBe(false);
  }
}

/**
 * Assert no marketing cookies specifically.
 */
async function assertNoMarketingCookies(context) {
  const cookies = await context.cookies();
  for (const c of cookies) {
    const isMkt = MARKETING_COOKIES.some((name) => c.name === name || c.name.startsWith(name));
    expect(isMkt, `Unexpected marketing cookie: ${c.name}`).toBe(false);
  }
}

/**
 * Assert no unexpected localStorage / sessionStorage keys.
 */
async function assertNoUnexpectedStorage(page) {
  const lsKeys = await page.evaluate(() => Object.keys(localStorage));
  for (const key of lsKeys) {
    const allowed = ALLOWED_LS_KEYS.includes(key);
    expect(allowed, `Unexpected localStorage key before consent: ${key}`).toBe(true);
  }

  const ssKeys = await page.evaluate(() => Object.keys(sessionStorage));
  expect(ssKeys.length, `Unexpected sessionStorage keys: ${ssKeys.join(', ')}`).toBe(0);
}

/**
 * Collect network requests and return a filter function.
 * Call before navigating. Returns { getGARequests, getMarketingRequests }.
 */
function trackRequests(page) {
  const requests = [];
  page.on('request', (req) => requests.push(req.url()));

  return {
    getGARequests: () =>
      requests.filter(
        (u) =>
          u.includes('google-analytics.com') ||
          u.includes('googletagmanager.com/gtag') ||
          u.includes('analytics.google.com')
      ),
    getMarketingRequests: () =>
      requests.filter(
        (u) =>
          u.includes('youtube.com') ||
          u.includes('doubleclick.net') ||
          u.includes('googlesyndication.com')
      ),
    getAllRequests: () => requests,
  };
}

/**
 * Read the persisted consent record from localStorage.
 */
async function getStoredConsent(page) {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }, CONSENT_STORAGE_KEY);
}

/**
 * Assert the consent banner is visible.
 */
async function assertBannerVisible(page) {
  const banner = page.locator('.cc-banner.cc-visible');
  await expect(banner).toBeVisible({ timeout: 5000 });
}

/**
 * Assert the consent banner is not visible.
 */
async function assertBannerHidden(page) {
  const banner = page.locator('.cc-banner.cc-visible');
  await expect(banner).not.toBeVisible({ timeout: 3000 });
}

/**
 * Assert the preferences modal is visible.
 */
async function assertModalVisible(page) {
  const modal = page.locator('.cc-modal.cc-visible');
  await expect(modal).toBeVisible({ timeout: 5000 });
}

/**
 * Assert the preferences modal is not visible.
 */
async function assertModalHidden(page) {
  const modal = page.locator('.cc-modal.cc-visible');
  await expect(modal).not.toBeVisible({ timeout: 3000 });
}

module.exports = {
  GA_COOKIES,
  MARKETING_COOKIES,
  ALL_NON_ESSENTIAL_COOKIES,
  CONSENT_STORAGE_KEY,
  assertNoNonEssentialCookies,
  assertNoAnalyticsCookies,
  assertNoMarketingCookies,
  assertNoUnexpectedStorage,
  trackRequests,
  getStoredConsent,
  assertBannerVisible,
  assertBannerHidden,
  assertModalVisible,
  assertModalHidden,
};
