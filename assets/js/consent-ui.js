/**
 * SureStart Cookie Consent – UI Layer
 *
 * Renders banner (first layer), preferences modal (second layer),
 * wires footer "Cookie Settings" link, and manages accessibility.
 *
 * Depends on: window.SsConsent (consent.js must be loaded first).
 *
 * @see /docs/adr/adr-cookie-consent.md
 * @version 1
 */
(function (root, doc) {
  'use strict';

  /* ================================================================
   * 0. GUARD – wait for SsConsent
   * ============================================================= */
  var C = root.SsConsent;
  if (!C) {
    // eslint-disable-next-line no-console
    console.warn('[consent-ui] SsConsent not found. Load consent.js first.');
    return;
  }

  /* ================================================================
   * 1. COPY / LOCALISATION SLOTS
   *
   * All user-facing text lives here. Swap this object to localise.
   * ============================================================= */
  var COPY = {
    /* Banner (first layer) */
    bannerText: 'We use cookies and similar technologies to analyse site usage and embed content from third parties. ' +
      'Some are essential; others require your consent.',
    bannerTextGPC: 'We use cookies and similar technologies to analyse site usage and embed content from third parties. ' +
      'Your browser is sending a Global Privacy Control signal — we have honoured it by defaulting non-essential cookies to off.',
    bannerAccept: 'Accept All',
    bannerReject: 'Reject Non-Essential',
    bannerManage: 'Manage Preferences',

    /* Modal (second layer) */
    modalTitle: 'Cookie Preferences',
    modalDescription: 'Choose which categories of cookies and similar technologies you allow. ' +
      'Your choices are saved and you can change them at any time via the "Cookie Settings" link in the footer.',
    modalSave: 'Save Preferences',
    modalAcceptAll: 'Accept All',
    modalRejectAll: 'Reject All Non-Essential',

    /* GPC notice */
    gpcNotice: 'Your browser is sending a Global Privacy Control signal. ' +
      'We have defaulted non-essential cookies to off. You may still opt in below if you wish.',

    /* Categories */
    categories: {
      necessary: {
        name: 'Strictly Necessary',
        description: 'Core site functionality and storing your privacy choices. These cannot be disabled.'
      },
      preferences: {
        name: 'Preferences',
        description: 'Third-party forms (Airtable) used for contact and enrollment, and temporary form data storage.'
      },
      analytics: {
        name: 'Analytics',
        description: 'Google Analytics — helps us understand how visitors use the site so we can improve it.'
      },
      marketing: {
        name: 'Marketing',
        description: 'YouTube video embeds that may set third-party cookies to personalise ads and track viewing.'
      }
    },

    alwaysOn: 'Always On',

    /* Footer link */
    footerLink: 'Cookie Settings'
  };

  /* ================================================================
   * 2. DOM CREATION HELPERS
   * ============================================================= */
  function el(tag, attrs, children) {
    var node = doc.createElement(tag);
    if (attrs) {
      for (var key in attrs) {
        if (!attrs.hasOwnProperty(key)) continue;
        if (key === 'className') { node.className = attrs[key]; }
        else if (key === 'textContent') { node.textContent = attrs[key]; }
        else if (key === 'innerHTML') { node.innerHTML = attrs[key]; }
        else { node.setAttribute(key, attrs[key]); }
      }
    }
    if (children) {
      for (var i = 0; i < children.length; i++) {
        if (typeof children[i] === 'string') {
          node.appendChild(doc.createTextNode(children[i]));
        } else if (children[i]) {
          node.appendChild(children[i]);
        }
      }
    }
    return node;
  }

  /* ================================================================
   * 3. FOCUS TRAP
   * ============================================================= */
  var _trapRoot = null;

  function trapFocus(container) {
    _trapRoot = container;
    doc.addEventListener('keydown', _handleTrapKey, true);
    // Focus first focusable
    var first = _getFocusables(container)[0];
    if (first) first.focus();
  }

  function releaseFocus() {
    doc.removeEventListener('keydown', _handleTrapKey, true);
    _trapRoot = null;
  }

  function _handleTrapKey(e) {
    if (!_trapRoot) return;
    if (e.key === 'Tab' || e.keyCode === 9) {
      var focusables = _getFocusables(_trapRoot);
      if (focusables.length === 0) { e.preventDefault(); return; }
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (doc.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
  }

  function _getFocusables(container) {
    var sel = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
    var nodes = container.querySelectorAll(sel);
    var arr = [];
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].offsetParent !== null) arr.push(nodes[i]); // visible only
    }
    return arr;
  }

  /* ================================================================
   * 4. BANNER (first layer)
   * ============================================================= */
  var _banner = null;
  var _bannerReturnFocus = null;

  function buildBanner() {
    var wrapper = el('div', { className: 'cc-banner', role: 'dialog', 'aria-label': 'Cookie consent', 'aria-modal': 'false' });
    var inner = el('div', { className: 'cc-banner-inner' });

    // Use GPC-aware copy when the browser signals Global Privacy Control
    var bannerCopy = C.isGPCActive() ? COPY.bannerTextGPC : COPY.bannerText;
    var text = el('p', { className: 'cc-banner-text', innerHTML: bannerCopy });
    inner.appendChild(text);

    // Show small GPC badge when signal is active
    if (C.isGPCActive()) {
      var gpcBadge = el('div', { className: 'cc-gpc-badge', 'aria-label': 'Global Privacy Control detected' });
      gpcBadge.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg> GPC honoured';
      inner.appendChild(gpcBadge);
    }

    var actions = el('div', { className: 'cc-banner-actions' });

    var btnAccept = el('button', { className: 'cc-btn cc-btn--accept', type: 'button', textContent: COPY.bannerAccept });
    btnAccept.addEventListener('click', function () { C.acceptAll('banner'); hideBanner(); applyConsent(); });

    var btnReject = el('button', { className: 'cc-btn cc-btn--reject', type: 'button', textContent: COPY.bannerReject });
    btnReject.addEventListener('click', function () { C.rejectAll('banner'); hideBanner(); applyConsent(); });

    var btnManage = el('button', { className: 'cc-btn cc-btn--manage', type: 'button', textContent: COPY.bannerManage });
    btnManage.addEventListener('click', function () { hideBanner(); showModal('banner'); });

    actions.appendChild(btnAccept);
    actions.appendChild(btnReject);
    actions.appendChild(btnManage);
    inner.appendChild(actions);
    wrapper.appendChild(inner);

    return wrapper;
  }

  function showBanner() {
    if (!_banner) {
      _banner = buildBanner();
      doc.body.appendChild(_banner);
    }
    _bannerReturnFocus = doc.activeElement;
    // Force reflow before adding class
    void _banner.offsetHeight;
    _banner.classList.add('cc-visible');
    // Focus the first button for keyboard users
    var first = _banner.querySelector('button');
    if (first) first.focus();
  }

  function hideBanner() {
    if (_banner) {
      _banner.classList.remove('cc-visible');
    }
    if (_bannerReturnFocus && _bannerReturnFocus.focus) {
      try { _bannerReturnFocus.focus(); } catch (_) {}
      _bannerReturnFocus = null;
    }
  }

  /* ================================================================
   * 5. PREFERENCES MODAL (second layer)
   * ============================================================= */
  var _overlay = null;
  var _modal = null;
  var _modalToggles = {};
  var _modalReturnFocus = null;

  function buildOverlay() {
    var ov = el('div', { className: 'cc-overlay' });
    ov.addEventListener('click', function () {
      // Clicking overlay does NOT dismiss if opened from banner (no implicit consent).
      // If opened from footer settings link, it can close (user already made a choice).
      if (C.hasExplicitChoice()) {
        hideModal();
      }
    });
    return ov;
  }

  function buildModal() {
    var wrapper = el('div', { className: 'cc-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': COPY.modalTitle });

    /* Header */
    var header = el('div', { className: 'cc-modal-header' });
    header.appendChild(el('h2', { className: 'cc-modal-title', textContent: COPY.modalTitle }));

    var closeBtn = el('button', { className: 'cc-modal-close', type: 'button', 'aria-label': 'Close preferences' });
    closeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    closeBtn.addEventListener('click', function () {
      // Close only saves if user has prior explicit choice; otherwise they must use Save/Accept/Reject.
      if (C.hasExplicitChoice()) {
        hideModal();
      }
    });
    header.appendChild(closeBtn);
    wrapper.appendChild(header);

    /* Body */
    var body = el('div', { className: 'cc-modal-body' });
    body.appendChild(el('p', { className: 'cc-modal-description', textContent: COPY.modalDescription }));

    /* GPC notice (conditionally visible) */
    if (C.isGPCActive()) {
      body.appendChild(el('div', { className: 'cc-gpc-notice', textContent: COPY.gpcNotice }));
    }

    /* Category rows */
    var allCats = C.getCategories();
    for (var i = 0; i < allCats.length; i++) {
      var cat = allCats[i];
      var copyData = COPY.categories[cat] || { name: cat, description: '' };
      var isNecessary = (cat === 'necessary');

      var row = el('div', { className: 'cc-category' });
      var rowHeader = el('div', { className: 'cc-category-header' });
      var info = el('div', { className: 'cc-category-info' });
      info.appendChild(el('div', { className: 'cc-category-name', textContent: copyData.name }));
      info.appendChild(el('p', { className: 'cc-category-description', textContent: copyData.description }));
      rowHeader.appendChild(info);

      if (isNecessary) {
        rowHeader.appendChild(el('span', { className: 'cc-always-on', textContent: COPY.alwaysOn }));
      } else {
        var toggle = _buildToggle(cat, false);
        _modalToggles[cat] = toggle.input;
        rowHeader.appendChild(toggle.wrapper);
      }

      row.appendChild(rowHeader);
      body.appendChild(row);
    }
    wrapper.appendChild(body);

    /* Footer */
    var footer = el('div', { className: 'cc-modal-footer' });

    var btnRejectAll = el('button', { className: 'cc-btn cc-btn--reject', type: 'button', textContent: COPY.modalRejectAll });
    btnRejectAll.addEventListener('click', function () {
      C.rejectAll('settings');
      hideModal();
      applyConsent();
    });

    var btnSave = el('button', { className: 'cc-btn cc-btn--accept', type: 'button', textContent: COPY.modalSave });
    btnSave.addEventListener('click', function () {
      var partial = {};
      for (var key in _modalToggles) {
        if (_modalToggles.hasOwnProperty(key)) {
          partial[key] = _modalToggles[key].checked;
        }
      }
      C.updateConsent(partial, _modalReturnFocus ? 'settings' : 'banner');
      hideModal();
      applyConsent();
    });

    var btnAcceptAll = el('button', { className: 'cc-btn cc-btn--accept', type: 'button', textContent: COPY.modalAcceptAll });
    btnAcceptAll.addEventListener('click', function () {
      C.acceptAll('settings');
      hideModal();
      applyConsent();
    });

    footer.appendChild(btnRejectAll);
    footer.appendChild(btnSave);
    footer.appendChild(btnAcceptAll);
    wrapper.appendChild(footer);

    return wrapper;
  }

  function _buildToggle(category, checked) {
    var wrapper = el('div', { className: 'cc-toggle' });
    var input = doc.createElement('input');
    input.type = 'checkbox';
    input.checked = !!checked;
    input.id = 'cc-toggle-' + category;
    input.setAttribute('aria-label', (COPY.categories[category] || {}).name || category);

    var label = el('label', { className: 'cc-toggle-track', 'for': 'cc-toggle-' + category });

    wrapper.appendChild(input);
    wrapper.appendChild(label);
    return { wrapper: wrapper, input: input };
  }

  function _syncToggles() {
    var consent = C.getConsent();
    for (var key in _modalToggles) {
      if (_modalToggles.hasOwnProperty(key)) {
        _modalToggles[key].checked = consent ? !!consent.categories[key] : false;
      }
    }
  }

  function showModal(source) {
    if (!_overlay) {
      _overlay = buildOverlay();
      doc.body.appendChild(_overlay);
    }
    if (!_modal) {
      _modal = buildModal();
      doc.body.appendChild(_modal);
    }

    _syncToggles();

    _modalReturnFocus = doc.activeElement;

    // Show
    void _overlay.offsetHeight;
    _overlay.classList.add('cc-visible');
    _modal.classList.add('cc-visible');
    doc.body.style.overflow = 'hidden';

    // Close button visibility: hide X if no prior explicit choice (force use of buttons)
    var closeBtn = _modal.querySelector('.cc-modal-close');
    if (closeBtn) {
      closeBtn.style.display = C.hasExplicitChoice() ? '' : 'none';
    }

    // Focus trap
    trapFocus(_modal);

    // Escape key
    doc.addEventListener('keydown', _handleModalEscape);
  }

  function hideModal() {
    if (_overlay) _overlay.classList.remove('cc-visible');
    if (_modal) _modal.classList.remove('cc-visible');
    doc.body.style.overflow = '';
    releaseFocus();
    doc.removeEventListener('keydown', _handleModalEscape);

    if (_modalReturnFocus && _modalReturnFocus.focus) {
      try { _modalReturnFocus.focus(); } catch (_) {}
      _modalReturnFocus = null;
    }
  }

  function _handleModalEscape(e) {
    if (e.key === 'Escape' || e.keyCode === 27) {
      // Only allow Escape-close if user already has an explicit choice
      if (C.hasExplicitChoice()) {
        hideModal();
      }
    }
  }

  /* ================================================================
   * 6. FOOTER LINK INJECTION
   * ============================================================= */
  function injectFooterLinks() {
    var legals = doc.querySelectorAll('.footer-legal');
    for (var i = 0; i < legals.length; i++) {
      var container = legals[i];
      // Skip if already injected
      if (container.querySelector('.cc-footer-link')) continue;

      var sep = el('span', { textContent: '•' });
      var link = el('a', {
        href: '#',
        className: 'cc-footer-link',
        textContent: COPY.footerLink,
        role: 'button'
      });
      link.addEventListener('click', function (e) {
        e.preventDefault();
        showModal('settings');
      });

      container.appendChild(sep);
      container.appendChild(link);
    }
  }

  /* ================================================================
   * 7. CONSENT APPLICATION (fire vendor scripts)
   *
   * This is a hook point. The banner UI calls applyConsent() after
   * any consent change. Vendor-specific injection (GA, YouTube
   * facades, Airtable gates) will be wired here or via
   * SsConsent.onChange() listeners in future integration steps.
   * ============================================================= */
  function applyConsent() {
    // Dispatch a custom event so page-level scripts can react
    try {
      var evt = new CustomEvent('ss:consent-updated', { detail: C.getConsent() });
      doc.dispatchEvent(evt);
    } catch (_) {
      // IE fallback – non-critical
    }
  }

  /* ================================================================
   * 8. INITIALISATION
   * ============================================================= */
  function boot() {
    // Initialise consent service
    var record = C.init();

    // Inject footer links on every page
    injectFooterLinks();

    // Decide what to show
    if (!C.hasExplicitChoice()) {
      // No prior choice — show banner
      showBanner();
    } else {
      // Returning visitor — apply stored consent silently
      applyConsent();
    }
  }

  // Auto-boot when DOM is ready
  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* ================================================================
   * 9. PUBLIC SURFACE (for programmatic access)
   * ============================================================= */
  root.SsConsentUI = {
    showBanner: showBanner,
    hideBanner: hideBanner,
    showModal: showModal,
    hideModal: hideModal,
    COPY: COPY
  };

})(typeof window !== 'undefined' ? window : this, document);
