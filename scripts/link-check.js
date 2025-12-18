#!/usr/bin/env node
/**
 * Internal Link & Asset Checker
 * 
 * Crawls the built site to validate:
 * - Internal links (<a href>) return 200 or 3xx
 * - Internal assets (<img src>) return 200
 * 
 * Usage:
 *   node scripts/link-check.js [--base-url http://localhost:3000]
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

// Paths
const DIST_DIR = path.resolve(__dirname, '../dist');
const SITEMAP_PATH = path.join(DIST_DIR, 'sitemap.xml');
const REPORTS_DIR = path.join(DIST_DIR, 'reports');
const CSV_OUTPUT = path.join(REPORTS_DIR, 'link-check.csv');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    baseUrl: 'http://localhost:8080',
    output: CSV_OUTPUT,
    checkExternal: false
  };
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--base-url' && args[i + 1]) {
      options.baseUrl = args[i + 1].replace(/\/$/, '');
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      options.output = args[i + 1];
      i++;
    } else if (args[i] === '--external') {
      options.checkExternal = true;
    }
  }
  
  return options;
}

/**
 * Parse sitemap.xml to extract URLs
 */
function parseSitemap(content, baseUrl) {
  const urls = [];
  const locRegex = /<loc>([^<]+)<\/loc>/g;
  let match;
  
  while ((match = locRegex.exec(content)) !== null) {
    const sitemapUrl = match[1];
    const urlObj = new URL(sitemapUrl);
    urls.push(urlObj.pathname);
  }
  
  return urls;
}

/**
 * Fetch a URL and return status code
 */
function fetchUrl(url, timeout = 10000) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    const request = client.get(url, { timeout }, (response) => {
      // Consume response body to free memory
      response.on('data', () => {});
      response.on('end', () => {
        resolve({
          status: response.statusCode,
          ok: response.statusCode >= 200 && response.statusCode < 400
        });
      });
    });
    
    request.on('error', (err) => {
      resolve({ status: 0, ok: false, error: err.message });
    });
    
    request.on('timeout', () => {
      request.destroy();
      resolve({ status: 0, ok: false, error: 'Timeout' });
    });
  });
}

/**
 * Fetch a URL and return HTML body
 */
function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const request = client.get(url, { timeout: 10000 }, (response) => {
      if (response.statusCode !== 200) {
        resolve({ status: response.statusCode, body: null });
        return;
      }
      
      let body = '';
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => {
        resolve({ status: response.statusCode, body });
      });
    });
    
    request.on('error', (err) => {
      resolve({ status: 0, body: null, error: err.message });
    });
    
    request.on('timeout', () => {
      request.destroy();
      resolve({ status: 0, body: null, error: 'Timeout' });
    });
  });
}

/**
 * Extract links and images from HTML
 */
function extractLinksAndAssets(html, currentPage) {
  const links = [];
  const assets = [];
  
  // Extract <a href>
  const linkRegex = /<a\s+[^>]*href=["']([^"'#]+)["'][^>]*>/gi;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1].trim();
    if (href && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('javascript:')) {
      links.push(href);
    }
  }
  
  // Extract <img src>
  const imgRegex = /<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi;
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1].trim();
    if (src && !src.startsWith('data:')) {
      assets.push(src);
    }
  }
  
  // Extract CSS background images and other srcset
  const srcsetRegex = /srcset=["']([^"']+)["']/gi;
  while ((match = srcsetRegex.exec(html)) !== null) {
    const srcset = match[1];
    const srcs = srcset.split(',').map(s => s.trim().split(' ')[0]);
    srcs.forEach(src => {
      if (src && !src.startsWith('data:')) {
        assets.push(src);
      }
    });
  }
  
  return { links, assets };
}

/**
 * Normalize URL relative to current page
 */
function normalizeUrl(url, currentPage, baseUrl) {
  // Skip external URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const urlObj = new URL(url);
      const baseObj = new URL(baseUrl);
      if (urlObj.host !== baseObj.host) {
        return { url, isExternal: true };
      }
      return { url: urlObj.pathname, isExternal: false };
    } catch {
      return { url, isExternal: true };
    }
  }
  
  // Handle absolute paths
  if (url.startsWith('/')) {
    return { url, isExternal: false };
  }
  
  // Handle relative paths
  const currentDir = path.dirname(currentPage);
  const resolved = path.posix.join(currentDir, url);
  return { url: resolved, isExternal: false };
}

/**
 * Main link check function
 */
async function runLinkCheck() {
  console.log('🔗 Internal Link & Asset Checker\n');
  console.log('='.repeat(60) + '\n');
  
  const options = parseArgs();
  console.log(`Base URL: ${options.baseUrl}`);
  console.log(`Output: ${options.output}`);
  console.log(`Check external: ${options.checkExternal}\n`);
  
  // Get pages to crawl from sitemap
  if (!fs.existsSync(SITEMAP_PATH)) {
    console.error('❌ Error: /dist/sitemap.xml not found');
    console.error('   Run "npm run build" first\n');
    process.exit(1);
  }
  
  const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf8');
  const pages = parseSitemap(sitemapContent, options.baseUrl);
  
  console.log(`Found ${pages.length} pages in sitemap\n`);
  
  // Results storage
  const results = [];
  const checkedUrls = new Map(); // Cache for URL checks
  
  // Crawl each page
  for (const pagePath of pages) {
    const pageUrl = options.baseUrl + pagePath;
    process.stdout.write(`Crawling ${pagePath}... `);
    
    const { status, body } = await fetchHtml(pageUrl);
    
    if (!body) {
      console.log(`❌ HTTP ${status}`);
      results.push({
        source: pagePath,
        type: 'page',
        url: pagePath,
        status: status,
        result: 'FAIL',
        error: 'Could not fetch page'
      });
      continue;
    }
    
    // Extract links and assets
    const { links, assets } = extractLinksAndAssets(body, pagePath);
    console.log(`${links.length} links, ${assets.length} assets`);
    
    // Check links
    for (const link of links) {
      const { url: normalizedUrl, isExternal } = normalizeUrl(link, pagePath, options.baseUrl);
      
      if (isExternal && !options.checkExternal) {
        continue;
      }
      
      // Check cache
      if (checkedUrls.has(normalizedUrl)) {
        const cached = checkedUrls.get(normalizedUrl);
        results.push({
          source: pagePath,
          type: isExternal ? 'external-link' : 'link',
          url: normalizedUrl,
          status: cached.status,
          result: cached.ok ? 'OK' : 'FAIL'
        });
        continue;
      }
      
      // Fetch and check
      const fullUrl = isExternal ? normalizedUrl : options.baseUrl + normalizedUrl;
      const check = await fetchUrl(fullUrl);
      checkedUrls.set(normalizedUrl, check);
      
      results.push({
        source: pagePath,
        type: isExternal ? 'external-link' : 'link',
        url: normalizedUrl,
        status: check.status,
        result: check.ok ? 'OK' : 'FAIL',
        error: check.error
      });
    }
    
    // Check assets
    for (const asset of assets) {
      const { url: normalizedUrl, isExternal } = normalizeUrl(asset, pagePath, options.baseUrl);
      
      if (isExternal && !options.checkExternal) {
        continue;
      }
      
      // Check cache
      if (checkedUrls.has(normalizedUrl)) {
        const cached = checkedUrls.get(normalizedUrl);
        results.push({
          source: pagePath,
          type: isExternal ? 'external-asset' : 'asset',
          url: normalizedUrl,
          status: cached.status,
          result: cached.status === 200 ? 'OK' : 'FAIL'
        });
        continue;
      }
      
      // Fetch and check
      const fullUrl = isExternal ? normalizedUrl : options.baseUrl + normalizedUrl;
      const check = await fetchUrl(fullUrl);
      checkedUrls.set(normalizedUrl, check);
      
      // Assets must be 200, not just 2xx/3xx
      results.push({
        source: pagePath,
        type: isExternal ? 'external-asset' : 'asset',
        url: normalizedUrl,
        status: check.status,
        result: check.status === 200 ? 'OK' : 'FAIL',
        error: check.error
      });
    }
  }
  
  // Generate CSV report
  console.log('\n' + '='.repeat(60));
  console.log('GENERATING REPORT');
  console.log('='.repeat(60) + '\n');
  
  // Ensure reports directory exists
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
  
  // Build CSV
  const timestamp = new Date().toISOString();
  const csvHeader = 'source_page,type,url,status,result,timestamp\n';
  const csvRows = results.map(r => {
    const escapedUrl = `"${r.url.replace(/"/g, '""')}"`;
    return `${r.source},${r.type},${escapedUrl},${r.status},${r.result},${timestamp}`;
  }).join('\n');
  
  fs.writeFileSync(options.output, csvHeader + csvRows + '\n', 'utf8');
  console.log(`✓ CSV report: ${options.output}\n`);
  
  // Print summary
  console.log('='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60) + '\n');
  
  const totalChecks = results.length;
  const passed = results.filter(r => r.result === 'OK').length;
  const failed = results.filter(r => r.result === 'FAIL').length;
  
  const linksFailed = results.filter(r => r.type === 'link' && r.result === 'FAIL');
  const assetsFailed = results.filter(r => r.type === 'asset' && r.result === 'FAIL');
  
  console.log(`Total checks: ${totalChecks}`);
  console.log(`  ✓ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log('');
  
  // Print failures
  if (linksFailed.length > 0) {
    console.log('❌ Broken internal links:');
    linksFailed.forEach(r => {
      console.log(`   ${r.source} → ${r.url} (HTTP ${r.status})`);
    });
    console.log('');
  }
  
  if (assetsFailed.length > 0) {
    console.log('❌ Missing assets:');
    assetsFailed.forEach(r => {
      console.log(`   ${r.source} → ${r.url} (HTTP ${r.status})`);
    });
    console.log('');
  }
  
  // Exit code
  if (failed > 0) {
    console.log('❌ Link check FAILED\n');
    process.exit(1);
  } else {
    console.log('✅ Link check PASSED\n');
    process.exit(0);
  }
}

// Run
runLinkCheck().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
