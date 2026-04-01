# Static-Site Privacy Limitations

> **Scope:** This document covers privacy-relevant limitations inherent to
> hosting on **GitHub Pages** (or any static CDN without server-side logic).
> These are architecture constraints, not bugs.

---

## 1. Global Privacy Control (GPC)

| Signal | Supported? | Notes |
|--------|-----------|-------|
| `navigator.globalPrivacyControl` (JS API) | ✅ Yes | Detected on page load by `consent.js`. If `true` and no prior explicit consent, all non-essential categories default to OFF. |
| `Sec-GPC: 1` HTTP header | ❌ No | GitHub Pages has no server-side request processing. The header is present in the browser's request but cannot be read or acted upon. |

**Impact:** Visitors using browsers that only set the HTTP header (no JS API)
will not have GPC detected. As of 2026, all major GPC implementations
(Firefox, Brave, DuckDuckGo, Privacy Badger) expose the JS API, so coverage
is near-complete. The strict-global default (everything OFF) provides
equivalent protection regardless.

---

## 2. Geo-Detection / Region-Aware Consent

| Approach | Feasible? | Notes |
|----------|-----------|-------|
| Server-side IP geolocation | ❌ No | No server to inspect `X-Forwarded-For` or client IP. |
| Client-side geo API (e.g., ipinfo.io) | ⚠️ Possible but rejected | Adds latency, a new third-party dependency, and is unreliable (VPNs, proxies). |
| Cloudflare `CF-IPCountry` header | ❌ No | Only available on Cloudflare-proxied origins, not GitHub Pages. |

**Decision:** Apply **strict-global** (EU-style opt-in) to all visitors.
This is documented in `consent.js` under `ACTIVE_REGION_STRATEGY` and in
[ADR-001](../adr/adr-cookie-consent.md).

---

## 3. Cookie Attributes

| Attribute | Controllable? | Notes |
|-----------|--------------|-------|
| `HttpOnly` | ❌ No | Requires `Set-Cookie` response header. GitHub Pages cannot set custom response headers. |
| `Secure` | ✅ Partial | GitHub Pages serves over HTTPS, so browser-set cookies inherit `Secure` context. But we cannot explicitly set the flag server-side. |
| `SameSite` | ❌ No | Cannot be controlled without `Set-Cookie` header. |
| `Domain` / `Path` | ❌ No | Same reason. |

**Mitigation:** The consent record is stored in `localStorage` (same-origin
only, no network transmission) rather than cookies. Third-party cookies
(GA, YouTube) are set by vendor scripts that we gate behind consent — we
cannot control their attributes, but we prevent them from loading at all
until consent is granted.

---

## 4. Server-Side Consent Enforcement

| Scenario | Enforceable? | Notes |
|----------|-------------|-------|
| Blocking scripts before HTML parse | ⚠️ Partial | Our consent scripts run synchronously before vendor `<script>` tags, but a determined visitor could bypass JS-based gating by disabling our scripts. |
| Stripping cookies from responses | ❌ No | No server-side processing. |
| Blocking third-party requests at network level | ❌ No | Only the browser can do this (e.g., via Content Security Policy, which we can set via `<meta>` tag but not dynamically per consent state). |

**Mitigation:** Client-side gating is the best-effort approach for static
sites. The consent banner prevents vendor scripts from being injected into
the DOM, which prevents the vast majority of cookie-setting. This is the
same approach used by all static-site CMPs.

---

## 5. "Do Not Sell or Share" Link

The site does **not** sell, share, or use personal information for
cross-context behavioural advertising. Specifically:

- No ad network pixels (Meta, LinkedIn, TikTok, etc.)
- No remarketing or retargeting tags
- No data broker integrations
- No cross-site tracking beyond YouTube embeds (gated behind `marketing` consent)
- GA4 is configured with `ads_data_redaction: true` and all `ad_*` consent
  signals default to `denied`

Therefore, a CCPA/CPRA "Do Not Sell or Share My Personal Information" link
is **not legally required**. If the site adds advertising or data-sharing
vendors in the future, this link must be added to the footer.

---

## 6. AI Transparency

The website **does not use AI features** on the visitor-facing side:

- No chatbot or virtual assistant
- No AI-generated content displayed to visitors
- No AI-powered personalisation or recommendation engine
- No automated decision-making affecting visitors

The site is *about* AI education (SureStart teaches AI to students), but the
website itself is a static HTML marketing site with no AI-powered
interactions. No AI transparency notices, EU AI Act disclosures, or automated
decision-making (GDPR Art. 22) notices are required for the website.

If AI features are added to the site in the future (e.g., a chatbot, AI
search, content recommendation), the following should be implemented:

1. A visible notice identifying the AI system and its purpose
2. A link to information about how the AI system works
3. For chatbots: clear labelling that the user is interacting with an AI
4. For automated decisions: information about the logic involved and the
   right to human review

---

## Summary

| Limitation | Risk Level | Mitigation |
|-----------|-----------|-----------|
| No `Sec-GPC` header reading | Low | JS API covers all major GPC browsers; strict-global default provides equivalent protection |
| No geo-detection | Low | Strict-global applies EU rules to everyone (over-protective, not under-) |
| No `HttpOnly`/`SameSite` on consent cookie | Low | localStorage used instead (same-origin, no network exposure) |
| No server-side enforcement | Medium | Client-side gating is industry standard for static sites; vendor scripts never injected without consent |
| JS bypass possible | Low | Requires active user effort; not a realistic compliance risk |
