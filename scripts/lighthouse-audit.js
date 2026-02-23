#!/usr/bin/env node
/**
 * Lighthouse Audit Script for SureStart Website
 * 
 * Runs Lighthouse CLI audits against the production build and generates reports.
 * 
 * Usage: npm run perf:lighthouse
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Configuration
const CONFIG = {
  distDir: 'dist',
  reportsDir: 'seo/lighthouse-reports',
  summaryPath: 'seo/lighthouse-summary.md',
  serverPort: 3456,
  
  // URLs to audit (relative to localhost)
  urls: [
    { path: '/', name: 'home' },
    { path: '/about/', name: 'about' },
    { path: '/contact/', name: 'contact' },
    { path: '/for-universities/', name: 'for-universities' },
    { path: '/for-students/', name: 'for-students' },
    { path: '/k12/', name: 'k12' },
    { path: '/impact-stories/', name: 'impact-stories' },
  ],
};

// Store results for summary
const results = [];

/**
 * Ensure reports directory exists
 */
function ensureReportsDir() {
  if (!fs.existsSync(CONFIG.reportsDir)) {
    fs.mkdirSync(CONFIG.reportsDir, { recursive: true });
  }
}

/**
 * Build production if needed
 */
function buildProduction() {
  console.log('🏗️  Building production...');
  
  if (!fs.existsSync(CONFIG.distDir)) {
    execSync('npm run build:prod', { stdio: 'inherit' });
  } else {
    console.log('   dist/ exists, skipping build');
  }
}

/**
 * Start local server and return process
 */
function startServer() {
  return new Promise((resolve) => {
    console.log(`🌐 Starting server on port ${CONFIG.serverPort}...`);
    
    const server = spawn('npx', ['serve', CONFIG.distDir, '-p', String(CONFIG.serverPort), '-s'], {
      stdio: 'pipe',
      shell: true,
      detached: false,
    });
    
    // Give server time to start
    setTimeout(() => {
      console.log('   Server started');
      resolve(server);
    }, 2000);
    
    server.on('error', (err) => {
      console.error('Server error:', err);
    });
  });
}

/**
 * Run Lighthouse CLI for a single URL
 */
function runLighthouseAudit(urlConfig) {
  const url = `http://localhost:${CONFIG.serverPort}${urlConfig.path}`;
  const jsonPath = path.join(CONFIG.reportsDir, `${urlConfig.name}.json`);
  const htmlPath = path.join(CONFIG.reportsDir, `${urlConfig.name}.html`);
  
  console.log(`\n🔍 Auditing: ${urlConfig.name} (${url})`);
  
  try {
    // Run Lighthouse CLI
    execSync(
      `npx lighthouse "${url}" --output=json,html --output-path="${path.join(CONFIG.reportsDir, urlConfig.name)}" --chrome-flags="--headless --no-sandbox --disable-gpu" --only-categories=performance,accessibility,best-practices,seo --preset=desktop --quiet`,
      { stdio: 'pipe', encoding: 'utf-8' }
    );
    
    // Read JSON results
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
    const lhr = JSON.parse(jsonContent);
    
    const result = {
      name: urlConfig.name,
      path: urlConfig.path,
      scores: {
        performance: Math.round(lhr.categories.performance.score * 100),
        accessibility: Math.round(lhr.categories.accessibility.score * 100),
        bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
        seo: Math.round(lhr.categories.seo.score * 100),
      },
      metrics: {
        lcp: lhr.audits['largest-contentful-paint']?.displayValue || 'N/A',
        cls: lhr.audits['cumulative-layout-shift']?.displayValue || 'N/A',
        tbt: lhr.audits['total-blocking-time']?.displayValue || 'N/A',
        fcp: lhr.audits['first-contentful-paint']?.displayValue || 'N/A',
        si: lhr.audits['speed-index']?.displayValue || 'N/A',
      },
      lcpNumeric: lhr.audits['largest-contentful-paint']?.numericValue || 0,
      clsNumeric: lhr.audits['cumulative-layout-shift']?.numericValue || 0,
      tbtNumeric: lhr.audits['total-blocking-time']?.numericValue || 0,
    };
    
    console.log(`   Performance: ${result.scores.performance} | LCP: ${result.metrics.lcp} | CLS: ${result.metrics.cls} | TBT: ${result.metrics.tbt}`);
    
    results.push(result);
    return result;
    
  } catch (error) {
    console.error(`   ❌ Error auditing ${urlConfig.name}: ${error.message}`);
    results.push({
      name: urlConfig.name,
      path: urlConfig.path,
      error: error.message,
    });
    return null;
  }
}

/**
 * Generate summary markdown
 */
function generateSummary() {
  const now = new Date().toISOString().split('T')[0];
  const time = new Date().toISOString().split('T')[1].slice(0, 5);
  
  // Calculate averages
  const validResults = results.filter(r => !r.error);
  const avgPerf = validResults.length > 0 
    ? Math.round(validResults.reduce((sum, r) => sum + r.scores.performance, 0) / validResults.length)
    : 0;
  const avgLcp = validResults.length > 0
    ? (validResults.reduce((sum, r) => sum + r.lcpNumeric, 0) / validResults.length / 1000).toFixed(2)
    : 0;
  const avgCls = validResults.length > 0
    ? (validResults.reduce((sum, r) => sum + r.clsNumeric, 0) / validResults.length).toFixed(3)
    : 0;
  const avgTbt = validResults.length > 0
    ? Math.round(validResults.reduce((sum, r) => sum + r.tbtNumeric, 0) / validResults.length)
    : 0;
  
  let summary = `# Lighthouse Audit Summary

**Generated:** ${now} ${time}
**Environment:** Production Build (/dist)
**Device:** Desktop

---

## Overall Scores

| Page | Performance | Accessibility | Best Practices | SEO |
|------|-------------|---------------|----------------|-----|
`;

  for (const result of results) {
    if (result.error) {
      summary += `| ${result.name} | ❌ Error | - | - | - |\n`;
    } else {
      const perfEmoji = result.scores.performance >= 90 ? '🟢' : result.scores.performance >= 50 ? '🟡' : '🔴';
      summary += `| ${result.name} | ${perfEmoji} ${result.scores.performance} | ${result.scores.accessibility} | ${result.scores.bestPractices} | ${result.scores.seo} |\n`;
    }
  }

  summary += `| **Average** | **${avgPerf}** | - | - | - |

---

## Core Web Vitals

| Page | LCP | CLS | TBT | FCP | Speed Index |
|------|-----|-----|-----|-----|-------------|
`;

  for (const result of results) {
    if (!result.error) {
      summary += `| ${result.name} | ${result.metrics.lcp} | ${result.metrics.cls} | ${result.metrics.tbt} | ${result.metrics.fcp} | ${result.metrics.si} |\n`;
    }
  }

  summary += `| **Average** | ${avgLcp}s | ${avgCls} | ${avgTbt}ms | - | - |

---

## Key Metrics Interpretation

| Metric | Good | Needs Work | Poor |
|--------|------|------------|------|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | 2.5s - 4s | > 4s |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |
| **TBT** (Total Blocking Time) | ≤ 200ms | 200ms - 600ms | > 600ms |

---

## Applied Optimizations

### ✅ Already Implemented
- CSS/JS minification in production build
- WebP images with fallback
- Lazy loading for below-fold images
- Width/height attributes on images (prevents CLS)
- Preconnect hints for Google Fonts

### 🔧 Fixes Applied
- Added \`defer\` attribute to local JS scripts (16 files)
- Added font preload hints for Eastman Grotesque (16 files)
- Documented caching recommendations

---

## Caching Recommendations (Host-Dependent)

Add these headers on your hosting platform:

\`\`\`
# Static assets (1 year)
Cache-Control: public, max-age=31536000, immutable
Applies to: https://pub-dcb79d88e2ec4567824453cc853f55f3.r2.dev/images/*, /assets/fonts/*, *.min.css, *.min.js

# HTML pages (short cache)
Cache-Control: public, max-age=3600, must-revalidate
Applies to: *.html, /

# Service files
Cache-Control: no-cache
Applies to: robots.txt, sitemap.xml
\`\`\`

---

## Individual Reports

HTML reports saved to \`/seo/lighthouse-reports/\`:

`;

  for (const result of results) {
    summary += `- [\`${result.name}.html\`](lighthouse-reports/${result.name}.html)\n`;
  }

  summary += `

---

## How to Re-run Audits

\`\`\`bash
# Full audit with build
npm run perf:lighthouse
\`\`\`

`;

  return summary;
}

/**
 * Main function
 */
async function main() {
  console.log('🔦 Lighthouse Audit Script');
  console.log('==========================\n');
  
  // Ensure directories exist
  ensureReportsDir();
  
  // Build production
  buildProduction();
  
  // Start server
  const server = await startServer();
  
  try {
    // Run audits
    console.log('\n📊 Running audits...');
    for (const urlConfig of CONFIG.urls) {
      runLighthouseAudit(urlConfig);
    }
    
    // Generate summary
    console.log('\n📝 Generating summary...');
    const summary = generateSummary();
    fs.writeFileSync(CONFIG.summaryPath, summary);
    console.log(`   Summary saved: ${CONFIG.summaryPath}`);
    
    // Print summary
    const validResults = results.filter(r => !r.error);
    const avgPerf = validResults.length > 0 
      ? Math.round(validResults.reduce((sum, r) => sum + r.scores.performance, 0) / validResults.length)
      : 0;
    
    console.log('\n==========================');
    console.log('✅ AUDIT COMPLETE');
    console.log('==========================');
    console.log(`   Pages audited: ${results.length}`);
    console.log(`   Avg Performance: ${avgPerf}`);
    console.log(`   Reports: ${CONFIG.reportsDir}/`);
    console.log(`   Summary: ${CONFIG.summaryPath}`);
    
  } finally {
    // Cleanup
    if (server) {
      server.kill();
    }
  }
}

// Run
main().catch(console.error);
