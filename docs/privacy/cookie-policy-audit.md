# Cookie Policy Audit — mysurestart.com

> **Date:** 25 March 2026
> **Auditor:** Cline (AI assistant) — codebase + search audit
> **Scope:** All HTML pages, JS files, CSS, and embedded content in the `surestart-website` repo

---

## 1. Confirmed Technologies

| Technology | Provider | Category | Evidence | Pages |
|---|---|---|---|---|
| Google Analytics 4 (`G-CM0T1ZNC15`) | Google LLC | Analytics | Dynamically injected by `consent-vendors.js`; preconnect in `index.html` | All pages (consent-gated) |
| YouTube embeds | Google LLC (YouTube) | Marketing | `data-src` iframes + facade placeholders in `consent-vendors.js` | index, k12, for-universities, impact-stories |
| Airtable form embeds | Formagrid Inc. | Preferences | `src`/`data-src` iframe embeds | contact (1 form), for-students (2 forms) |
| Cloudflare R2 CDN | Cloudflare Inc. | Infrastructure | `pub-dcb79d88e2ec4567824453cc853f55f3.r2.dev` — all images, videos, favicons | All pages |
| Google Fonts (preconnect) | Google LLC | Infrastructure | `<link rel="preconnect" href="https://fonts.googleapis.com">` | Most pages |
| Custom consent system | SureStart | Necessary | `consent.js` → `ss_consent` in localStorage | All pages |
| Vibe Lab localStorage | SureStart | Preferences | `vibeLabRegistration` key in `script.js` | **Dormant** (commented out) |
| Self-hosted fonts (Eastman Grotesque, DM Sans, Inter, Source Serif Pro) | SureStart | Infrastructure | `/assets/fonts/` directory, preloaded woff2 | All pages |
| Self-hosted hero video | SureStart (via R2) | Infrastructure | `home-hero-loop.mp4` + K-12 testimonial videos | index, k12 |

### Confirmed NOT Present

Searched all `*.html` files and `*.js` files. None of the following were found:

- Facebook/Meta Pixel or SDK
- LinkedIn Insight Tag or Pixel
- Google Tag Manager container (`gtm.js`)
- Google Ads / Remarketing tags
- TikTok Pixel
- Hotjar, FullStory, or any session replay
- Intercom, Drift, Crisp, Zendesk, Tawk — no chat widgets
- Optimizely, VWO, LaunchDarkly — no A/B testing
- HubSpot, Mailchimp, Klaviyo — no marketing automation
- Stripe, PayPal — no payment widgets
- Calendly, Typeform, Jotform — no scheduling/form tools beyond Airtable
- Social media SDKs (only plain `<a>` links to LinkedIn, Twitter/X, Instagram, Facebook, YouTube)
- IndexedDB or sessionStorage usage
- Fingerprinting scripts
- Web beacons / tracking pixels (no `<img>` pixel trackers)

---

## 2. Cookie / Tracker Inventory

### Strictly Necessary

| Name | Provider | Type | Purpose | Lifetime | First/Third Party |
|---|---|---|---|---|---|
| `ss_consent` | SureStart | localStorage | Stores visitor's cookie consent preferences | Persistent until cleared | First party |

### Preferences (consent required)

| Name | Provider | Type | Purpose | Lifetime | First/Third Party |
|---|---|---|---|---|---|
| Airtable session cookies | Formagrid Inc. | iframe-opaque cookies | Session state for embedded contact/enrollment forms | Session | Third party |
| `vibeLabRegistration` | SureStart | localStorage | Vibe Lab registration form data | Persistent until cleared | First party |

> **Note:** `vibeLabRegistration` is **dormant** — the Vibe Lab form code is currently commented out in `script.js`.

### Analytics (consent required)

| Name | Provider | Type | Purpose | Lifetime | First/Third Party |
|---|---|---|---|---|---|
| `_ga` | Google LLC | Cookie | Distinguishes unique users (GA4) | 2 years | First party (set by JS) |
| `_ga_CM0T1ZNC15` | Google LLC | Cookie | Maintains session state (GA4) | 2 years | First party (set by JS) |
| `_gid` | Google LLC | Cookie | Distinguishes users within 24h window | 24 hours | First party (set by JS) |

### Marketing (consent required)

| Name | Provider | Type | Purpose | Lifetime | First/Third Party |
|---|---|---|---|---|---|
| `YSC` | Google LLC (YouTube) | Cookie | Tracks viewed videos | Session | Third party |
| `VISITOR_INFO1_LIVE` | Google LLC (YouTube) | Cookie | Estimates user bandwidth | 6 months | Third party |
| `GPS` | Google LLC (YouTube) | Cookie | Unique ID on mobile devices | 30 minutes | Third party |
| `IDE` | Google LLC (YouTube) | Cookie | DoubleClick ad targeting | 1 year | Third party |
| `CONSENT` | Google LLC (YouTube) | Cookie | Stores consent state for Google services | 2 years | Third party |

### Infrastructure (no consent required — strictly necessary)

| Name | Provider | Type | Purpose | Notes |
|---|---|---|---|---|
| Cloudflare R2 CDN | Cloudflare Inc. | HTTP requests | Serves all images, videos, favicons | No cookies observed; Cloudflare may set `__cf_bm` on R2 domains under abuse protection — **NEEDS VERIFICATION on live site** |
| Google Fonts | Google LLC | HTTP requests (preconnect only) | Font loading infrastructure | Preconnect hints present; actual font files are self-hosted in `/assets/fonts/`. Google Fonts API may not actually be called — **NEEDS VERIFICATION** |

---

## 3. Missing Information / Legal Review Items

| Item | Status | Action Required |
|---|---|---|
| **Exact Airtable cookies** | Unknown — iframe-opaque | Airtable's embedded forms run in a cross-origin iframe. Exact cookie names cannot be determined from code. Reference Airtable's privacy policy. |
| **Cloudflare R2 cookies** | Likely none, but unconfirmed | Check live site with DevTools to confirm whether `__cf_bm` or similar Cloudflare cookies appear on R2 requests. |
| **Google Fonts actual usage** | Preconnect present, fonts self-hosted | Verify if any page actually loads from `fonts.googleapis.com` at runtime, or if preconnect is vestigial. If no actual requests, remove preconnect hints. |
| **Contact email for privacy requests** | Not specified | The Cookie Policy and Privacy Policy link to `/contact/` (an Airtable form). Consider adding a direct email address for data subject requests. |
| **Data controller identity** | Generic "SureStart" | Legal entity name, registered address, and (for GDPR) DPO contact should be specified. |
| **Terms of Service** | Linked but `href="#"` | Footer links to Terms of Service with `href="#"` — page does not exist. |
| **Copyright year** | Shows "© 2025" | Footer copyright year should be updated to 2026. |
| **`youtube-nocookie.com` verification** | Stated in policy | Verify that `consent-vendors.js` actually rewrites YouTube URLs to `youtube-nocookie.com`. |

---

## 4. Recommendations

1. **Verify live-site cookies** — Run a real browser on the deployed site with DevTools Network/Application tab to confirm the exact cookies set by each vendor. The code audit shows what *should* happen, but runtime verification is essential.

2. **Remove vestigial Google Fonts preconnect** — If fonts are fully self-hosted, the `<link rel="preconnect" href="https://fonts.googleapis.com">` tags are unnecessary and misleading.

3. **Add direct contact email** — A privacy contact email (not just an Airtable form) strengthens compliance posture for GDPR data subject requests.

4. **Create Terms of Service** — Currently linked in footer but non-existent.

5. **Update copyright year** — "© 2025" → "© 2026" in footers.

6. **Legal entity review** — Have counsel verify the data controller information (legal name, address) for both the Privacy Policy and Cookie Policy.

---

## 5. Implementation Notes

### What was done
- **Upgraded `cookies/index.html`** — Added full navbar, footer, OG meta tags, Cloudflare R2 CDN disclosure, Google Fonts note, dormant Vibe Lab annotation, improved browser settings section, and regional notes for EU/UK and US visitors.

### Assumptions made
- Cloudflare R2 is classified as strictly necessary infrastructure (CDN for static assets). This is standard practice.
- Google Fonts preconnect is noted as infrastructure but flagged for verification since fonts appear to be self-hosted.
- "SureStart" is used as the entity name pending legal review of exact corporate name.
- The effective date is set to 25 March 2026 (today).

### What still needs verification
1. **Live cookie scan** — Deploy and check actual cookies in browser DevTools
2. **Legal entity name** — Confirm with counsel
3. **Contact email** — Decide on a privacy-specific email address
4. **Google Fonts** — Confirm whether `fonts.googleapis.com` is actually called at runtime
5. **Airtable exact cookies** — Cannot be determined from code; reference vendor policy
6. **`youtube-nocookie.com`** — Confirm runtime URL rewriting works as intended
