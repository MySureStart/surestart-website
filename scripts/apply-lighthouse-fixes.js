#!/usr/bin/env node
/**
 * Apply Lighthouse Performance Fixes to HTML Files
 * 
 * This script applies common Lighthouse fixes:
 * - Add defer to local JS scripts
 * - Add font preload for Eastman Grotesque
 * 
 * Usage: node scripts/apply-lighthouse-fixes.js
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Configuration
const CONFIG = {
  htmlPatterns: [
    '*.html',
    'about/*.html',
    'contact/*.html',
    'for-students/*.html',
    'for-universities/*.html',
    'impact-stories/*.html',
    'k12/*.html',
  ],
  
  fontPreloadTag: '<link rel="preload" href="$FONTS_PATH$eastman_grotesque/eastmangrotesque_medium_macroman/eastmangrotesque-medium-webfont.woff2" as="font" type="font/woff2" crossorigin>',
};

let stats = {
  filesProcessed: 0,
  deferAdded: 0,
  fontPreloadAdded: 0,
};

/**
 * Process a single HTML file
 */
function processHtmlFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  
  // Determine path prefix for assets (subdirectories need ../)
  const depth = filePath.split(/[\\/]/).length - 1;
  const assetPrefix = depth > 0 ? '../'.repeat(depth) : '';
  const fontsPath = `${assetPrefix}assets/fonts/`;
  
  // 1. Add defer to local script tags (assets/js/*.js)
  // Match <script src="...assets/js/something.js"></script> without defer
  const scriptRegex = /(<script\s+)(?!.*\bdefer\b)(src=["'](\.\.\/)*assets\/js\/[^"']+\.js["'])(\s*><\/script>)/gi;
  const newContent1 = content.replace(scriptRegex, (match, prefix, srcAttr, dots, suffix) => {
    stats.deferAdded++;
    return `${prefix}${srcAttr} defer${suffix}`;
  });
  
  if (newContent1 !== content) {
    content = newContent1;
  }
  
  // 2. Add font preload if not already present
  if (!content.includes('preload') || !content.includes('eastmangrotesque')) {
    // Find location to insert (after last preconnect or before </head>)
    const preconnectMatch = content.match(/<link rel="preconnect"[^>]+>\s*/g);
    const fontPreload = CONFIG.fontPreloadTag.replace('$FONTS_PATH$', fontsPath);
    
    if (preconnectMatch) {
      // Insert after last preconnect
      const lastPreconnect = preconnectMatch[preconnectMatch.length - 1];
      const lastIndex = content.lastIndexOf(lastPreconnect) + lastPreconnect.length;
      content = content.slice(0, lastIndex) + '\n' + fontPreload + content.slice(lastIndex);
      stats.fontPreloadAdded++;
    } else if (content.includes('</head>')) {
      // Insert before </head>
      content = content.replace('</head>', fontPreload + '\n</head>');
      stats.fontPreloadAdded++;
    }
  }
  
  // Only write if changes were made
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`   ✓ Updated`);
    stats.filesProcessed++;
    return true;
  } else {
    console.log(`   - No changes needed`);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔧 Applying Lighthouse Performance Fixes');
  console.log('========================================\n');
  
  // Get all HTML files
  const htmlFiles = [];
  for (const pattern of CONFIG.htmlPatterns) {
    const files = await glob(pattern);
    htmlFiles.push(...files);
  }
  
  console.log(`Found ${htmlFiles.length} HTML files\n`);
  
  for (const file of htmlFiles) {
    processHtmlFile(file);
  }
  
  console.log('\n========================================');
  console.log('✅ FIXES APPLIED');
  console.log('========================================');
  console.log(`   Files updated: ${stats.filesProcessed}`);
  console.log(`   Defer added:   ${stats.deferAdded} scripts`);
  console.log(`   Font preload:  ${stats.fontPreloadAdded} tags added`);
  
  console.log('\n📋 Changes Summary:');
  console.log('   - Added defer attribute to local JS scripts');
  console.log('   - Added font preload for Eastman Grotesque');
  console.log('\n🚀 Run npm run build:prod to rebuild, then npm run perf:lighthouse to audit');
}

// Run
main().catch(console.error);
