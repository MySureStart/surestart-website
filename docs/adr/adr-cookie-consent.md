# ADR-001: Cookie Consent Architecture

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-03-11 |
| **Author** | Cline (AI assistant) — reviewed by maintainer |
| **Deciders** | SureStart engineering |

---

## Context

The SureStart website (`mysurestart.com`) is a static HTML site hosted on GitHub Pages. It currently loads **Google Analytics 4** (gtag.js `G-CM0T1ZNC15`) unconditionally on all 11 pages, embeds **YouTube** iframes on 4 pages (8 instances), and embeds **Airtable** forms on 2 pages (3 instances). None of these are gated behind consent. There is no cookie banner, no privacy policy page, and no mechanism for visitors to accept or reject non-essential cookies.

This violates:
- **EU/UK ePrivacy Directive Art. 5(3)** — prior opt-in consent required before setting non-essential cookies.
- **GDPR Art. 6 & 7** — lawful basis and conditions for consent.
- **US state privacy laws (CCPA/CPRA, CPA, CTDPA, etc.)** — Global Privacy Control (GPC) signal must be honoured.

The site targets a global audience (students, universities, K-12 schools worldwide).

## Decision

Implement a **custom, strict-global, opt-in consent system** with the following design choices:

### 1. No third-party CMP

**Decision:** Build a custom lightweight consent manager rather than integrating a SaaS CMP (e.g., OneTrust, CookieBot, Termly).

**Rationale:**
- The repo has no existing CMP dependency.
- The site is static HTML with no build pipeline — integrating a SaaS CMP would add an external dependency, a new vendor (that itself sets cookies), and recurring costs.
- The vendor surface is small (GA4, YouTube, Airtable) — a custom solution is proportionate.
- Full control over banner UX avoids dark patterns.

**Trade-off:** No automatic cookie scanning, geo-detection, or IAB TCF integration. Acceptable given the small vendor surface.

### 2. Strict-global default (no geo-detection)

**Decision:** Apply EU-style opt-in rules globally. All non-essential categories default to OFF for all visitors regardless of location.

**Rationale:**
- GitHub Pages provides no server-side geo-detection.
- Client-side geo-detection (IP-based APIs) adds latency, a new third-party dependency, and is unreliable.
- Applying the strictest standard globally is the safest approach and simplifies implementation.
- Marginal analytics data loss from US visitors who would otherwise be opted-in is an acceptable trade-off.

**Trade-off:** US visitors see the same opt-in banner as EU visitors. No separate "opt-out" mode.

### 3. Four consent categories

| Category | Scope | Default |
|----------|-------|---------|
| `necessary` | Consent record storage, core JS, self-hosted fonts, R2 CDN | Always ON (not toggleable) |
| `preferences` | Airtable form embeds, localStorage PII writes | OFF |
| `analytics` | Google Analytics 4 | OFF |
| `marketing` | YouTube video embeds | OFF |

**Rationale:** Maps to the four standard categories in ePrivacy guidance. "Preferences" (rather than "functional") aligns with the IAB category naming convention. The repo's previous plan used "functional" — renamed for standards alignment.

### 4. localStorage for consent storage

**Decision:** Store the consent record in `localStorage` under key `ss_consent`, not as an HTTP cookie.

**Rationale:**
- GitHub Pages cannot set `Set-Cookie` response headers, so cookie attributes like `SameSite`, `Secure`, and `HttpOnly` cannot be controlled.
- localStorage is accessible only to same-origin scripts, providing equivalent security for a static site.
- The consent record is strictly necessary (stores privacy choices) and does not require server-side reads.

**Trade-off:** Consent does not travel with HTTP requests. Not relevant for a static site with no server-side rendering.

### 5. Versioned consent record

The stored record includes:

```json
{
  "categories": {
    "necessary": true,
    "preferences": false,
    "analytics": false,
    "marketing": false
  },
  "timestamp": "2026-03-11T21:07:00.000Z",
  "version": 1,
  "regionMode": "strict-global",
  "signalSource": "banner"
}
```

- **`version`** — Schema version. Bumped when categories change or the consent model is materially altered. A version mismatch triggers migration logic (currently a no-op for v1) and may re-show the banner.
- **`regionMode`** — Records which consent mode was applied. Currently always `strict-global`. Preserved for future geo-layer if needed.
- **`signalSource`** — Audit trail: `banner`, `settings`, `gpc`, `migration`, or `default`.

### 6. GPC handling

**Decision:** Check `navigator.globalPrivacyControl` on page load. If `true` and no prior explicit consent exists, auto-apply "reject all non-essential" as the default state. The banner is still shown so the visitor can explicitly opt in if they wish. Explicit consent (persisted) overrides GPC per the GPC specification.

**Rationale:**
- `Sec-GPC` HTTP header cannot be read on GitHub Pages (no server-side processing).
- JS API covers all browsers that implement GPC (Firefox, Brave, extensions).
- Not persisting GPC-derived defaults avoids creating a consent record the user didn't explicitly confirm.

### 7. Vendor registry as code

**Decision:** Maintain a `VENDOR_REGISTRY` object inside `consent.js` that maps each vendor to its category, storage names, lifetimes, and policy URLs. Mirror in `docs/privacy/cookie-registry.md`.

**Rationale:**
- Single source of truth for the `shouldLoadVendor()` gate.
- Enables future auto-generation of a cookie declaration page.
- Dual documentation (code + markdown) ensures the registry is reviewable outside the codebase.

### 8. Banner UX (first layer)

Three equally prominent buttons — no dark patterns:

1. **Accept All** — sets all categories to `true`
2. **Reject Non-Essential** — sets all opt-in categories to `false`
3. **Manage Preferences** — opens granular toggle panel

**Rationale:** EU guidance (EDPB, CNIL, ICO) requires rejection to be as easy as acceptance. Three-button layout with equal visual weight is the safest compliant approach.

### 9. Withdrawal mechanism

A persistent **"Cookie Settings"** link in the `footer-legal` section of every page. Clicking it re-opens the preferences panel with current state pre-loaded. Withdrawal is as easy as granting consent (same panel, same controls).

---

## Consequences

### Positive
- Fully compliant with EU/UK opt-in requirements from day one.
- GPC honoured for US privacy law compliance.
- No new third-party dependencies.
- Small, auditable codebase (~350 lines of vanilla JS).
- Versioned schema supports future evolution.

### Negative
- Analytics data loss for visitors who reject (expected and accepted).
- YouTube videos show a consent placeholder instead of auto-playing (UX trade-off for compliance).
- Airtable contact form requires one extra click (consent gate).
- No automatic cookie scanning — new vendors must be manually registered.
- Client-side only enforcement (GitHub Pages limitation) — not enforceable against determined bypass.

### Neutral
- No SSR/hydration concerns — the site is fully static HTML with no framework.
- Consent record is not shared across subdomains (not relevant — single domain site).

---

## Alternatives Considered

| Alternative | Why rejected |
|-------------|-------------|
| **SaaS CMP (OneTrust, CookieBot)** | Adds external dependency, cost, and itself sets cookies. Overkill for 5 vendors. |
| **Geo-detection for opt-in vs opt-out** | Unreliable on static hosting; adds third-party API dependency; strictest-global is safer. |
| **Cookie (not localStorage) for consent** | Cannot control `Set-Cookie` attributes on GitHub Pages; localStorage is equivalent for static sites. |
| **TCF / IAB framework** | No programmatic ad demand on the site; TCF complexity is disproportionate. |
| **Server-side consent enforcement** | Impossible on GitHub Pages. |

---

## File Inventory

| File | Role |
|------|------|
| `assets/js/consent.js` | Core consent service, domain model, vendor registry, public API |
| `assets/js/consent-ui.js` | Banner (first layer), preferences modal (second layer), focus trap, footer link injection, a11y |
| `assets/js/consent-vendors.js` | Google Consent Mode v2, GA4 dynamic injection, YouTube facades, Airtable gating |
| `assets/css/consent.css` | Banner and preferences panel styles |
| `docs/privacy/cookie-registry.md` | Human-readable vendor/cookie registry |
| `docs/privacy/static-site-limitations.md` | Documents GPC, geo, cookie-attribute, enforcement, DNSS, and AI transparency limitations |
| `docs/adr/adr-cookie-consent.md` | This ADR |

---

## Open Items (blockers for UI work)

None. The core architecture is complete. Next steps:

1. Create `assets/css/consent.css` (banner + preferences panel styles)
2. Add banner UI rendering logic to `consent.js` (or a separate `consent-ui.js`)
3. Modify all 11 HTML files (remove inline GA, add consent script/css, add footer link)
4. Replace YouTube iframes with consent facades
5. Gate Airtable iframes behind preferences consent
6. Guard `localStorage.setItem` in `script.js`
