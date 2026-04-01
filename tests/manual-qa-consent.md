# Cookie Consent – Manual QA Checklist

Run these checks manually after every consent-related change.
The automated Playwright tests cover functional logic; this checklist covers
what automation **cannot reliably assert**: visual rendering, cross-browser
behaviour, screen-reader UX, and real third-party cookie behaviour.

---

## Pre-requisites

- Clear all site data / use incognito for each scenario.
- Test on: Chrome (latest), Firefox (latest), Safari (latest), Edge (latest).
- Test viewports: desktop (1280 × 720), tablet (768 × 1024), mobile (375 × 812).

---

## 1. Banner – First Layer

| # | Check | Pass? |
|---|-------|-------|
| 1.1 | Banner appears on first visit (no prior consent). | ☐ |
| 1.2 | Three buttons visible: **Accept All**, **Reject Non-Essential**, **Manage Preferences**. | ☐ |
| 1.3 | All three buttons are **equally prominent** (no dark pattern — same size, similar visual weight). | ☐ |
| 1.4 | Banner does not scroll with the page (fixed position at bottom). | ☐ |
| 1.5 | Banner text is readable at all viewports (no overflow, truncation). | ☐ |
| 1.6 | Banner does not cover critical page content or navigation. | ☐ |
| 1.7 | Banner is keyboard-navigable (Tab cycles through buttons, Enter activates). | ☐ |
| 1.8 | Screen reader announces banner as a dialog with "Cookie consent" label. | ☐ |
| 1.9 | Banner does not auto-dismiss or time-out. | ☐ |
| 1.10 | Clicking outside the banner does **not** dismiss it (no implicit consent). | ☐ |

---

## 2. Preferences Modal – Second Layer

| # | Check | Pass? |
|---|-------|-------|
| 2.1 | "Manage Preferences" opens the modal with all four categories listed. | ☐ |
| 2.2 | "Strictly Necessary" shows **Always On** (no toggle, not clickable). | ☐ |
| 2.3 | Preferences / Analytics / Marketing toggles default to **OFF**. | ☐ |
| 2.4 | Modal has three action buttons: **Reject All Non-Essential**, **Save Preferences**, **Accept All**. | ☐ |
| 2.5 | Focus is trapped inside modal (Tab does not escape to background). | ☐ |
| 2.6 | Escape key does **not** close modal if no prior explicit choice. | ☐ |
| 2.7 | Close (×) button is **hidden** if no prior explicit choice. | ☐ |
| 2.8 | Overlay click does **not** close modal if no prior explicit choice. | ☐ |
| 2.9 | Scrolling background is locked while modal is open. | ☐ |
| 2.10 | Modal is readable at mobile viewport (no horizontal overflow). | ☐ |
| 2.11 | Toggle labels are associated with inputs (clicking label text toggles). | ☐ |

---

## 3. Consent Persistence & Withdrawal

| # | Check | Pass? |
|---|-------|-------|
| 3.1 | After "Accept All", reload → banner does not reappear. | ☐ |
| 3.2 | After "Reject Non-Essential", reload → banner does not reappear. | ☐ |
| 3.3 | Footer "Cookie Settings" link opens the modal on every page. | ☐ |
| 3.4 | In modal (after prior consent), toggles reflect saved state. | ☐ |
| 3.5 | Changing toggles and clicking "Save" updates `localStorage.ss_consent`. | ☐ |
| 3.6 | Withdrawal is as easy as giving consent (same number of clicks). | ☐ |
| 3.7 | After withdrawal (Reject All via modal), reload → no GA network requests visible in DevTools. | ☐ |
| 3.8 | After withdrawal, Escape key and close (×) button work (prior explicit choice exists). | ☐ |

---

## 4. Network / Cookie Verification (DevTools)

| # | Check | Pass? |
|---|-------|-------|
| 4.1 | **Before consent**: Network tab shows zero requests to `googletagmanager.com` or `google-analytics.com`. | ☐ |
| 4.2 | **Before consent**: Application → Cookies shows no `_ga`, `_gid`, `YSC`, etc. | ☐ |
| 4.3 | **Before consent**: Application → Local Storage has no keys except (optionally) `ss_consent`. | ☐ |
| 4.4 | **Before consent**: Application → Session Storage is empty. | ☐ |
| 4.5 | **After Accept All**: GA script loads, `_ga` cookie appears. | ☐ |
| 4.6 | **After Reject → Reload**: No `_ga` cookie, no GA network requests. | ☐ |
| 4.7 | **YouTube embeds**: With marketing off, no `youtube.com` iframe src loaded. | ☐ |
| 4.8 | **YouTube embeds**: With marketing on, YouTube iframes load normally. | ☐ |

---

## 5. GPC (Global Privacy Control)

| # | Check | Pass? |
|---|-------|-------|
| 5.1 | In a GPC-enabled browser (Firefox with `privacy.globalprivacycontrol.enabled = true`), banner shows GPC badge. | ☐ |
| 5.2 | GPC notice appears in the preferences modal. | ☐ |
| 5.3 | Non-essential toggles default to OFF with GPC active. | ☐ |
| 5.4 | User can still explicitly opt in (Accept All) despite GPC. | ☐ |

---

## 6. Accessibility

| # | Check | Pass? |
|---|-------|-------|
| 6.1 | Banner and modal pass WCAG 2.1 AA contrast requirements. | ☐ |
| 6.2 | Screen reader (NVDA/VoiceOver/JAWS) reads banner text and button labels. | ☐ |
| 6.3 | Screen reader announces modal title and description when opened. | ☐ |
| 6.4 | Toggle state changes are announced by screen reader. | ☐ |
| 6.5 | Focus returns to triggering element after modal closes. | ☐ |
| 6.6 | No ARIA errors in axe DevTools / Lighthouse accessibility audit. | ☐ |

---

## 7. Cross-Page Consistency

| # | Check | Pass? |
|---|-------|-------|
| 7.1 | Banner appears on every page on first visit (/, /about/, /k12/, /contact/, etc.). | ☐ |
| 7.2 | Footer "Cookie Settings" link present on all pages including error pages (404). | ☐ |
| 7.3 | Footer links to `/privacy/` and `/cookies/` resolve correctly. | ☐ |
| 7.4 | Cookie policy page "Open Cookie Settings" button works. | ☐ |

---

## 8. Edge Cases

| # | Check | Pass? |
|---|-------|-------|
| 8.1 | localStorage disabled (private browsing in some Safari versions): banner still shows, site does not crash. | ☐ |
| 8.2 | Corrupted `ss_consent` in localStorage: site recovers gracefully (re-shows banner). | ☐ |
| 8.3 | Rapid double-click on Accept/Reject does not cause errors. | ☐ |
| 8.4 | Back/forward navigation preserves consent state. | ☐ |

---

## Sign-off

| Role | Name | Date | Result |
|------|------|------|--------|
| QA Tester | | | ☐ Pass / ☐ Fail |
| Developer | | | ☐ Reviewed |

---

## Things Automated Tests Cannot Reliably Assert

1. **Real third-party cookies set by Google/YouTube** — Playwright blocks third-party origins by default; real cookie creation requires a live production environment with actual Google Analytics property.
2. **Visual design / dark-pattern assessment** — Button prominence equality is a visual/subjective check.
3. **Screen reader behaviour** — Requires actual assistive technology; Playwright cannot simulate NVDA/VoiceOver.
4. **Cross-browser rendering** — Tests run Chromium only; Safari/Firefox rendering must be checked manually.
5. **localStorage disabled** — Playwright contexts always have storage available; Safari private browsing limitations need manual testing.
6. **Server-side Sec-GPC header** — GitHub Pages cannot read HTTP headers; only `navigator.globalPrivacyControl` JS API is testable.
7. **Click-to-load facade visual appearance** — Automated tests verify iframe blocking, but the placeholder styling needs visual review.
