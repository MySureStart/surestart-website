/**
 * SureStart Cookie Consent – Vendor Gating & Google Consent Mode v2
 *
 * Handles:
 *   1. Google Consent Mode v2 default-denied state (before any tag)
 *   2. GA4 dynamic injection on analytics consent
 *   3. YouTube iframe → privacy-facade replacement
 *   4. Airtable iframe gating behind preferences consent
 *   5. Custom event wiring to SsConsent.onChange()
 *
 * Depends on: window.SsConsent (consent.js) — loaded first.
 *             window.SsConsentUI (consent-ui.js) — loaded second.
 *
 * Current Google setup: gtag.js (G-CM0T1ZNC15), NOT GTM container.
 *
 * @see /docs/adr/adr-cookie-consent.md
 * @see /docs/privacy/cookie-registry.md
 * @version 1
 */
(function (root, doc) {
  'use strict';

  var C = root.SsConsent;
  if (!C) return;

  /* ================================================================
   * CONFIG
   * ============================================================= */

  var GA_MEASUREMENT_ID = 'G-CM0T1ZNC15';

  /**
   * When true, Google receives cookieless pings (modelled data) even
   * before consent.  Set to false for basic/privacy-conservative mode.
   * Flip to true only after legal review of Google Advanced Consent Mode.
   */
  var GOOGLE_ADVANCED_CONSENT_MODE = false;

  /* ================================================================
   * 1. GOOGLE CONSENT MODE v2 — DEFAULT DENIED
   *
   * This MUST run before gtag('config', ...) or any Google tag.
   * We push the default command onto dataLayer immediately.
   * ============================================================= */

  root.dataLayer = root.dataLayer || [];
  function gtag() { root.dataLayer.push(arguments); }

  // Establish denied defaults before any Google script loads.
  gtag('consent', 'default', {
    'analytics_storage':        'denied',
    'ad_storage':               'denied',
    'ad_user_data':             'denied',
    'ad_personalization':       'denied',
    'functionality_storage':    'denied',
    'personalization_storage':  'denied',
    'security_storage':         'granted',   // strictly necessary
    'wait_for_update':          500          // ms to wait for consent update
  });

  // If advanced mode is disabled, tell Google not to send cookieless pings.
  if (!GOOGLE_ADVANCED_CONSENT_MODE) {
    gtag('set', 'url_passthrough', false);
    gtag('set', 'ads_data_redaction', true);
  }

  /* ================================================================
   * 2. CONSENT → GOOGLE CONSENT MODE SIGNAL MAPPER
   * ============================================================= */

  /**
   * Maps SsConsent categories to Google Consent Mode v2 signals.
   * Called on every consent change.
   */
  function syncGoogleConsentMode() {
    var hasAnalytics  = C.hasConsent('analytics');
    var hasMarketing  = C.hasConsent('marketing');
    var hasPrefs      = C.hasConsent('preferences');

    gtag('consent', 'update', {
      'analytics_storage':        hasAnalytics ? 'granted' : 'denied',
      'ad_storage':               hasMarketing ? 'granted' : 'denied',
      'ad_user_data':             hasMarketing ? 'granted' : 'denied',
      'ad_personalization':       hasMarketing ? 'granted' : 'denied',
      'functionality_storage':    hasPrefs     ? 'granted' : 'denied',
      'personalization_storage':  hasPrefs     ? 'granted' : 'denied'
    });
  }

  /* ================================================================
   * 3. GA4 DYNAMIC INJECTION
   * ============================================================= */

  var _gaInjected = false;

  function injectGA4() {
    if (_gaInjected) return;
    if (!C.hasConsent('analytics')) return;

    _gaInjected = true;

    // Inject the gtag.js script
    var script = doc.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    doc.head.appendChild(script);

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      'send_page_view': true
    });
  }

  /* ================================================================
   * 4. YOUTUBE FACADES (click-to-load)
   * ============================================================= */

  /**
   * Scans for YouTube iframes and replaces them with privacy facades.
   * On marketing consent, swaps facades back to real iframes using
   * youtube-nocookie.com.
   */
  function initYouTubeFacades() {
    // Match both src and data-src (data-src used to prevent browser preloading before consent)
    var iframes = doc.querySelectorAll('iframe[src*="youtube.com/embed"], iframe[data-src*="youtube.com/embed"]');
    for (var i = 0; i < iframes.length; i++) {
      replaceYouTubeIframe(iframes[i]);
    }
  }

  function replaceYouTubeIframe(iframe) {
    var src = iframe.getAttribute('src') || iframe.getAttribute('data-src') || '';
    var title = iframe.getAttribute('title') || 'Video';

    // Convert to nocookie URL for when consent is granted
    var nocookieSrc = src
      .replace('www.youtube.com', 'www.youtube-nocookie.com')
      .replace('youtube.com', 'www.youtube-nocookie.com');

    // Extract video ID for thumbnail
    var videoId = '';
    var match = src.match(/embed\/([a-zA-Z0-9_-]+)/);
    if (match) videoId = match[1];

    // Build facade
    var facade = doc.createElement('div');
    facade.className = 'cc-yt-facade';
    facade.setAttribute('role', 'region');
    facade.setAttribute('aria-label', title);
    facade.setAttribute('data-yt-src', nocookieSrc);
    facade.setAttribute('data-yt-title', title);

    // Copy sizing from original iframe
    var parent = iframe.parentNode;
    facade.style.width = iframe.style.width || '100%';
    facade.style.aspectRatio = '16 / 9';
    facade.style.position = 'relative';
    facade.style.background = '#000';
    facade.style.borderRadius = '8px';
    facade.style.overflow = 'hidden';
    facade.style.display = 'flex';
    facade.style.alignItems = 'center';
    facade.style.justifyContent = 'center';
    facade.style.cursor = 'pointer';

    // Thumbnail: store URL in data attribute; do NOT load from YouTube before consent
    if (videoId) {
      facade.setAttribute('data-yt-thumb', 'https://img.youtube.com/vi/' + videoId + '/hqdefault.jpg');
    }

    // Overlay content
    var overlay = doc.createElement('div');
    overlay.style.cssText = 'position:relative;z-index:1;text-align:center;padding:1.5rem;color:#fff;max-width:320px;';

    // Play icon
    var playSvg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
    playSvg.setAttribute('width', '48');
    playSvg.setAttribute('height', '48');
    playSvg.setAttribute('viewBox', '0 0 24 24');
    playSvg.setAttribute('fill', 'white');
    playSvg.setAttribute('aria-hidden', 'true');
    playSvg.style.cssText = 'margin-bottom:0.75rem;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4));';
    var path = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M8 5v14l11-7z');
    playSvg.appendChild(path);
    overlay.appendChild(playSvg);

    // Notice text
    var notice = doc.createElement('p');
    notice.textContent = 'This video is hosted by YouTube. Playing it may set third-party cookies.';
    notice.style.cssText = 'font-size:0.8125rem;line-height:1.5;margin:0 0 0.75rem;text-shadow:0 1px 2px rgba(0,0,0,0.5);';
    overlay.appendChild(notice);

    // Load button
    var btn = doc.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Load Video';
    btn.className = 'cc-btn cc-btn--load';
    btn.style.cssText = 'font-size:0.8125rem;padding:0.5rem 1rem;min-height:36px;flex:none;';
    btn.setAttribute('aria-label', 'Load ' + title + ' from YouTube');
    overlay.appendChild(btn);

    facade.appendChild(overlay);

    // Click handler: grant marketing consent + load video
    function loadVideo() {
      if (!C.hasConsent('marketing')) {
        C.updateConsent({ marketing: true }, 'banner');
        syncGoogleConsentMode();
      }
      activateYouTubeFacade(facade);
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      loadVideo();
    });
    facade.addEventListener('click', loadVideo);

    // Replace iframe
    parent.replaceChild(facade, iframe);

    // If marketing consent already granted, activate immediately
    if (C.hasConsent('marketing')) {
      activateYouTubeFacade(facade);
    }
  }

  function activateYouTubeFacade(facade) {
    var src = facade.getAttribute('data-yt-src');
    var title = facade.getAttribute('data-yt-title') || 'Video';
    if (!src) return;

    var iframe = doc.createElement('iframe');
    iframe.src = src;
    iframe.title = title;
    iframe.frameBorder = '0';
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    iframe.setAttribute('allowfullscreen', '');
    iframe.style.cssText = 'width:100%;height:100%;position:absolute;inset:0;border:none;';

    // Wrap in a container that maintains aspect ratio
    var wrapper = doc.createElement('div');
    wrapper.style.cssText = 'position:relative;width:100%;aspect-ratio:16/9;border-radius:8px;overflow:hidden;';
    wrapper.appendChild(iframe);

    facade.parentNode.replaceChild(wrapper, facade);
  }

  /**
   * Activate all remaining YouTube facades on the page.
   */
  function activateAllYouTubeFacades() {
    var facades = doc.querySelectorAll('.cc-yt-facade');
    for (var i = 0; i < facades.length; i++) {
      activateYouTubeFacade(facades[i]);
    }
  }

  /* ================================================================
   * 5. AIRTABLE IFRAME GATING
   * ============================================================= */

  /**
   * For iframes with data-src (already lazy), we gate the src swap.
   * For iframes with src pointing to airtable.com, we move src→data-src
   * and show a placeholder.
   */
  function initAirtableGating() {
    // Direct-src Airtable iframes (contact page)
    var directIframes = doc.querySelectorAll('iframe[src*="airtable.com"]');
    for (var i = 0; i < directIframes.length; i++) {
      gateAirtableIframe(directIframes[i]);
    }

    // Lazy-loaded Airtable iframes (for-students popups)
    // These already use data-src; we intercept the popup open logic.
    // The existing initPopupModals() in script.js copies data-src→src on open.
    // We wrap that by listening for the popup open and gating the load.
    interceptAirtablePopups();
  }

  function gateAirtableIframe(iframe) {
    if (!C.hasConsent('preferences')) {
      // Move src to data-src to prevent loading
      var src = iframe.getAttribute('src');
      if (src) {
        iframe.setAttribute('data-src', src);
        iframe.removeAttribute('src');
      }

      // Create placeholder
      var placeholder = doc.createElement('div');
      placeholder.className = 'cc-airtable-placeholder';
      placeholder.setAttribute('role', 'region');
      placeholder.setAttribute('aria-label', 'Contact form');
      placeholder.style.cssText = 'background:#f8f8f8;border:1px solid #e0e0e0;border-radius:8px;padding:2rem;text-align:center;min-height:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.75rem;';

      var notice = doc.createElement('p');
      notice.textContent = 'This form is provided by Airtable. Loading it may set third-party cookies.';
      notice.style.cssText = 'font-size:0.875rem;color:#555;margin:0;max-width:360px;line-height:1.5;';

      var btn = doc.createElement('button');
      btn.type = 'button';
      btn.textContent = 'Load Form';
    btn.className = 'cc-btn cc-btn--load';
    btn.style.cssText = 'font-size:0.875rem;padding:0.5rem 1.25rem;min-height:40px;flex:none;';

    btn.addEventListener('click', function () {
      if (!C.hasConsent('preferences')) {
        C.updateConsent({ preferences: true }, 'banner');
        syncGoogleConsentMode();
      }
      activateAirtableIframe(iframe, placeholder);
      });

      placeholder.appendChild(notice);
      placeholder.appendChild(btn);

      iframe.style.display = 'none';
      iframe.parentNode.insertBefore(placeholder, iframe);
    }
  }

  function activateAirtableIframe(iframe, placeholder) {
    var src = iframe.getAttribute('data-src');
    if (src) {
      iframe.setAttribute('src', src);
    }
    iframe.style.display = '';
    if (placeholder && placeholder.parentNode) {
      placeholder.parentNode.removeChild(placeholder);
    }
  }

  /**
   * Intercept the existing popup modal logic to gate Airtable iframe loading.
   * The for-students page uses data-src iframes inside popup modals.
   * We listen for the popup 'active' class and gate the src swap.
   */
  function interceptAirtablePopups() {
    // Override iframe src setting inside popup modals
    var popupOverlays = doc.querySelectorAll('.notify-popup-overlay');
    popupOverlays.forEach(function (overlay) {
      var iframe = overlay.querySelector('iframe.airtable-embed');
      if (!iframe) return;

      // Observe for the overlay becoming active
      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
          if (m.type === 'attributes' && m.attributeName === 'class') {
            if (overlay.classList.contains('active') && iframe.dataset.src && !iframe.getAttribute('src')) {
              if (C.hasConsent('preferences')) {
                iframe.setAttribute('src', iframe.dataset.src);
              } else {
                // Show inline consent prompt inside the popup
                showInlineAirtableConsent(iframe, overlay);
              }
            }
          }
        });
      });
      observer.observe(overlay, { attributes: true });
    });
  }

  function showInlineAirtableConsent(iframe, overlay) {
    // Check if prompt already exists
    if (overlay.querySelector('.cc-airtable-inline')) return;

    var container = iframe.parentNode;
    var prompt = doc.createElement('div');
    prompt.className = 'cc-airtable-inline';
    prompt.style.cssText = 'text-align:center;padding:2rem;';

    var notice = doc.createElement('p');
    notice.textContent = 'This form is provided by Airtable. Loading it may set third-party cookies.';
    notice.style.cssText = 'font-size:0.875rem;color:#555;margin:0 0 1rem;line-height:1.5;';

    var btn = doc.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Load Form';
    btn.className = 'cc-btn cc-btn--load';
    btn.style.cssText = 'font-size:0.875rem;padding:0.5rem 1.25rem;min-height:40px;';

    btn.addEventListener('click', function () {
      if (!C.hasConsent('preferences')) {
        C.updateConsent({ preferences: true }, 'banner');
        syncGoogleConsentMode();
      }
      if (iframe.dataset.src) {
        iframe.setAttribute('src', iframe.dataset.src);
      }
      if (prompt.parentNode) {
        prompt.parentNode.removeChild(prompt);
      }
    });

    prompt.appendChild(notice);
    prompt.appendChild(btn);
    container.insertBefore(prompt, iframe);
  }

  /**
   * Activate all gated Airtable iframes on the page.
   */
  function activateAllAirtableIframes() {
    // Direct-gated iframes (contact page)
    var placeholders = doc.querySelectorAll('.cc-airtable-placeholder');
    for (var i = 0; i < placeholders.length; i++) {
      var ph = placeholders[i];
      var iframe = ph.nextElementSibling;
      if (iframe && iframe.tagName === 'IFRAME') {
        activateAirtableIframe(iframe, ph);
      }
    }

    // Inline prompts in popups
    var inlines = doc.querySelectorAll('.cc-airtable-inline');
    for (var j = 0; j < inlines.length; j++) {
      var inline = inlines[j];
      var iframeInPopup = inline.parentNode.querySelector('iframe.airtable-embed');
      if (iframeInPopup && iframeInPopup.dataset.src) {
        iframeInPopup.setAttribute('src', iframeInPopup.dataset.src);
      }
      if (inline.parentNode) inline.parentNode.removeChild(inline);
    }
  }

  /* ================================================================
   * 6. COOKIE CLEANUP ON CONSENT WITHDRAWAL
   * ============================================================= */

  /**
   * Deletes GA cookies (_ga, _ga_*, _gid) when analytics consent is
   * revoked. These are first-party cookies set by GA's JavaScript,
   * so we can delete them by setting an expired date.
   *
   * We try multiple domain variants (bare domain, with leading dot,
   * and current hostname) to cover how GA may have set them.
   */
  function deleteGACookies() {
    var cookieNames = [];
    // Gather all cookies whose name starts with _ga or equals _gid
    var allCookies = doc.cookie.split(';');
    for (var i = 0; i < allCookies.length; i++) {
      var name = allCookies[i].split('=')[0].trim();
      if (name === '_gid' || name.indexOf('_ga') === 0) {
        cookieNames.push(name);
      }
    }
    // Delete each cookie across likely domain/path combos
    var hostname = root.location.hostname;
    var domains = ['', hostname];
    // Add bare domain (e.g., "mysurestart.org" from "www.mysurestart.org")
    var parts = hostname.split('.');
    if (parts.length > 2) {
      domains.push(parts.slice(1).join('.'));
      domains.push('.' + parts.slice(1).join('.'));
    }
    domains.push('.' + hostname);

    for (var c = 0; c < cookieNames.length; c++) {
      for (var d = 0; d < domains.length; d++) {
        var domainPart = domains[d] ? '; domain=' + domains[d] : '';
        doc.cookie = cookieNames[c] + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + domainPart;
      }
    }
  }

  /* ================================================================
   * 7. CONSENT CHANGE HANDLER
   * ============================================================= */

  function onConsentChange(record) {
    // Sync Google Consent Mode signals
    syncGoogleConsentMode();

    // Conditionally inject/activate vendors
    if (C.hasConsent('analytics')) {
      injectGA4();
    } else {
      // Analytics consent revoked — clean up GA cookies
      deleteGACookies();
    }

    if (C.hasConsent('marketing')) {
      activateAllYouTubeFacades();
    }

    if (C.hasConsent('preferences')) {
      activateAllAirtableIframes();
    }
  }

  /* ================================================================
   * 7. BOOT
   * ============================================================= */

  function boot() {
    // Replace YouTube iframes with facades (must run before consent check
    // because iframes are in the DOM and already making requests)
    initYouTubeFacades();

    // Gate Airtable iframes
    initAirtableGating();

    // Register for consent changes
    C.onChange(onConsentChange);

    // Also listen for the custom event from consent-ui.js
    doc.addEventListener('ss:consent-updated', function () {
      onConsentChange(C.getConsent());
    });

    // If consent already exists (returning visitor), apply immediately
    if (C.hasExplicitChoice()) {
      syncGoogleConsentMode();
      if (C.hasConsent('analytics')) {
        injectGA4();
      } else {
        // Clean up any lingering GA cookies from a previous session
        deleteGACookies();
      }
      if (C.hasConsent('marketing')) activateAllYouTubeFacades();
      if (C.hasConsent('preferences')) activateAllAirtableIframes();
    }

    // Belt-and-braces: when `preferences` consent is already granted, re-assert
    // the src of any Airtable iframe that was left un-gated (i.e. iframes
    // rendered with a live `src`, not replaced by a placeholder). Some
    // browsers fail to kick off the network request for a cross-origin
    // iframe when the page is reached via same-site link navigation with
    // a query string rather than a fresh reload; re-setting `src` reliably
    // triggers the fetch without affecting already-loaded iframes.
    if (C.hasConsent('preferences')) {
      var liveAirtables = doc.querySelectorAll('iframe.airtable-embed[src*="airtable.com"]');
      for (var la = 0; la < liveAirtables.length; la++) {
        var reSrc = liveAirtables[la].getAttribute('src');
        if (reSrc) liveAirtables[la].setAttribute('src', reSrc);
      }
    }
  }

  // Run when DOM is ready
  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})(typeof window !== 'undefined' ? window : this, document);
