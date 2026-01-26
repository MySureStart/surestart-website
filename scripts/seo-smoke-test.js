/**
 * SEO Smoke Test
 * Validates HTML files for SEO requirements
 * 
 * Checks:
 *   - Exactly one <title>
 *   - Meta description exists
 *   - Canonical exists
 *   - Robots meta exists and is not noindex (public pages only)
 *   - Exactly one <h1>
 *   - No missing alt attributes
 * 
 * Usage: node scripts/seo-smoke-test.js
 * Exit codes: 0 = pass, 1 = failures
 */

const fs = require('fs');
const path = require('path');

// Configuration
const publicPages = [
  'index.html',
  'about/index.html',
  'contact/index.html',
  'for-universities/index.html',
  'for-students/index.html',
  'k12/index.html',
  'impact-stories/index.html'
];

const errorPages = ['403.html', '404.html', '500.html', '503.html'];

const allPages = [...publicPages, ...errorPages];

// Check functions
function countMatches(html, regex) {
  const matches = html.match(regex);
  return matches ? matches.length : 0;
}

function checkFile(filePath, isPublic) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    return {
      file: filePath,
      exists: false,
      checks: {}
    };
  }
  
  const html = fs.readFileSync(fullPath, 'utf8');
  const results = {
    file: filePath,
    exists: true,
    checks: {}
  };
  
  // Title check (exactly 1)
  const titleCount = countMatches(html, /<title[^>]*>[\s\S]*?<\/title>/gi);
  results.checks.title = {
    pass: titleCount === 1,
    count: titleCount,
    msg: titleCount === 0 ? 'missing' : (titleCount > 1 ? `${titleCount} found` : null)
  };
  
// Meta description (skip for error pages)
  const hasMetaDesc = /<meta\s+[^>]*name=["']description["'][^>]*>/i.test(html);
  if (isPublic) {
    results.checks.metaDesc = {
      pass: hasMetaDesc,
      skipped: false,
      msg: hasMetaDesc ? null : 'missing'
    };
  } else {
    results.checks.metaDesc = {
      pass: true,
      skipped: true,
      msg: null
    };
  }
  
  // Canonical (skip for error pages)
  const hasCanonical = /<link\s+[^>]*rel=["']canonical["'][^>]*>/i.test(html);
  if (isPublic) {
    results.checks.canonical = {
      pass: hasCanonical,
      skipped: false,
      msg: hasCanonical ? null : 'missing'
    };
  } else {
    results.checks.canonical = {
      pass: true,
      skipped: true,
      msg: null
    };
  }
  
  // Robots meta
  const robotsMatch = html.match(/<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  if (isPublic) {
    // Public pages: must exist AND not be noindex
    const hasRobots = !!robotsMatch;
    const isNoindex = robotsMatch && robotsMatch[1].toLowerCase().includes('noindex');
    results.checks.robots = {
      pass: hasRobots && !isNoindex,
      skipped: false,
      msg: !hasRobots ? 'missing' : (isNoindex ? 'has noindex' : null)
    };
  } else {
    // Error pages: noindex is OK, just check existence
    results.checks.robots = {
      pass: true,
      skipped: true,
      msg: null
    };
  }
  
  // H1 check (exactly 1)
  const h1Count = countMatches(html, /<h1[^>]*>[\s\S]*?<\/h1>/gi);
  results.checks.h1 = {
    pass: h1Count === 1,
    count: h1Count,
    msg: h1Count === 0 ? 'missing' : (h1Count > 1 ? `${h1Count} found` : null)
  };
  
  // Alt attributes - find imgs without alt
  // Match <img> tags that don't have alt attribute
  const imgTags = html.match(/<img[^>]*>/gi) || [];
  const imgsWithoutAlt = imgTags.filter(img => !(/\balt\s*=/i.test(img)));
  results.checks.altAttr = {
    pass: imgsWithoutAlt.length === 0,
    missing: imgsWithoutAlt.length,
    msg: imgsWithoutAlt.length > 0 ? `${imgsWithoutAlt.length} missing` : null
  };
  
  return results;
}

// Run tests
console.log('🔍 SEO Smoke Test');
console.log('='.repeat(80));
console.log('');

const allResults = [];
let hasFailures = false;

// Test all pages
allPages.forEach(pagePath => {
  const isPublic = publicPages.includes(pagePath);
  const result = checkFile(pagePath, isPublic);
  allResults.push(result);
  
  if (!result.exists) {
    hasFailures = true;
    return;
  }
  
  // Check for failures
  Object.values(result.checks).forEach(check => {
    if (!check.pass && !check.skipped) {
      hasFailures = true;
    }
  });
});

// Output table
const colWidths = {
  file: 30,
  title: 7,
  desc: 6,
  canon: 7,
  robot: 7,
  h1: 5,
  alt: 8
};

function pad(str, width) {
  return str.toString().padEnd(width);
}

function center(str, width) {
  const padding = Math.max(0, width - str.length);
  const left = Math.floor(padding / 2);
  return ' '.repeat(left) + str + ' '.repeat(padding - left);
}

// Header
console.log(
  '| ' + pad('File', colWidths.file) +
  ' | ' + center('Title', colWidths.title) +
  ' | ' + center('Desc', colWidths.desc) +
  ' | ' + center('Canon', colWidths.canon) +
  ' | ' + center('Robot', colWidths.robot) +
  ' | ' + center('H1', colWidths.h1) +
  ' | ' + center('Alt', colWidths.alt) + ' |'
);

console.log(
  '|' + '-'.repeat(colWidths.file + 2) +
  '|' + '-'.repeat(colWidths.title + 2) +
  '|' + '-'.repeat(colWidths.desc + 2) +
  '|' + '-'.repeat(colWidths.canon + 2) +
  '|' + '-'.repeat(colWidths.robot + 2) +
  '|' + '-'.repeat(colWidths.h1 + 2) +
  '|' + '-'.repeat(colWidths.alt + 2) + '|'
);

// Rows
allResults.forEach(result => {
  if (!result.exists) {
    console.log(
      '| ' + pad(result.file, colWidths.file) +
      ' | ' + center('FILE NOT FOUND', colWidths.title + colWidths.desc + colWidths.canon + colWidths.robot + colWidths.h1 + colWidths.alt + 15) + ' |'
    );
    return;
  }
  
  const c = result.checks;
  
  const getStatus = (check) => {
    if (check.skipped) return '--';
    return check.pass ? '✅' : '❌';
  };
  
  console.log(
    '| ' + pad(result.file, colWidths.file) +
    ' | ' + center(getStatus(c.title), colWidths.title) +
    ' | ' + center(getStatus(c.metaDesc), colWidths.desc) +
    ' | ' + center(getStatus(c.canonical), colWidths.canon) +
    ' | ' + center(getStatus(c.robots), colWidths.robot) +
    ' | ' + center(getStatus(c.h1), colWidths.h1) +
    ' | ' + center(getStatus(c.altAttr), colWidths.alt) + ' |'
  );
});

console.log('');
console.log('='.repeat(80));

// Summary
const failures = [];
const warnings = [];

allResults.forEach(result => {
  if (!result.exists) {
    failures.push(`${result.file}: File not found`);
    return;
  }
  
  const c = result.checks;
  const file = result.file;
  
if (!c.title.pass) failures.push(`${file}: Title ${c.title.msg}`);
  if (!c.metaDesc.pass && !c.metaDesc.skipped) failures.push(`${file}: Meta description ${c.metaDesc.msg}`);
  if (!c.canonical.pass && !c.canonical.skipped) failures.push(`${file}: Canonical ${c.canonical.msg}`);
  if (!c.robots.pass && !c.robots.skipped) failures.push(`${file}: Robots ${c.robots.msg}`);
  if (!c.h1.pass) failures.push(`${file}: H1 ${c.h1.msg}`);
  if (!c.altAttr.pass) warnings.push(`${file}: ${c.altAttr.missing} image(s) missing alt attribute`);
});

if (failures.length > 0) {
  console.log('');
  console.log('❌ FAILURES:');
  failures.forEach(f => console.log(`   - ${f}`));
}

if (warnings.length > 0) {
  console.log('');
  console.log('⚠️  WARNINGS:');
  warnings.forEach(w => console.log(`   - ${w}`));
}

console.log('');
if (failures.length === 0 && warnings.length === 0) {
  console.log('✅ All SEO checks passed!');
} else if (failures.length === 0) {
  console.log(`⚠️  ${warnings.length} warning(s) - no critical failures`);
} else {
  console.log(`❌ ${failures.length} failure(s), ${warnings.length} warning(s)`);
}

// Exit with appropriate code
process.exit(failures.length > 0 ? 1 : 0);
