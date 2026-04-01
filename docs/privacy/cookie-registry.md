# Cookie & Storage Registry

> **Source of truth:** [`assets/js/consent.js`](../../assets/js/consent.js) `VENDOR_REGISTRY`
>
> This document is the human-readable mirror. When adding or removing a vendor, update **both** this file and the `VENDOR_REGISTRY` object in `consent.js`.

---

## Categories

| Category | Default | Toggleable | Description |
|----------|---------|------------|-------------|
| **necessary** | ON | No (always on) | Core site functionality and storing the visitor's privacy choices. |
| **preferences** | OFF | Yes | Third-party forms (Airtable) and first-party functional storage that is not essential to core navigation. |
| **analytics** | OFF | Yes | Site-usage measurement (Google Analytics). |
| **marketing** | OFF | Yes | Third-party media embeds that may track across sites (YouTube). |

---

## Vendor Inventory

### Strictly Necessary

| Key | Provider | Purpose | Storage type | Names | Lifetime |
|-----|----------|---------|--------------|-------|----------|
| `consent-record` | SureStart | Remembers cookie consent preferences | localStorage | `ss_consent` | Persistent until cleared |

### Preferences (Functional)

| Key | Provider | Purpose | Storage type | Names | Lifetime | Privacy policy |
|-----|----------|---------|--------------|-------|----------|----------------|
| `airtable-embed` | Formagrid Inc. (Airtable) | Contact / enrollment forms | iframe-opaque (third-party cookies inside iframe) | Controlled by Airtable | Session | [airtable.com/company/privacy](https://www.airtable.com/company/privacy) |
| `vibe-lab-storage` | SureStart | Stores Vibe Lab registration form data submitted by the user | localStorage | `vibeLabRegistration` | Persistent until cleared | — |

### Analytics

| Key | Provider | Purpose | Storage type | Names | Lifetime | Privacy policy |
|-----|----------|---------|--------------|-------|----------|----------------|
| `google-analytics` | Google LLC | Measures page views and usage patterns | cookie | `_ga`, `_ga_CM0T1ZNC15`, `_gid` | `_ga` / `_ga_*`: 2 years; `_gid`: 24 hours | [policies.google.com/privacy](https://policies.google.com/privacy) |

### Marketing

| Key | Provider | Purpose | Storage type | Names | Lifetime | Privacy policy |
|-----|----------|---------|--------------|-------|----------|----------------|
| `youtube-embed` | Google LLC (YouTube) | Embedded video playback; YouTube may track viewing behaviour | cookie | `YSC`, `VISITOR_INFO1_LIVE`, `GPS`, `IDE`, `CONSENT` | `YSC`: session; `VISITOR_INFO1_LIVE`: 6 months; `GPS`: 30 min; `IDE`: 1 year | [policies.google.com/privacy](https://policies.google.com/privacy) |

---

## Pages where each vendor is loaded

| Vendor key | Pages |
|------------|-------|
| `consent-record` | All (localStorage, written by `consent.js`) |
| `google-analytics` | All 11 HTML pages (gated by analytics consent) |
| `youtube-embed` | `index.html`, `k12/index.html`, `for-universities/index.html`, `impact-stories/index.html` |
| `airtable-embed` | `contact/index.html`, `for-students/index.html` |
| `vibe-lab-storage` | `assets/js/script.js` (dormant — Vibe Lab form currently commented out) |

---

## Negative findings (not present on the site)

- Facebook / Meta Pixel
- Google Ads / Remarketing tags
- Google Tag Manager container
- Chat widgets (Intercom, Drift, etc.)
- A/B testing tools (Optimizely, VWO, etc.)
- Session replay (Hotjar, FullStory, etc.)
- Fingerprinting scripts
- IndexedDB / sessionStorage usage
- Social media SDKs

---

## Static-site limitations

| Limitation | Impact |
|------------|--------|
| GitHub Pages cannot set `Set-Cookie` response headers | Consent stored in localStorage, not an HTTP cookie |
| No server-side `Sec-GPC` header detection | GPC detected via `navigator.globalPrivacyControl` JS API only |
| No Content-Security-Policy header | Cannot enforce script-src via CSP |
| Client-side only enforcement | Determined users could bypass by manipulating localStorage |

---

## Maintenance checklist

When adding a new third-party script, embed, or storage item:

1. Add an entry to `VENDOR_REGISTRY` in `assets/js/consent.js`
2. Add a row to the appropriate table in this document
3. Update the "Pages where each vendor is loaded" table
4. Gate the new vendor behind `SsConsent.shouldLoadVendor('vendor-key')` or `SsConsent.hasConsent('category')`
5. If the vendor introduces a new category, bump `CONSENT_VERSION` to force re-consent
