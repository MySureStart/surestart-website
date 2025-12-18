#!/usr/bin/env node
/**
 * SEO Smoke Test
 * 
 * Validates SEO requirements for the built static site by:
 * - Reading URLs from sitemap.xml
 * - Fetching each page from a local server
 * - Validating title, meta description, canonical, robots
 * 
 * Usage:
 *   node scripts/seo-smoke-test.js [--base-url http://localhost:3000] [--urls /,/about-us]
 * 
 * Options:
 *   --base-url  Local server base URL (default: http://localhost:8080)
 *   --urls      Comma-separated list of paths to test instead of sitemap
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

// Import SEO config helper
const seoConfig = require('../seo/lib/config');

// Paths
const SITEMAP_PATH = path.resolve(__dirname, '../dist/sitemap.xml');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    baseUrl: 'http://localhost:8080',
    urls: null
  };
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--base-url' && args[i + 1]) {
      options.baseUrl = args[i + 1].replace(/\/$/, '');
      i++;
    } else if (args[i] === '--urls' && args[i + 1]) {
      options.urls = args[i + 1].split(',').map(u => u.trim());
      i++;
    }
  }
  
  return options;
}

/**
 * Parse sitemap.xml to extract URLs
 */
function parseSitemap(content, localBaseUrl) {
  const urls = [];
  const locRegex = /<loc>([^<]+)<\/loc>/g;
  let match;
  
  while ((match = locRegex.exec(content)) !== null) {
    const sitemapUrl = match[1];
    // Extract path from sitemap URL and create local URL
    const urlObj = new URL(sitemapUrl);
    const localUrl = localBaseUrl + urlObj.pathname;
    urls.push({
      path: urlObj.pathname,
      localUrl: localUrl,
      sitemapUrl: sitemapUrl
    });
  }
  
  return urls;
}

/**
 * Fetch a URL and return response + body
 */
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const request = client.get(url, { timeout: 10000 }, (response) => {
      let body = '';
      
      response.on('data', chunk => {
        body += chunk;
      });
      
      response.on('end', () => {
        resolve({
          status: response.statusCode,
          headers: response.headers,
          body: body
        });
      });
    });
    
    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Parse HTML and extract SEO elements
 */
function parseSEOElements(html) {
  const result = {
    titles: [],
    metaDescriptions: [],
    canonicals: [],
    robots: []
  };
  
  // Extract <title> tags
  const titleRegex = /<title[^>]*>([^<]*)<\/title>/gi;
  let match;
  while ((match = titleRegex.exec(html)) !== null) {
    result.titles.push(match[1].trim());
  }
  
  // Extract meta description
  const descRegex = /<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/gi;
  const descRegex2 = /<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/gi;
  while ((match = descRegex.exec(html)) !== null) {
    result.metaDescriptions.push(match[1].trim());
  }
  while ((match = descRegex2.exec(html)) !== null) {
    result.metaDescriptions.push(match[1].trim());
  }
  
  // Extract canonical links
  const canonicalRegex = /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/gi;
  const canonicalRegex2 = /<link\s+[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["'][^>]*>/gi;
  while ((match = canonicalRegex.exec(html)) !== null) {
    result.canonicals.push(match[1].trim());
  }
  while ((match = canonicalRegex2.exec(html)) !== null) {
    result.canonicals.push(match[1].trim());
  }
  
  // Extract robots meta
  const robotsRegex = /<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/gi;
  const robotsRegex2 = /<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']robots["'][^>]*>/gi;
  while ((match = robotsRegex.exec(html)) !== null) {
    result.robots.push(match[1].trim().toLowerCase());
  }
  while ((match = robotsRegex2.exec(html)) !== null) {
    result.robots.push(match[1].trim().toLowerCase());
  }
  
  return result;
}

/**
 * Validate SEO elements for a page
 */
function validatePage(path, seo, isProd, configuredBaseUrl) {
  const errors = [];
  const warnings = [];
  
  // Check for exactly one title
  if (seo.titles.length === 0) {
    errors.push('Missing <title> tag');
  } else if (seo.titles.length > 1) {
    errors.push(`Multiple <title> tags found (${seo.titles.length})`);
  } else if (seo.titles[0].length === 0) {
    errors.push('Empty <title> tag');
  }
  
  // Check for meta description (warning only)
  if (seo.metaDescriptions.length === 0) {
    warnings.push('Missing meta description');
  } else if (seo.metaDescriptions[0].length === 0) {
    warnings.push('Empty meta description');
  } else if (seo.metaDescriptions[0].length < 50) {
    warnings.push(`Meta description too short (${seo.metaDescriptions[0].length} chars, recommend 50-160)`);
  } else if (seo.metaDescriptions[0].length > 160) {
    warnings.push(`Meta description too long (${seo.metaDescriptions[0].length} chars, recommend 50-160)`);
  }
  
  // Check for exactly one canonical
  if (seo.canonicals.length === 0) {
    errors.push('Missing canonical link');
  } else if (seo.canonicals.length > 1) {
    errors.push(`Multiple canonical links found (${seo.canonicals.length})`);
  } else {
    const canonical = seo.canonicals[0];
    
    // Check canonical is absolute
    if (!canonical.startsWith('http://') && !canonical.startsWith('https://')) {
      errors.push(`Canonical is not absolute: "${canonical}"`);
    } else if (isProd) {
      // In production, check canonical host matches configured baseUrl
      try {
        const canonicalHost = new URL(canonical).host;
        const configuredHost = new URL(configuredBaseUrl).host;
        if (canonicalHost !== configuredHost) {
          errors.push(`Canonical host "${canonicalHost}" does not match configured baseUrl host "${configuredHost}"`);
        }
      } catch (e) {
        errors.push(`Invalid canonical URL: "${canonical}"`);
      }
    }
  }
  
  // Check robots in production - should not be noindex
  if (isProd) {
    const robotsContent = seo.robots.join(' ');
    if (robotsContent.includes('noindex')) {
      errors.push(`Production page has "noindex" robots directive: "${seo.robots.join(', ')}"`);
    }
  }
  
  return { errors, warnings };
}

/**
 * Main smoke test function
 */
async function runSmokeTest() {
  console.log('🔬 SEO Smoke Test\n');
  console.log('='.repeat(60) + '\n');
  
  const options = parseArgs();
  const isProd = seoConfig.isProd();
  const configuredBaseUrl = seoConfig.getBaseUrl();
  
  console.log(`Environment: ${seoConfig.getEnv()}`);
  console.log(`Is Production: ${isProd}`);
  console.log(`Configured baseUrl: ${configuredBaseUrl}`);
  console.log(`Test base URL: ${options.baseUrl}\n`);
  
  // Get URLs to test
  let urlsToTest = [];
  
  if (options.urls) {
    // Use provided URLs
    urlsToTest = options.urls.map(p => ({
      path: p.startsWith('/') ? p : '/' + p,
      localUrl: options.baseUrl + (p.startsWith('/') ? p : '/' + p),
      sitemapUrl: null
    }));
    console.log(`Testing ${urlsToTest.length} URLs from command line\n`);
  } else {
    // Parse sitemap
    if (!fs.existsSync(SITEMAP_PATH)) {
      console.error('❌ Error: /dist/sitemap.xml not found');
      console.error('   Run "npm run build" first or provide --urls\n');
      process.exit(1);
    }
    
    const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf8');
    urlsToTest = parseSitemap(sitemapContent, options.baseUrl);
    console.log(`Testing ${urlsToTest.length} URLs from sitemap.xml\n`);
  }
  
  if (urlsToTest.length === 0) {
    console.error('❌ No URLs to test\n');
    process.exit(1);
  }
  
  // Test each URL
  const results = [];
  let totalErrors = 0;
  let totalWarnings = 0;
  
  for (const url of urlsToTest) {
    process.stdout.write(`Testing ${url.path}... `);
    
    try {
      const response = await fetchUrl(url.localUrl);
      
      // Check HTTP status
      if (response.status !== 200) {
        console.log(`❌ HTTP ${response.status}`);
        results.push({
          path: url.path,
          status: 'FAIL',
          errors: [`HTTP status ${response.status} (expected 200)`],
          warnings: []
        });
        totalErrors++;
        continue;
      }
      
      // Parse SEO elements
      const seo = parseSEOElements(response.body);
      
      // Validate
      const { errors, warnings } = validatePage(url.path, seo, isProd, configuredBaseUrl);
      
      totalErrors += errors.length;
      totalWarnings += warnings.length;
      
      if (errors.length > 0) {
        console.log('❌ FAIL');
      } else if (warnings.length > 0) {
        console.log('⚠️  WARN');
      } else {
        console.log('✓ PASS');
      }
      
      results.push({
        path: url.path,
        status: errors.length > 0 ? 'FAIL' : (warnings.length > 0 ? 'WARN' : 'PASS'),
        errors: errors,
        warnings: warnings,
        seo: {
          title: seo.titles[0] || null,
          description: seo.metaDescriptions[0] || null,
          canonical: seo.canonicals[0] || null,
          robots: seo.robots.join(', ') || null
        }
      });
      
    } catch (err) {
      console.log('❌ ERROR');
      results.push({
        path: url.path,
        status: 'ERROR',
        errors: [`Fetch error: ${err.message}`],
        warnings: []
      });
      totalErrors++;
    }
  }
  
  // Print detailed report
  console.log('\n' + '='.repeat(60));
  console.log('DETAILED RESULTS');
  console.log('='.repeat(60) + '\n');
  
  for (const result of results) {
    if (result.errors.length > 0 || result.warnings.length > 0) {
      console.log(`📄 ${result.path}`);
      
      if (result.errors.length > 0) {
        result.errors.forEach(e => console.log(`   ❌ ${e}`));
      }
      
      if (result.warnings.length > 0) {
        result.warnings.forEach(w => console.log(`   ⚠️  ${w}`));
      }
      
      console.log('');
    }
  }
  
  // Print summary
  console.log('='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60) + '\n');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const warned = results.filter(r => r.status === 'WARN').length;
  const failed = results.filter(r => r.status === 'FAIL' || r.status === 'ERROR').length;
  
  console.log(`Total pages tested: ${results.length}`);
  console.log(`  ✓ Passed:  ${passed}`);
  console.log(`  ⚠️  Warned:  ${warned}`);
  console.log(`  ❌ Failed:  ${failed}`);
  console.log('');
  console.log(`Total errors: ${totalErrors}`);
  console.log(`Total warnings: ${totalWarnings}`);
  console.log('');
  
  // Exit with appropriate code
  if (failed > 0 || totalErrors > 0) {
    console.log('❌ SEO smoke test FAILED\n');
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log('⚠️  SEO smoke test PASSED with warnings\n');
    process.exit(0);
  } else {
    console.log('✅ SEO smoke test PASSED\n');
    process.exit(0);
  }
}

// Run
runSmokeTest().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
