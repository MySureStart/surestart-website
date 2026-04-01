/**
 * SureStart Cookie Consent – Core Domain Model & Service
 *
 * Strict-global, opt-in implementation.
 * Categories: necessary | preferences | analytics | marketing
 *
 * @see /docs/adr/adr-cookie-consent.md
 * @see /docs/privacy/cookie-registry.md
 * @version 1
 */
(function (root) {
  'use strict';

  /* ================================================================
   * 1. CONSTANTS
   * ============================================================= */

  /** Current schema version – bump when categories or storage shape change. */
  var CONSENT_VERSION = 1;

  /** localStorage key (strictly necessary – stores privacy choices only). */
  var STORAGE_KEY = 'ss_consent';

  /** Ordered list of non-necessary categories. */
  var OPT_IN_CATEGORIES = ['preferences', 'analytics', 'marketing'];

  /** All categories (necessary is always true). */
  var ALL_CATEGORIES = ['necessary'].concat(OPT_IN_CATEGORIES);

  /** Valid signal sources for audit trail. */
  var SIGNAL_SOURCES = ['banner', 'settings', 'gpc', 'migration', 'default'];

  /* ================================================================
   * REGION STRATEGY ABSTRACTION
   *
   * The region strategy determines which consent mode applies:
   *
   *   'strict-global'  — EU-style opt-in for ALL visitors.  Every
   *                       non-necessary category defaults to OFF.
   *                       This is the only mode implemented today.
   *
   *   'geo-aware'       — (RESERVED, NOT IMPLEMENTED)  Would use a
   *                       server-side or client-side geo signal to
   *                       vary between opt-in (EU/UK/BR/…) and
   *                       opt-out (US states).  Requires a trusted
   *                       geo-IP service or server-side proxy that
   *                       GitHub Pages cannot provide.
   *
   * To switch strategies in the future, change ACTIVE_REGION_STRATEGY
   * and implement the corresponding `_applyRegionDefaults_<mode>()`
   * function.  The consent record stores `regionMode` so analytics
   * can attribute data correctly per regime.
   *
   * STATIC-SITE LIMITATIONS (GitHub Pages):
   *   – Cannot read Sec-GPC HTTP header (no server-side processing).
   *   – Cannot read client IP for geo-detection server-side.
   *   – Cannot set Set-Cookie response headers with Secure/HttpOnly.
   *   – Cannot enforce consent server-side; all gating is JS-only.
   *   – A determined visitor can bypass client-side consent checks.
   * ============================================================= */
  var ACTIVE_REGION_STRATEGY = 'strict-global';

  /* ================================================================
   * 2. VENDOR / COOKIE REGISTRY (single source of truth)
   * ============================================================= */

  /**
   * Each entry maps a vendor key to metadata consumed by:
   *   – consent service (shouldLoadVendor)
   *   – cookie policy page generation
   *   – banner copy helpers
   *
   * Fields:
   *   category     – one of ALL_CATEGORIES
   *   provider     – legal entity name
   *   purpose      – human-readable purpose string
   *   storageType  – 'cookie' | 'localStorage' | 'sessionStorage' | 'iframe-opaque'
   *   storageNames – array of known cookie / storage key names
   *   lifetime     – descriptive lifetime string
   *   policyUrl    – vendor privacy policy URL
   */
  var VENDOR_REGISTRY = {
    /* ---- necessary ------------------------------------------------ */
    'consent-record': {
      category: 'necessary',
      provider: 'SureStart',
      purpose: 'Stores your cookie consent preferences so we do not ask again on every page.',
      storageType: 'localStorage',
      storageNames: ['ss_consent'],
      lifetime: 'Persistent until cleared by user',
      policyUrl: null
    },

    /* ---- analytics ------------------------------------------------ */
    'google-analytics': {
      category: 'analytics',
      provider: 'Google LLC',
      purpose: 'Measures website traffic and usage patterns to help us improve the site.',
      storageType: 'cookie',
      storageNames: ['_ga', '_ga_CM0T1ZNC15', '_gid'],
      lifetime: '_ga: 2 years, _ga_*: 2 years, _gid: 24 hours',
      policyUrl: 'https://policies.google.com/privacy'
    },

    /* ---- marketing ------------------------------------------------ */
    'youtube-embed': {
      category: 'marketing',
      provider: 'Google LLC (YouTube)',
      purpose: 'Embeds YouTube videos. YouTube may set cookies to track viewing behaviour.',
      storageType: 'cookie',
      storageNames: ['YSC', 'VISITOR_INFO1_LIVE', 'GPS', 'IDE', 'CONSENT'],
      lifetime: 'YSC: session, VISITOR_INFO1_LIVE: 6 months, GPS: 30 min, IDE: 1 year',
      policyUrl: 'https://policies.google.com/privacy'
    },

    /* ---- preferences (functional) --------------------------------- */
    'airtable-embed': {
      category: 'preferences',
      provider: 'Formagrid Inc. (Airtable)',
      purpose: 'Embeds contact and enrollment forms. Airtable may set session cookies.',
      storageType: 'iframe-opaque',
      storageNames: [],
      lifetime: 'Session (exact cookies controlled by Airtable)',
      policyUrl: 'https://www.airtable.com/company/privacy'
    },
    'vibe-lab-storage': {
      category: 'preferences',
      provider: 'SureStart',
      purpose: 'Temporarily stores Vibe Lab registration data you submit so it can be sent to the server.',
      storageType: 'localStorage',
      storageNames: ['vibeLabRegistration'],
      lifetime: 'Persistent until cleared by user',
      policyUrl: null
    }
  };

  /* ================================================================
   * 3. DEFAULT CONSENT STATE FACTORY
   * ============================================================= */

  /**
   * Builds a blank consent record with every non-necessary category
   * set to false (opt-in default).
   *
   * @param {string} source – one of SIGNAL_SOURCES
   * @param {string} [regionMode='strict-global']
   * @returns {object}
   */
  function buildDefaultRecord(source, regionMode) {
    var categories = { necessary: true };
    for (var i = 0; i < OPT_IN_CATEGORIES.length; i++) {
      categories[OPT_IN_CATEGORIES[i]] = false;
    }
    return {
      categories: categories,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
      regionMode: regionMode || 'strict-global',
      signalSource: source || 'default'
    };
  }

  /* ================================================================
   * 4. PERSISTENCE HELPERS
   * ============================================================= */

  function readRaw() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  function writeRaw(record) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch (_) {
      // Storage full or disabled – degrade silently.
    }
  }

  function clearRaw() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {
      // Ignore.
    }
  }

  /* ================================================================
   * 5. MIGRATION
   * ============================================================= */

  /**
   * If the stored record has an older version, migrate it forward.
   * Currently only v1 exists, so this is a no-op placeholder that
   * future schema changes will populate.
   *
   * @param {object} record
   * @returns {object} migrated record (or null if unrecoverable)
   */
  function migrateIfNeeded(record) {
    if (!record || typeof record !== 'object') return null;
    if (!record.categories || typeof record.categories !== 'object') return null;

    // Ensure necessary is always true regardless of stored value.
    record.categories.necessary = true;

    // Fill any categories added in newer versions.
    for (var i = 0; i < OPT_IN_CATEGORIES.length; i++) {
      var cat = OPT_IN_CATEGORIES[i];
      if (typeof record.categories[cat] !== 'boolean') {
        record.categories[cat] = false;
      }
    }

    if (record.version !== CONSENT_VERSION) {
      record.version = CONSENT_VERSION;
      record.signalSource = 'migration';
      record.timestamp = new Date().toISOString();
      writeRaw(record);
    }

    return record;
  }

  /* ================================================================
   * 6. GPC DETECTION
   * ============================================================= */

  /**
   * Returns true when the browser signals Global Privacy Control.
   * Only detectable via JS API on static hosting (no Sec-GPC header).
   */
  function detectGPC() {
    try {
      return navigator.globalPrivacyControl === true;
    } catch (_) {
      return false;
    }
  }

  /* ================================================================
   * 7. CONSENT SERVICE (public API)
   * ============================================================= */

  /** @type {object|null} cached in-memory record */
  var _cache = null;

  /** @type {Array<function>} listeners notified on consent change */
  var _listeners = [];

  /**
   * Initialises the consent service.  Must be called once on page load
   * (before any vendor scripts are conditionally injected).
   *
   * Returns the current consent record (or null if visitor has not
   * yet made a choice).
   */
  function init() {
    var stored = readRaw();
    if (stored) {
      _cache = migrateIfNeeded(stored);
      return _cache;
    }

    // Auto-apply GPC signal as a default (visitor can still override via banner).
    if (detectGPC()) {
      _cache = buildDefaultRecord('gpc', 'strict-global');
      // Do NOT persist – let the banner write the final record on interaction.
    }

    return _cache;
  }

  /**
   * Returns the full consent record, or null if no choice has been made.
   * @returns {object|null}
   */
  function getConsent() {
    return _cache;
  }

  /**
   * Returns true if consent record exists AND the category is true.
   * For 'necessary' always returns true.
   *
   * @param {string} category
   * @returns {boolean}
   */
  function hasConsent(category) {
    if (category === 'necessary') return true;
    if (!_cache || !_cache.categories) return false;
    return _cache.categories[category] === true;
  }

  /**
   * Returns true if the visitor has made an explicit choice (persisted).
   * GPC-only (not yet persisted) returns false.
   */
  function hasExplicitChoice() {
    return readRaw() !== null;
  }

  /**
   * Returns true if the named vendor should be loaded right now.
   *
   * @param {string} vendorKey – key in VENDOR_REGISTRY
   * @returns {boolean}
   */
  function shouldLoadVendor(vendorKey) {
    var entry = VENDOR_REGISTRY[vendorKey];
    if (!entry) return false;
    return hasConsent(entry.category);
  }

  /**
   * Merges partial category updates into the current record and persists.
   *
   * @param {object} partial – e.g. { analytics: true, marketing: false }
   * @param {string} source  – one of SIGNAL_SOURCES
   */
  function updateConsent(partial, source) {
    if (!_cache) {
      _cache = buildDefaultRecord(source || 'banner', 'strict-global');
    }

    var cats = _cache.categories;
    for (var key in partial) {
      if (partial.hasOwnProperty(key) && key !== 'necessary') {
        if (ALL_CATEGORIES.indexOf(key) !== -1) {
          cats[key] = !!partial[key];
        }
      }
    }
    // necessary is immutable.
    cats.necessary = true;

    _cache.timestamp = new Date().toISOString();
    _cache.signalSource = source || 'banner';
    _cache.version = CONSENT_VERSION;

    writeRaw(_cache);
    _notifyListeners();
  }

  /**
   * Convenience: set all non-necessary categories to true and persist.
   * @param {string} source
   */
  function acceptAll(source) {
    var partial = {};
    for (var i = 0; i < OPT_IN_CATEGORIES.length; i++) {
      partial[OPT_IN_CATEGORIES[i]] = true;
    }
    updateConsent(partial, source || 'banner');
  }

  /**
   * Convenience: set all non-necessary categories to false and persist.
   * @param {string} source
   */
  function rejectAll(source) {
    var partial = {};
    for (var i = 0; i < OPT_IN_CATEGORIES.length; i++) {
      partial[OPT_IN_CATEGORIES[i]] = false;
    }
    updateConsent(partial, source || 'banner');
  }

  /**
   * Clears persisted consent and in-memory cache.
   * Next page load will show the banner again.
   */
  function resetConsent() {
    clearRaw();
    _cache = null;
    _notifyListeners();
  }

  /* ================================================================
   * 8. EVENT SYSTEM
   * ============================================================= */

  /**
   * Register a callback fired whenever consent changes.
   * Callback receives the new consent record.
   *
   * @param {function} fn
   */
  function onChange(fn) {
    if (typeof fn === 'function') {
      _listeners.push(fn);
    }
  }

  function _notifyListeners() {
    for (var i = 0; i < _listeners.length; i++) {
      try {
        _listeners[i](_cache);
      } catch (_) {
        // Listener errors must not break the consent flow.
      }
    }
  }

  /* ================================================================
   * 9. QUERY HELPERS
   * ============================================================= */

  /**
   * Returns an array of all vendor entries for a given category.
   * @param {string} category
   * @returns {Array<object>}
   */
  function getVendorsByCategory(category) {
    var result = [];
    for (var key in VENDOR_REGISTRY) {
      if (VENDOR_REGISTRY.hasOwnProperty(key) && VENDOR_REGISTRY[key].category === category) {
        var entry = {};
        for (var prop in VENDOR_REGISTRY[key]) {
          if (VENDOR_REGISTRY[key].hasOwnProperty(prop)) {
            entry[prop] = VENDOR_REGISTRY[key][prop];
          }
        }
        entry.key = key;
        result.push(entry);
      }
    }
    return result;
  }

  /**
   * Returns the full vendor registry (read-only copy).
   * @returns {object}
   */
  function getVendorRegistry() {
    return VENDOR_REGISTRY;
  }

  /**
   * Returns ordered list of all category keys.
   * @returns {string[]}
   */
  function getCategories() {
    return ALL_CATEGORIES.slice();
  }

  /**
   * Returns ordered list of opt-in (non-necessary) category keys.
   * @returns {string[]}
   */
  function getOptInCategories() {
    return OPT_IN_CATEGORIES.slice();
  }

  /**
   * Returns true if GPC signal is active.
   * @returns {boolean}
   */
  function isGPCActive() {
    return detectGPC();
  }

  /* ================================================================
   * 10. PUBLIC SURFACE
   * ============================================================= */

  var SsConsent = {
    /* lifecycle */
    init: init,

    /* read */
    getConsent: getConsent,
    hasConsent: hasConsent,
    hasExplicitChoice: hasExplicitChoice,
    shouldLoadVendor: shouldLoadVendor,
    isGPCActive: isGPCActive,

    /* write */
    updateConsent: updateConsent,
    acceptAll: acceptAll,
    rejectAll: rejectAll,
    resetConsent: resetConsent,

    /* events */
    onChange: onChange,

    /* registry / meta */
    getVendorRegistry: getVendorRegistry,
    getVendorsByCategory: getVendorsByCategory,
    getCategories: getCategories,
    getOptInCategories: getOptInCategories,

    /* constants (read-only) */
    VERSION: CONSENT_VERSION,
    STORAGE_KEY: STORAGE_KEY
  };

  /* Expose globally for inline scripts and the upcoming banner UI. */
  root.SsConsent = SsConsent;

})(typeof window !== 'undefined' ? window : this);
