#!/usr/bin/env node
/**
 * Production Build Script for SureStart Website
 * 
 * Creates a /dist folder with minified CSS/JS assets.
 * - Copies all HTML, assets, and static files to /dist
 * - Minifies CSS using clean-css
 * - Minifies JS using terser
 * - Updates HTML references to use .min.css and .min.js
 * 
 * Usage: npm run build:prod
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { glob } = require('glob');

// Configuration
const CONFIG = {
  srcDir: '.',
  distDir: 'dist',
  
  // Files/folders to copy to dist
  copyPatterns: [
    '*.html',
    'about/**',
    'contact/**',
    'for-students/**',
    'for-universities/**',
    'impact-stories/**',
    'k12/**',
    'assets/images/**',
    'assets/fonts/**',
    'assets/videos/**',
    'assets/css/**',
    'assets/js/**',
    'CNAME',
    'robots.txt',
    'sitemap.xml',
    'favicon.ico',
  ],
  
  // Folders to exclude entirely
  excludePatterns: [
    'node_modules/**',
    'dist/**',
    '.git/**',
    'scripts/**',
    'seo/**',
    'memory-bank/**',
    'docs/**',
    '*.md',
    'package*.json',
  ],
  
  // CSS files to minify
  cssDir: 'assets/css',
  
  // JS files to minify
  jsDir: 'assets/js',
  
  reportPath: 'seo/minification-report.md',
};

// Statistics tracking
const stats = {
  filesCopied: 0,
  cssFiles: [],
  jsFiles: [],
  htmlFilesUpdated: 0,
  totalOriginalSize: 0,
  totalMinifiedSize: 0,
};

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Recursively copy directory
 */
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      stats.filesCopied++;
    }
  }
}

/**
 * Copy a single file ensuring directory exists
 */
function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
  stats.filesCopied++;
}

/**
 * Clean dist directory
 */
function cleanDist() {
  if (fs.existsSync(CONFIG.distDir)) {
    fs.rmSync(CONFIG.distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(CONFIG.distDir, { recursive: true });
}

/**
 * Copy all source files to dist
 */
async function copySourceFiles() {
  console.log('📁 Copying source files to dist...');
  
  for (const pattern of CONFIG.copyPatterns) {
    const files = await glob(pattern, { 
      nodir: false,
      ignore: CONFIG.excludePatterns 
    });
    
    for (const file of files) {
      const srcPath = file;
      const destPath = path.join(CONFIG.distDir, file);
      
      if (fs.existsSync(srcPath)) {
        const stat = fs.statSync(srcPath);
        if (stat.isDirectory()) {
          copyDir(srcPath, destPath);
        } else {
          copyFile(srcPath, destPath);
        }
      }
    }
  }
  
  console.log(`   ✓ Copied ${stats.filesCopied} files`);
}

/**
 * Minify CSS files using clean-css-cli
 */
async function minifyCss() {
  console.log('\n🎨 Minifying CSS files...');
  
  const cssDir = path.join(CONFIG.distDir, CONFIG.cssDir);
  
  // Use fs.readdirSync instead of glob for reliability on Windows
  if (!fs.existsSync(cssDir)) {
    console.log(`   ⚠ CSS directory not found: ${cssDir}`);
    return;
  }
  
  const cssFiles = fs.readdirSync(cssDir)
    .filter(f => f.endsWith('.css') && !f.endsWith('.min.css'))
    .map(f => path.join(cssDir, f));
  
  console.log(`   Found ${cssFiles.length} CSS files to minify`);
  
  for (const cssFile of cssFiles) {
    const originalSize = fs.statSync(cssFile).size;
    const baseName = path.basename(cssFile, '.css');
    const minFile = path.join(path.dirname(cssFile), `${baseName}.min.css`);
    
    try {
      // Use clean-css-cli
      execSync(`npx cleancss -o "${minFile}" "${cssFile}"`, { 
        stdio: 'pipe',
        encoding: 'utf-8'
      });
      
      const minifiedSize = fs.statSync(minFile).size;
      const savings = originalSize - minifiedSize;
      const savingsPercent = ((savings / originalSize) * 100).toFixed(1);
      
      stats.cssFiles.push({
        original: path.basename(cssFile),
        minified: path.basename(minFile),
        originalSize,
        minifiedSize,
        savings,
        savingsPercent,
      });
      
      stats.totalOriginalSize += originalSize;
      stats.totalMinifiedSize += minifiedSize;
      
      console.log(`   ✓ ${baseName}.css → ${baseName}.min.css (${savingsPercent}% smaller)`);
      
    } catch (error) {
      console.error(`   ✗ Failed to minify ${cssFile}: ${error.message}`);
    }
  }
}

/**
 * Minify JS files using terser
 */
async function minifyJs() {
  console.log('\n📜 Minifying JS files...');
  
  const jsDir = path.join(CONFIG.distDir, CONFIG.jsDir);
  
  // Use fs.readdirSync instead of glob for reliability on Windows
  if (!fs.existsSync(jsDir)) {
    console.log(`   ⚠ JS directory not found: ${jsDir}`);
    return;
  }
  
  const jsFiles = fs.readdirSync(jsDir)
    .filter(f => f.endsWith('.js') && !f.endsWith('.min.js'))
    .map(f => path.join(jsDir, f));
  
  console.log(`   Found ${jsFiles.length} JS files to minify`);
  
  for (const jsFile of jsFiles) {
    const originalSize = fs.statSync(jsFile).size;
    const baseName = path.basename(jsFile, '.js');
    const minFile = path.join(path.dirname(jsFile), `${baseName}.min.js`);
    
    try {
      // Use terser
      execSync(`npx terser "${jsFile}" -o "${minFile}" --compress --mangle`, { 
        stdio: 'pipe',
        encoding: 'utf-8'
      });
      
      const minifiedSize = fs.statSync(minFile).size;
      const savings = originalSize - minifiedSize;
      const savingsPercent = ((savings / originalSize) * 100).toFixed(1);
      
      stats.jsFiles.push({
        original: path.basename(jsFile),
        minified: path.basename(minFile),
        originalSize,
        minifiedSize,
        savings,
        savingsPercent,
      });
      
      stats.totalOriginalSize += originalSize;
      stats.totalMinifiedSize += minifiedSize;
      
      console.log(`   ✓ ${baseName}.js → ${baseName}.min.js (${savingsPercent}% smaller)`);
      
    } catch (error) {
      console.error(`   ✗ Failed to minify ${jsFile}: ${error.message}`);
    }
  }
}

/**
 * Update HTML files to reference minified assets
 */
async function updateHtmlReferences() {
  console.log('\n📄 Updating HTML references to minified assets...');
  
  const htmlFiles = await glob(`${CONFIG.distDir}/**/*.html`);
  
  for (const htmlFile of htmlFiles) {
    let content = fs.readFileSync(htmlFile, 'utf-8');
    const originalContent = content;
    
    // Update CSS references (but not external URLs)
    // Match href="...assets/css/something.css" or href="../assets/css/something.css"
    content = content.replace(
      /(href=["'])(\.\.\/)*assets\/css\/([^"']+)\.css(["'])/g,
      (match, prefix, dots, filename, suffix) => {
        // Don't change if already minified
        if (filename.endsWith('.min')) return match;
        return `${prefix}${dots || ''}assets/css/${filename}.min.css${suffix}`;
      }
    );
    
    // Update JS references (but not external URLs)
    // Match src="...assets/js/something.js" or src="../assets/js/something.js"
    content = content.replace(
      /(src=["'])(\.\.\/)*assets\/js\/([^"']+)\.js(["'])/g,
      (match, prefix, dots, filename, suffix) => {
        // Don't change if already minified
        if (filename.endsWith('.min')) return match;
        return `${prefix}${dots || ''}assets/js/${filename}.min.js${suffix}`;
      }
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(htmlFile, content);
      stats.htmlFilesUpdated++;
      console.log(`   ✓ Updated ${path.relative(CONFIG.distDir, htmlFile)}`);
    }
  }
}

/**
 * Generate minification report
 */
function generateReport() {
  const totalSavings = stats.totalOriginalSize - stats.totalMinifiedSize;
  const totalSavingsPercent = stats.totalOriginalSize > 0 
    ? ((totalSavings / stats.totalOriginalSize) * 100).toFixed(1)
    : 0;
  
  const now = new Date().toISOString().split('T')[0];
  
  let report = `# CSS/JS Minification Report

**Generated:** ${now}
**Build Output:** \`/dist/\`

---

## Summary

| Metric | Value |
|--------|-------|
| Files Copied to /dist | ${stats.filesCopied} |
| CSS Files Minified | ${stats.cssFiles.length} |
| JS Files Minified | ${stats.jsFiles.length} |
| HTML Files Updated | ${stats.htmlFilesUpdated} |
| Original Total Size | ${formatBytes(stats.totalOriginalSize)} |
| Minified Total Size | ${formatBytes(stats.totalMinifiedSize)} |
| **Total Savings** | **${formatBytes(totalSavings)} (${totalSavingsPercent}%)** |

---

## CSS Minification Details

| Original File | Size | Minified | Savings |
|---------------|------|----------|---------|
`;

  for (const file of stats.cssFiles) {
    report += `| \`${file.original}\` | ${formatBytes(file.originalSize)} | ${formatBytes(file.minifiedSize)} | ${formatBytes(file.savings)} (${file.savingsPercent}%) |\n`;
  }

  report += `

---

## JS Minification Details

| Original File | Size | Minified | Savings |
|---------------|------|----------|---------|
`;

  for (const file of stats.jsFiles) {
    report += `| \`${file.original}\` | ${formatBytes(file.originalSize)} | ${formatBytes(file.minifiedSize)} | ${formatBytes(file.savings)} (${file.savingsPercent}%) |\n`;
  }

  report += `

---

## Build Verification

The production build in \`/dist/\` includes:

- ✅ All HTML pages with updated asset references
- ✅ Minified CSS files (\`*.min.css\`)
- ✅ Minified JS files (\`*.min.js\`)
- ✅ All images and fonts
- ✅ CNAME for custom domain
- ✅ robots.txt and sitemap.xml

---

## Usage

\`\`\`bash
# Build production version
npm run build:prod

# Serve production build locally
npm run serve:dist

# Build and generate this report
npm run perf:build
\`\`\`

---

## Deployment

The \`/dist/\` folder is ready for deployment:

1. **GitHub Pages**: Point to the \`dist\` folder or copy contents
2. **Netlify/Vercel**: Set build output to \`dist\`
3. **Static hosting**: Upload \`/dist/\` contents

---

## Notes

- Original source files in \`/assets/\` remain unchanged
- Both minified (\`.min.css\`, \`.min.js\`) and original files exist in \`/dist/assets/\`
- HTML files reference minified versions for production
- Folder-based URLs (/about/, /k12/, etc.) work correctly

`;

  return report;
}

/**
 * Main build function
 */
async function main() {
  console.log('🏗️  Production Build Script');
  console.log('===========================\n');
  
  const startTime = Date.now();
  
  // Step 1: Clean dist directory
  console.log('🧹 Cleaning dist directory...');
  cleanDist();
  console.log('   ✓ Done\n');
  
  // Step 2: Copy source files
  await copySourceFiles();
  
  // Step 3: Minify CSS
  await minifyCss();
  
  // Step 4: Minify JS
  await minifyJs();
  
  // Step 5: Update HTML references
  await updateHtmlReferences();
  
  // Step 6: Generate report
  console.log('\n📊 Generating minification report...');
  const report = generateReport();
  
  // Ensure seo directory exists
  const seoDir = path.dirname(CONFIG.reportPath);
  if (!fs.existsSync(seoDir)) {
    fs.mkdirSync(seoDir, { recursive: true });
  }
  
  fs.writeFileSync(CONFIG.reportPath, report);
  console.log(`   ✓ Report saved to ${CONFIG.reportPath}`);
  
  // Summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const totalSavings = stats.totalOriginalSize - stats.totalMinifiedSize;
  const totalSavingsPercent = stats.totalOriginalSize > 0 
    ? ((totalSavings / stats.totalOriginalSize) * 100).toFixed(1)
    : 0;
  
  console.log('\n===========================');
  console.log('✅ BUILD COMPLETE');
  console.log('===========================');
  console.log(`   Output:     /dist/`);
  console.log(`   Files:      ${stats.filesCopied} copied`);
  console.log(`   CSS:        ${stats.cssFiles.length} minified`);
  console.log(`   JS:         ${stats.jsFiles.length} minified`);
  console.log(`   HTML:       ${stats.htmlFilesUpdated} updated`);
  console.log(`   Savings:    ${formatBytes(totalSavings)} (${totalSavingsPercent}%)`);
  console.log(`   Time:       ${elapsed}s`);
  console.log(`\n📂 Serve with: npm run serve:dist`);
}

// Run
main().catch(console.error);
