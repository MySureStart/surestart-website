#!/usr/bin/env node
/**
 * Static Site Build Script
 * 
 * Processes HTML files from /src, replaces include directives and SEO tokens,
 * and outputs to /dist.
 * 
 * Features:
 * - Processes <!-- INCLUDE:path/to/partial.html --> directives
 * - Replaces SEO tokens ({{TITLE}}, {{DESCRIPTION}}, etc.)
 * - Reads per-page overrides from sidecar .seo.json files
 * - Copies all assets (CSS, JS, images, fonts) to /dist
 * 
 * Usage:
 *   node scripts/build.js
 *   NODE_ENV=production node scripts/build.js
 */

const fs = require('fs');
const path = require('path');

// Import SEO config helper
const seoConfig = require('../seo/lib/config');

// Paths
const SRC_DIR = path.resolve(__dirname, '../src');
const DIST_DIR = path.resolve(__dirname, '../dist');
const PARTIALS_DIR = path.resolve(SRC_DIR, 'partials');

// Default SEO values (fallbacks)
const DEFAULT_SEO = {
  title: 'MySureStart',
  description: 'Empowering the next generation of AI leaders through accessible, world-class education.',
};

/**
 * Generate Organization JSON-LD from site config
 */
function generateOrganizationJsonLd() {
  const siteConfig = seoConfig.getConfig();
  const org = siteConfig.organization;
  
  if (!org) {
    return '';
  }
  
  const baseUrl = seoConfig.getBaseUrl();
  const logoUrl = org.logo?.startsWith('http') ? org.logo : baseUrl + org.logo;
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": org.name || siteConfig.siteName,
    "url": baseUrl
  };
  
  if (org.legalName) jsonLd.legalName = org.legalName;
  if (org.description) jsonLd.description = org.description;
  if (org.logo) jsonLd.logo = logoUrl;
  if (org.sameAs && org.sameAs.length > 0) jsonLd.sameAs = org.sameAs;
  
  if (org.contactPoint) {
    jsonLd.contactPoint = {
      "@type": "ContactPoint",
      "contactType": org.contactPoint.contactType || "customer service"
    };
    if (org.contactPoint.email) jsonLd.contactPoint.email = org.contactPoint.email;
    if (org.contactPoint.telephone) jsonLd.contactPoint.telephone = org.contactPoint.telephone;
  }
  
  return `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`;
}

/**
 * Generate BreadcrumbList JSON-LD from page SEO config
 * 
 * IMPORTANT: Breadcrumbs in JSON-LD must reflect VISIBLE breadcrumbs on the page.
 * Only include breadcrumb items that are actually displayed to users.
 */
function generateBreadcrumbJsonLd(breadcrumbs) {
  if (!breadcrumbs || !Array.isArray(breadcrumbs) || breadcrumbs.length === 0) {
    return '';
  }
  
  const baseUrl = seoConfig.getBaseUrl();
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url.startsWith('http') ? crumb.url : baseUrl + crumb.url
    }))
  };
  
  return `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`;
}

/**
 * Clean and create dist directory
 */
function cleanDist() {
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });
  console.log('✓ Cleaned dist directory');
}

/**
 * Copy a file or directory recursively
 */
function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    const files = fs.readdirSync(src);
    files.forEach(file => {
      copyRecursive(path.join(src, file), path.join(dest, file));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

/**
 * Copy static assets (non-HTML files and directories)
 */
function copyAssets() {
  const items = fs.readdirSync(SRC_DIR);
  
  items.forEach(item => {
    const srcPath = path.join(SRC_DIR, item);
    const destPath = path.join(DIST_DIR, item);
    const stat = fs.statSync(srcPath);
    
    // Skip HTML files (they're processed separately)
    // Skip partials directory (not needed in dist)
    // Skip .seo.json files
    if (item === 'partials') return;
    if (item.endsWith('.html')) return;
    if (item.endsWith('.seo.json')) return;
    
    copyRecursive(srcPath, destPath);
  });
  
  console.log('✓ Copied static assets');
}

/**
 * Read a partial file
 */
function readPartial(partialPath) {
  const fullPath = path.join(SRC_DIR, partialPath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠ Partial not found: ${partialPath}`);
    return '';
  }
  return fs.readFileSync(fullPath, 'utf8');
}

/**
 * Load per-page SEO config from sidecar JSON file
 */
function loadPageSeoConfig(htmlFilePath) {
  const baseName = path.basename(htmlFilePath, '.html');
  const dirName = path.dirname(htmlFilePath);
  const seoConfigPath = path.join(dirName, `${baseName}.seo.json`);
  
  if (fs.existsSync(seoConfigPath)) {
    try {
      const content = fs.readFileSync(seoConfigPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.warn(`⚠ Failed to parse ${seoConfigPath}: ${error.message}`);
    }
  }
  
  return {};
}

/**
 * Get page path from file path (for canonical URL generation)
 */
function getPagePath(htmlFile) {
  const relativePath = path.relative(SRC_DIR, htmlFile);
  // Convert to URL path
  let urlPath = '/' + relativePath.replace(/\\/g, '/');
  // index.html -> /
  if (urlPath === '/index.html') {
    urlPath = '/';
  }
  return urlPath;
}

/**
 * Replace SEO tokens in content
 */
function replaceTokens(content, pageSeo, htmlFilePath) {
  const siteConfig = seoConfig.getConfig();
  const pagePath = getPagePath(htmlFilePath);
  
  // Merge defaults with page-specific overrides
  const seo = {
    title: pageSeo.title || DEFAULT_SEO.title,
    description: pageSeo.description || DEFAULT_SEO.description,
    ogImage: pageSeo.ogImage || siteConfig.defaultOgImage,
  };
  
  // Build canonical URL
  const canonical = seoConfig.buildCanonicalUrl(pagePath);
  
  // Get robots directive based on environment
  const robots = seoConfig.getRobotsDirective();
  
  // Build full OG image URL
  const ogImageUrl = seo.ogImage.startsWith('http') 
    ? seo.ogImage 
    : seoConfig.getBaseUrl() + seo.ogImage;
  
  // Generate JSON-LD structured data
  const organizationJsonLd = generateOrganizationJsonLd();
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(pageSeo.breadcrumbs);
  
  // Replace tokens
  let result = content
    .replace(/\{\{TITLE\}\}/g, seo.title)
    .replace(/\{\{DESCRIPTION\}\}/g, seo.description)
    .replace(/\{\{CANONICAL\}\}/g, canonical)
    .replace(/\{\{ROBOTS\}\}/g, robots)
    .replace(/\{\{OG_IMAGE\}\}/g, ogImageUrl)
    .replace(/\{\{SITE_NAME\}\}/g, siteConfig.siteName)
    .replace(/\{\{JSONLD_ORGANIZATION\}\}/g, organizationJsonLd)
    .replace(/\{\{JSONLD_BREADCRUMB\}\}/g, breadcrumbJsonLd);
  
  return result;
}

/**
 * Process include directives in content
 */
function processIncludes(content) {
  // Match <!-- INCLUDE:path/to/file.html -->
  const includeRegex = /<!--\s*INCLUDE:([^\s]+)\s*-->/g;
  
  return content.replace(includeRegex, (match, partialPath) => {
    const partialContent = readPartial(partialPath.trim());
    return partialContent;
  });
}

/**
 * Process a single HTML file
 */
function processHtmlFile(htmlFilePath) {
  // Read HTML content
  let content = fs.readFileSync(htmlFilePath, 'utf8');
  
  // Load page-specific SEO config
  const pageSeo = loadPageSeoConfig(htmlFilePath);
  
  // Process include directives first
  content = processIncludes(content);
  
  // Replace SEO tokens
  content = replaceTokens(content, pageSeo, htmlFilePath);
  
  // Determine output path
  const relativePath = path.relative(SRC_DIR, htmlFilePath);
  const outputPath = path.join(DIST_DIR, relativePath);
  
  // Ensure output directory exists
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  
  // Write processed HTML
  fs.writeFileSync(outputPath, content, 'utf8');
  
  console.log(`  ✓ ${relativePath}`);
}

/**
 * Find all HTML files in a directory recursively
 */
function findHtmlFiles(dir) {
  const htmlFiles = [];
  
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip partials directory
      if (item !== 'partials') {
        htmlFiles.push(...findHtmlFiles(fullPath));
      }
    } else if (item.endsWith('.html')) {
      htmlFiles.push(fullPath);
    }
  });
  
  return htmlFiles;
}

/**
 * Main build function
 */
function build() {
  console.log('🔨 Building site...\n');
  console.log(`Environment: ${seoConfig.getEnv()}`);
  console.log(`Base URL: ${seoConfig.getBaseUrl()}`);
  console.log(`Robots: ${seoConfig.getRobotsDirective()}\n`);
  
  // Clean and prepare dist
  cleanDist();
  
  // Copy static assets
  copyAssets();
  
  // Process HTML files
  console.log('\n📄 Processing HTML files:');
  const htmlFiles = findHtmlFiles(SRC_DIR);
  htmlFiles.forEach(processHtmlFile);
  
  console.log(`\n✅ Build complete! Output in /dist`);
  console.log(`   ${htmlFiles.length} HTML files processed\n`);
}

// Run build
build();
