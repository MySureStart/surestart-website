/**
 * SEO Configuration Helper
 * 
 * Reads site configuration and detects environment for SEO-related settings.
 * 
 * Environment Detection Priority:
 *   1. SITE_ENV environment variable (explicit site environment)
 *   2. NODE_ENV environment variable (fallback)
 *   3. Defaults to 'development' if neither is set
 * 
 * Usage:
 *   const { getConfig, isProd, getRobotsDirective, buildCanonicalUrl } = require('./seo/lib/config');
 */

const fs = require('fs');
const path = require('path');

// Cache for loaded configuration
let configCache = null;

/**
 * Load and return the site configuration
 * @returns {Object} Site configuration object
 */
function getConfig() {
  if (configCache) {
    return configCache;
  }

  const configPath = path.resolve(__dirname, '../site.config.json');
  
  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    configCache = JSON.parse(configContent);
    return configCache;
  } catch (error) {
    throw new Error(`Failed to load site config from ${configPath}: ${error.message}`);
  }
}

/**
 * Get the current environment
 * Priority: SITE_ENV > NODE_ENV > 'development'
 * @returns {string} Current environment name
 */
function getEnv() {
  return process.env.SITE_ENV || process.env.NODE_ENV || 'development';
}

/**
 * Check if current environment is production
 * @returns {boolean} True if production environment
 */
function isProd() {
  const env = getEnv().toLowerCase();
  return env === 'production' || env === 'prod';
}

/**
 * Check if current environment is staging
 * @returns {boolean} True if staging environment
 */
function isStaging() {
  const env = getEnv().toLowerCase();
  return env === 'staging' || env === 'stage';
}

/**
 * Get the configured base URL
 * @returns {string} Base URL from configuration
 */
function getBaseUrl() {
  return getConfig().baseUrl;
}

/**
 * Get the appropriate robots directive based on environment
 * @returns {string} Robots directive (e.g., 'index,follow' or 'noindex,nofollow')
 */
function getRobotsDirective() {
  const config = getConfig();
  return isProd() ? config.defaultRobotsProd : config.defaultRobotsNonProd;
}

/**
 * Get the default Open Graph image path
 * @returns {string} Path to default OG image
 */
function getDefaultOgImage() {
  return getConfig().defaultOgImage;
}

/**
 * Build a canonical URL for a given path
 * Applies canonicalHostPolicy and trailingSlash settings
 * 
 * @param {string} pagePath - The page path (e.g., '/about-us' or '/about-us.html')
 * @returns {string} Full canonical URL
 */
function buildCanonicalUrl(pagePath = '/') {
  const config = getConfig();
  let baseUrl = config.baseUrl;
  
  // Apply canonical host policy
  if (config.canonicalHostPolicy === 'www') {
    // Ensure www prefix
    baseUrl = baseUrl.replace(/^(https?:\/\/)(?!www\.)/, '$1www.');
  } else if (config.canonicalHostPolicy === 'non-www') {
    // Remove www prefix
    baseUrl = baseUrl.replace(/^(https?:\/\/)www\./, '$1');
  }
  
  // Remove trailing slash from base URL for consistent joining
  baseUrl = baseUrl.replace(/\/$/, '');
  
  // Normalize the page path
  let normalizedPath = pagePath.startsWith('/') ? pagePath : '/' + pagePath;
  
  // Handle trailing slash policy (skip for root path and paths with extensions)
  const hasExtension = /\.[a-zA-Z0-9]+$/.test(normalizedPath);
  const isRoot = normalizedPath === '/';
  
  if (!isRoot && !hasExtension) {
    if (config.trailingSlash) {
      // Add trailing slash if not present
      if (!normalizedPath.endsWith('/')) {
        normalizedPath += '/';
      }
    } else {
      // Remove trailing slash if present
      normalizedPath = normalizedPath.replace(/\/$/, '');
    }
  }
  
  return baseUrl + normalizedPath;
}

/**
 * Get all configuration with environment context
 * @returns {Object} Configuration with environment info
 */
function getFullContext() {
  return {
    config: getConfig(),
    env: getEnv(),
    isProd: isProd(),
    isStaging: isStaging(),
    robotsDirective: getRobotsDirective()
  };
}

/**
 * Clear the configuration cache (useful for testing or reloading)
 */
function clearCache() {
  configCache = null;
}

module.exports = {
  getConfig,
  getEnv,
  isProd,
  isStaging,
  getBaseUrl,
  getRobotsDirective,
  getDefaultOgImage,
  buildCanonicalUrl,
  getFullContext,
  clearCache
};
