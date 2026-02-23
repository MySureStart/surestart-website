#!/usr/bin/env node
/**
 * Image Optimization Script for SureStart Website
 * 
 * Converts PNG/JPG images to WebP format for better performance.
 * Preserves original files and outputs optimized versions to https://pub-dcb79d88e2ec4567824453cc853f55f3.r2.dev/images/optimized/
 * 
 * Usage: npm run images:optimize
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Configuration
const CONFIG = {
  inputDir: 'assets/images',
  outputDir: 'https://pub-dcb79d88e2ec4567824453cc853f55f3.r2.dev/images/optimized',
  reportPath: 'seo/image-optimization-report.md',
  
  // Skip patterns (relative to inputDir)
  skipPatterns: [
    '**/optimized/**',  // Skip already optimized
    '**/*.svg',         // Skip SVGs (already optimized)
    '**/*.webp',        // Skip existing WebPs
    '**/og/**',         // Skip OG images (SVG)
  ],
  
  // Skip files smaller than this (bytes) - likely icons
  minSizeBytes: 5000,  // 5KB minimum
  
  // Quality settings
  webpQuality: 80,
  jpegQuality: 85,
  pngCompressionLevel: 9,
  
  // Resize large images (max dimension)
  maxDimension: 2000,
  
  // Categories that benefit most from WebP
  priorityDirs: ['heroes', 'programs', 'projects', 'success-stories', 'team', 'media', 'misc'],
  
  // Skip logo directories (small files, need crisp edges)
  skipDirs: ['logos', 'icons'],
};

// Track statistics
const stats = {
  processed: 0,
  skipped: 0,
  errors: 0,
  totalOriginalSize: 0,
  totalOptimizedSize: 0,
  files: [],
};

/**
 * Get all image files to process
 */
async function getImageFiles() {
  const patterns = [
    `${CONFIG.inputDir}/**/*.png`,
    `${CONFIG.inputDir}/**/*.jpg`,
    `${CONFIG.inputDir}/**/*.jpeg`,
  ];
  
  const allFiles = [];
  
  for (const pattern of patterns) {
    const files = await glob(pattern, { nocase: true });
    allFiles.push(...files);
  }
  
  return allFiles.filter(file => {
    // Skip files in skip directories
    const relativePath = path.relative(CONFIG.inputDir, file);
    const dirName = relativePath.split(path.sep)[0];
    
    if (CONFIG.skipDirs.includes(dirName)) {
      return false;
    }
    
    // Skip optimized directory
    if (file.includes('optimized')) {
      return false;
    }
    
    return true;
  });
}

/**
 * Get image dimensions using sharp
 */
async function getImageDimensions(filePath) {
  try {
    const metadata = await sharp(filePath).metadata();
    return { width: metadata.width, height: metadata.height };
  } catch (error) {
    return null;
  }
}

/**
 * Optimize a single image
 */
async function optimizeImage(inputPath) {
  const relativePath = path.relative(CONFIG.inputDir, inputPath);
  const ext = path.extname(inputPath).toLowerCase();
  const baseName = path.basename(inputPath, ext);
  const dirName = path.dirname(relativePath);
  
  // Create output directory
  const outputDir = path.join(CONFIG.outputDir, dirName);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  try {
    const originalStats = fs.statSync(inputPath);
    const originalSize = originalStats.size;
    
    // Skip tiny files (likely icons)
    if (originalSize < CONFIG.minSizeBytes) {
      stats.skipped++;
      return { skipped: true, reason: 'too small', size: originalSize };
    }
    
    // Get original dimensions
    const dimensions = await getImageDimensions(inputPath);
    
    // WebP output path
    const webpOutputPath = path.join(outputDir, `${baseName}.webp`);
    
    // Create sharp instance
    let pipeline = sharp(inputPath);
    
    // Resize if too large
    if (dimensions && (dimensions.width > CONFIG.maxDimension || dimensions.height > CONFIG.maxDimension)) {
      pipeline = pipeline.resize(CONFIG.maxDimension, CONFIG.maxDimension, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }
    
    // Convert to WebP
    await pipeline
      .webp({ quality: CONFIG.webpQuality })
      .toFile(webpOutputPath);
    
    const optimizedStats = fs.statSync(webpOutputPath);
    const optimizedSize = optimizedStats.size;
    
    // Calculate savings
    const savings = originalSize - optimizedSize;
    const savingsPercent = ((savings / originalSize) * 100).toFixed(1);
    
    // Only keep if there's actual savings (> 10%)
    if (savings <= 0 || parseFloat(savingsPercent) < 10) {
      fs.unlinkSync(webpOutputPath);
      stats.skipped++;
      return { skipped: true, reason: 'no significant savings', size: originalSize };
    }
    
    stats.processed++;
    stats.totalOriginalSize += originalSize;
    stats.totalOptimizedSize += optimizedSize;
    
    const result = {
      original: relativePath,
      optimized: path.relative('.', webpOutputPath),
      originalSize,
      optimizedSize,
      savings,
      savingsPercent,
      dimensions,
    };
    
    stats.files.push(result);
    
    return result;
    
  } catch (error) {
    stats.errors++;
    console.error(`Error processing ${inputPath}:`, error.message);
    return { error: error.message, file: inputPath };
  }
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Generate markdown report
 */
function generateReport() {
  const totalSavings = stats.totalOriginalSize - stats.totalOptimizedSize;
  const totalSavingsPercent = stats.totalOriginalSize > 0 
    ? ((totalSavings / stats.totalOriginalSize) * 100).toFixed(1)
    : 0;
  
  const now = new Date().toISOString().split('T')[0];
  
  let report = `# Image Optimization Report

**Generated:** ${now}
**Tool:** sharp (WebP conversion)

---

## Summary

| Metric | Value |
|--------|-------|
| Images Processed | ${stats.processed} |
| Images Skipped | ${stats.skipped} |
| Errors | ${stats.errors} |
| Original Total Size | ${formatBytes(stats.totalOriginalSize)} |
| Optimized Total Size | ${formatBytes(stats.totalOptimizedSize)} |
| **Total Savings** | **${formatBytes(totalSavings)} (${totalSavingsPercent}%)** |

---

## Optimization Details

| Original File | Original Size | WebP Size | Savings |
|---------------|---------------|-----------|---------|
`;

  // Sort by savings (largest first)
  const sortedFiles = stats.files.sort((a, b) => b.savings - a.savings);
  
  for (const file of sortedFiles) {
    report += `| \`${file.original}\` | ${formatBytes(file.originalSize)} | ${formatBytes(file.optimizedSize)} | ${formatBytes(file.savings)} (${file.savingsPercent}%) |\n`;
  }

  report += `

---

## Usage Instructions

### HTML Implementation

For optimized images, use the \`<picture>\` element with WebP source and fallback:

\`\`\`html
<picture>
  <source srcset="https://pub-dcb79d88e2ec4567824453cc853f55f3.r2.dev/images/optimized/heroes/hero-image.webp" type="image/webp">
  <img src="https://pub-dcb79d88e2ec4567824453cc853f55f3.r2.dev/images/heroes/hero-image.jpg" alt="Description" width="1920" height="1080" loading="lazy" decoding="async">
</picture>
\`\`\`

### Key Recommendations

1. **Hero Images**: Use WebP with fallback for LCP improvement
2. **Below-fold Images**: Add \`loading="lazy"\` and \`decoding="async"\`
3. **All Images**: Add explicit \`width\` and \`height\` attributes to prevent CLS

---

## File Locations

- **Original images:** \`https://pub-dcb79d88e2ec4567824453cc853f55f3.r2.dev/images/\`
- **Optimized WebP:** \`https://pub-dcb79d88e2ec4567824453cc853f55f3.r2.dev/images/optimized/\`
- **This report:** \`/seo/image-optimization-report.md\`

---

## Next Steps

1. Update HTML files to use \`<picture>\` elements for key images
2. Add \`loading="lazy"\` to below-fold images
3. Add width/height attributes to prevent layout shift
4. Run Lighthouse to verify improvements

`;

  return report;
}

/**
 * Main function
 */
async function main() {
  console.log('🖼️  Image Optimization Script');
  console.log('============================\n');
  
  // Ensure output directory exists
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }
  
  // Get all image files
  console.log('📂 Scanning for images...');
  const files = await getImageFiles();
  console.log(`   Found ${files.length} images to process\n`);
  
  // Process each file
  console.log('⚙️  Processing images...');
  for (const file of files) {
    const result = await optimizeImage(file);
    if (result && !result.skipped && !result.error) {
      console.log(`   ✓ ${path.basename(file)} → WebP (${result.savingsPercent}% smaller)`);
    }
  }
  
  // Generate report
  console.log('\n📊 Generating report...');
  const report = generateReport();
  
  // Ensure seo directory exists
  const seoDir = path.dirname(CONFIG.reportPath);
  if (!fs.existsSync(seoDir)) {
    fs.mkdirSync(seoDir, { recursive: true });
  }
  
  fs.writeFileSync(CONFIG.reportPath, report);
  
  // Print summary
  const totalSavings = stats.totalOriginalSize - stats.totalOptimizedSize;
  const totalSavingsPercent = stats.totalOriginalSize > 0 
    ? ((totalSavings / stats.totalOriginalSize) * 100).toFixed(1)
    : 0;
  
  console.log('\n============================');
  console.log('📈 OPTIMIZATION COMPLETE');
  console.log('============================');
  console.log(`   Processed: ${stats.processed} images`);
  console.log(`   Skipped:   ${stats.skipped} images`);
  console.log(`   Errors:    ${stats.errors}`);
  console.log(`   Savings:   ${formatBytes(totalSavings)} (${totalSavingsPercent}%)`);
  console.log(`\n📄 Report saved to: ${CONFIG.reportPath}`);
}

// Run
main().catch(console.error);
