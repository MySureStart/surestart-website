#!/usr/bin/env node
/**
 * Asset Validation Script
 * Crawls HTML and CSS files to verify all local asset references exist.
 * 
 * Usage: node scripts/validate-assets.js
 * Exit codes: 0 = success, 1 = missing assets found
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const HTML_PAGES = [
  'index.html',
  'about/index.html',
  'contact/index.html',
  'for-students/index.html',
  'for-universities/index.html',
  'impact-stories/index.html',
  'k12/index.html'
];

const CSS_PATTERN = 'assets/css/*.css';

// Results storage
const results = {
  htmlRefs: [],
  cssRefs: [],
  missing: []
};

/**
 * Check if a path should be skipped (external URL, data URI, etc.)
 */
function shouldSkip(ref) {
  if (!ref) return true;
  ref = ref.trim();
  if (ref === '') return true;
  if (ref === '/') return true; // Root path is valid
  if (ref === '/vibe-lab/' || ref.includes('vibe-lab')) return true; // Future page
  if (ref.startsWith('http://') || ref.startsWith('https://') || ref.startsWith('//')) return true;
  if (ref.startsWith('data:')) return true;
  if (ref.startsWith('mailto:') || ref.startsWith('tel:')) return true;
  if (ref.startsWith('#')) return true;
  if (ref.startsWith('%23')) return true; // URL-encoded # in inline SVG
  if (ref.startsWith('javascript:')) return true;
  return false;
}

/**
 * Resolve asset path to actual file location
 */
function resolveAssetPath(reference, sourceFile) {
  // Remove query strings and fragments
  let cleanRef = reference.split('?')[0].split('#')[0];
  
  if (cleanRef.startsWith('/')) {
    // Root-relative: /assets/... → assets/...
    return cleanRef.slice(1);
  } else {
    // Relative path: resolve from source file directory
    const sourceDir = path.dirname(sourceFile);
    return path.normalize(path.join(sourceDir, cleanRef));
  }
}

/**
 * Extract href/src references from HTML content
 */
function extractHtmlRefs(content, sourceFile) {
  const refs = [];
  
  // Match href="..." and src="..." attributes
  const attrRegex = /(?:href|src)=["']([^"']+)["']/gi;
  let match;
  while ((match = attrRegex.exec(content)) !== null) {
    const ref = match[1];
    if (!shouldSkip(ref)) {
      refs.push({
        reference: ref,
        resolved: resolveAssetPath(ref, sourceFile),
        sourceFile,
        line: content.substring(0, match.index).split('\n').length
      });
    }
  }
  
  // Match inline style url(...) 
  const styleUrlRegex = /style=["'][^"']*url\(['"]?([^'")\s]+)['"]?\)/gi;
  while ((match = styleUrlRegex.exec(content)) !== null) {
    const ref = match[1];
    if (!shouldSkip(ref)) {
      refs.push({
        reference: ref,
        resolved: resolveAssetPath(ref, sourceFile),
        sourceFile,
        line: content.substring(0, match.index).split('\n').length
      });
    }
  }
  
  return refs;
}

/**
 * Extract url(...) references from CSS content
 */
function extractCssRefs(content, sourceFile) {
  const refs = [];
  
  // Match url(...) - handle both quoted and unquoted
  const urlRegex = /url\(['"]?([^'")\s]+)['"]?\)/gi;
  let match;
  while ((match = urlRegex.exec(content)) !== null) {
    const ref = match[1];
    if (!shouldSkip(ref)) {
      refs.push({
        reference: ref,
        resolved: resolveAssetPath(ref, sourceFile),
        sourceFile,
        line: content.substring(0, match.index).split('\n').length
      });
    }
  }
  
  return refs;
}

/**
 * Check if file exists
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * Main validation function
 */
function validate() {
  console.log('================================================================================');
  console.log('ASSET VALIDATION REPORT');
  console.log('================================================================================\n');

  // Process HTML files
  console.log('--------------------------------------------------------------------------------');
  console.log('HTML ASSET REFERENCES');
  console.log('--------------------------------------------------------------------------------\n');

  let totalHtmlRefs = 0;
  for (const htmlFile of HTML_PAGES) {
    if (!fs.existsSync(htmlFile)) {
      console.log(`⚠️  ${htmlFile} - FILE NOT FOUND`);
      continue;
    }
    
    const content = fs.readFileSync(htmlFile, 'utf8');
    const refs = extractHtmlRefs(content, htmlFile);
    totalHtmlRefs += refs.length;
    
    const missing = refs.filter(r => !fileExists(r.resolved));
    
    if (missing.length === 0) {
      console.log(`✅ ${htmlFile} (${refs.length} refs) - All OK`);
    } else {
      console.log(`❌ ${htmlFile} (${refs.length} refs) - ${missing.length} MISSING:`);
      missing.forEach(m => {
        console.log(`   • ${m.reference} (line ${m.line})`);
        console.log(`     → resolves to: ${m.resolved}`);
        results.missing.push(m);
      });
    }
    
    results.htmlRefs.push({ file: htmlFile, refs, missing });
  }

  // Process CSS files
  console.log('\n--------------------------------------------------------------------------------');
  console.log('CSS url() REFERENCES');
  console.log('--------------------------------------------------------------------------------\n');

  const cssFiles = glob.sync(CSS_PATTERN);
  let totalCssRefs = 0;
  
  for (const cssFile of cssFiles) {
    const content = fs.readFileSync(cssFile, 'utf8');
    const refs = extractCssRefs(content, cssFile);
    totalCssRefs += refs.length;
    
    const missing = refs.filter(r => !fileExists(r.resolved));
    
    if (missing.length === 0) {
      console.log(`✅ ${cssFile} (${refs.length} refs) - All OK`);
    } else {
      console.log(`❌ ${cssFile} (${refs.length} refs) - ${missing.length} MISSING:`);
      missing.forEach(m => {
        console.log(`   • ${m.reference} (line ${m.line})`);
        console.log(`     → resolves to: ${m.resolved}`);
        results.missing.push(m);
      });
    }
    
    results.cssRefs.push({ file: cssFile, refs, missing });
  }

  // Summary
  console.log('\n--------------------------------------------------------------------------------');
  console.log('SUMMARY');
  console.log('--------------------------------------------------------------------------------\n');

  console.log(`📄 HTML Pages Scanned: ${HTML_PAGES.length}`);
  console.log(`📂 CSS Files Scanned: ${cssFiles.length}`);
  console.log(`🔗 Total References Checked: ${totalHtmlRefs + totalCssRefs}`);
  console.log('');
  
  const totalOk = totalHtmlRefs + totalCssRefs - results.missing.length;
  console.log(`✅ ${totalOk} references OK`);
  
  if (results.missing.length > 0) {
    console.log(`❌ ${results.missing.length} references MISSING\n`);
    console.log('Missing Files:');
    results.missing.forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.resolved}`);
      console.log(`     Referenced as: ${m.reference}`);
      console.log(`     In: ${m.sourceFile} (line ${m.line})\n`);
    });
    
    console.log('================================================================================');
    console.log(`❌ VALIDATION FAILED - ${results.missing.length} missing assets`);
    console.log('================================================================================');
    process.exit(1);
  } else {
    console.log('\n================================================================================');
    console.log('✅ VALIDATION PASSED - All assets found');
    console.log('================================================================================');
    process.exit(0);
  }
}

// Run validation
validate();
