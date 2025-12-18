#!/usr/bin/env node
/**
 * Sitemap Generator
 * 
 * Scans /dist for HTML files and generates a sitemap.xml
 * 
 * Features:
 * - Maps index.html to /
 * - Excludes 404.html, admin files, and noindex pages
 * - Uses baseUrl from site.config.json
 * - Guarantees no duplicate URLs
 * 
 * Usage:
 *   node scripts/generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');

// Import SEO config helper
const seoConfig = require('../seo/lib/config');

// Paths
const DIST_DIR = path.resolve(__dirname, '../dist');
const SRC_DIR = path.resolve(__dirname, '../src');
const SITEMAP_PATH = path.join(DIST_DIR, 'sitemap.xml');

// Files and directories to exclude
const EXCLUDED_FILES = ['404.html'];
const EXCLUDED_DIRS = ['admin', 'partials'];

/**
 * Check if a page should be excluded based on its .seo.json config
 */
function isNoIndexPage(htmlFile) {
  // Get the corresponding .seo.json path in src
  const relativePath = path.relative(DIST_DIR, htmlFile);
  const baseName = path.basename(relativePath, '.html');
  const dirName = path.dirname(relativePath);
  
  // Look for .seo.json in src directory
  const seoConfigPath = path.join(SRC_DIR, dirName, `${baseName}.seo.json`);
  
  if (fs.existsSync(seoConfigPath)) {
    try {
      const content = fs.readFileSync(seoConfigPath, 'utf8');
      const config = JSON.parse(content);
      return config.noindex === true;
    } catch (error) {
      console.warn(`⚠ Failed to parse ${seoConfigPath}: ${error.message}`);
    }
  }
  
  return false;
}

/**
 * Convert file path to URL path
 */
function fileToUrlPath(htmlFile) {
  const relativePath = path.relative(DIST_DIR, htmlFile);
  
  // Convert backslashes to forward slashes (Windows compatibility)
  let urlPath = '/' + relativePath.replace(/\\/g, '/');
  
  // Map index.html to /
  if (urlPath === '/index.html') {
    return '/';
  }
  
  // Remove .html extension for cleaner URLs (optional - keep for now)
  // You could change this to: return urlPath.replace(/\.html$/, '');
  
  return urlPath;
}

/**
 * Find all HTML files in a directory recursively
 */
function findHtmlFiles(dir, htmlFiles = []) {
  if (!fs.existsSync(dir)) {
    return htmlFiles;
  }
  
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip excluded directories
      if (!EXCLUDED_DIRS.includes(item.toLowerCase())) {
        findHtmlFiles(fullPath, htmlFiles);
      }
    } else if (item.endsWith('.html')) {
      // Skip excluded files
      if (!EXCLUDED_FILES.includes(item.toLowerCase())) {
        htmlFiles.push(fullPath);
      }
    }
  });
  
  return htmlFiles;
}

/**
 * Get file modification date for lastmod
 */
function getLastMod(filePath) {
  try {
    const stat = fs.statSync(filePath);
    return stat.mtime.toISOString().split('T')[0]; // YYYY-MM-DD format
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Generate sitemap XML content
 */
function generateSitemapXml(urls, baseUrl) {
  const urlEntries = urls.map(({ loc, lastmod }) => {
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
  }).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;
}

/**
 * Main function
 */
function generateSitemap() {
  console.log('🗺️  Generating sitemap...\n');
  
  // Check if dist directory exists
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Error: /dist directory not found. Run "npm run build" first.');
    process.exit(1);
  }
  
  // Get configuration
  const baseUrl = seoConfig.getBaseUrl().replace(/\/$/, ''); // Remove trailing slash
  console.log(`Base URL: ${baseUrl}`);
  
  // Find all HTML files
  const htmlFiles = findHtmlFiles(DIST_DIR);
  console.log(`Found ${htmlFiles.length} HTML files\n`);
  
  // Use Set to guarantee no duplicates
  const urlSet = new Set();
  const urls = [];
  
  htmlFiles.forEach(htmlFile => {
    const relativePath = path.relative(DIST_DIR, htmlFile);
    
    // Check if page should be excluded (noindex)
    if (isNoIndexPage(htmlFile)) {
      console.log(`  ⊘ Excluded (noindex): ${relativePath}`);
      return;
    }
    
    // Convert to URL path
    const urlPath = fileToUrlPath(htmlFile);
    const fullUrl = baseUrl + urlPath;
    
    // Skip if URL already exists (no duplicates)
    if (urlSet.has(fullUrl)) {
      console.log(`  ⊘ Skipped (duplicate): ${relativePath}`);
      return;
    }
    
    urlSet.add(fullUrl);
    
    // Get last modification date
    const lastmod = getLastMod(htmlFile);
    
    urls.push({
      loc: fullUrl,
      lastmod: lastmod
    });
    
    console.log(`  ✓ ${urlPath}`);
  });
  
  // Sort URLs alphabetically for consistent output
  urls.sort((a, b) => a.loc.localeCompare(b.loc));
  
  // Generate XML
  const sitemapXml = generateSitemapXml(urls, baseUrl);
  
  // Write sitemap.xml
  fs.writeFileSync(SITEMAP_PATH, sitemapXml, 'utf8');
  
  console.log(`\n✅ Sitemap generated: /dist/sitemap.xml`);
  console.log(`   ${urls.length} URLs included\n`);
}

// Run
generateSitemap();
