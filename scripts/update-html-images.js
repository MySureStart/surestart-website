#!/usr/bin/env node
/**
 * HTML Image Updater for SureStart Website
 * 
 * Updates HTML files to:
 * - Add loading="lazy" and decoding="async" for below-fold images
 * - Add width/height attributes where missing
 * - Convert key images to <picture> elements with WebP support
 * 
 * Usage: npm run images:update-html
 */

const sharp = require('sharp');
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
  optimizedDir: 'https://pub-dcb79d88e2ec4567824453cc853f55f3.r2.dev/images/optimized',
  
  // Images that should NOT be lazy loaded (above the fold)
  noLazyPatterns: [
    'surestart-logo',
    'favicon',
    'hero',
  ],
  
  // Images to convert to picture elements (high impact)
  picturePatterns: [
    'heroes/',
    'programs/',
    'projects/',
    'success-stories/',
    'team/',
    'misc/',
    'media/',
  ],
};

// Cache for image dimensions
const dimensionsCache = new Map();

/**
 * Get image dimensions
 */
async function getImageDimensions(imagePath) {
  // Check cache
  if (dimensionsCache.has(imagePath)) {
    return dimensionsCache.get(imagePath);
  }
  
  // Resolve path
  let fullPath = imagePath;
  if (!path.isAbsolute(imagePath)) {
    fullPath = path.join(process.cwd(), imagePath);
  }
  
  // Handle relative paths from subdirectories
  if (imagePath.startsWith('../')) {
    const normalized = path.normalize(imagePath.replace(/^(\.\.\/)+/, ''));
    fullPath = path.join(process.cwd(), normalized);
  }
  
  if (!fs.existsSync(fullPath)) {
    console.warn(`   ⚠ Image not found: ${imagePath}`);
    return null;
  }
  
  try {
    const metadata = await sharp(fullPath).metadata();
    const dimensions = { width: metadata.width, height: metadata.height };
    dimensionsCache.set(imagePath, dimensions);
    return dimensions;
  } catch (error) {
    console.warn(`   ⚠ Could not read dimensions for: ${imagePath}`);
    return null;
  }
}

/**
 * Check if optimized WebP exists
 */
function hasOptimizedWebP(originalPath) {
  // Convert original path to optimized WebP path
  const relativePath = originalPath
    .replace(/^(\.\.\/)*assets\/images\//, '')
    .replace(/\.(png|jpg|jpeg)$/i, '.webp');
  
  const webpPath = path.join(CONFIG.optimizedDir, relativePath);
  return fs.existsSync(webpPath) ? webpPath : null;
}

/**
 * Check if image should be lazy loaded
 */
function shouldLazyLoad(src, context = '') {
  // Don't lazy load above-fold images
  for (const pattern of CONFIG.noLazyPatterns) {
    if (src.toLowerCase().includes(pattern.toLowerCase())) {
      return false;
    }
  }
  
  // Don't lazy load if in hero section
  if (context.includes('hero')) {
    return false;
  }
  
  return true;
}

/**
 * Check if image should use picture element
 */
function shouldUsePicture(src) {
  for (const pattern of CONFIG.picturePatterns) {
    if (src.includes(pattern)) {
      return true;
    }
  }
  return false;
}

/**
 * Process a single img tag
 */
async function processImgTag(imgMatch, htmlContent, fileDir) {
  const originalImg = imgMatch[0];
  
  // Extract src
  const srcMatch = originalImg.match(/src=["']([^"']+)["']/);
  if (!srcMatch) return originalImg;
  
  const src = srcMatch[1];
  
  // Skip external images
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
    return originalImg;
  }
  
  // Skip SVGs and data URIs
  if (src.endsWith('.svg') || src.startsWith('data:')) {
    return originalImg;
  }
  
  // Resolve path relative to HTML file location
  let imagePath = src;
  if (src.startsWith('../')) {
    // Relative path from subdirectory
    imagePath = src;
  } else if (!src.startsWith('/')) {
    // Relative path
    imagePath = src;
  }
  
  // Get dimensions
  const dimensions = await getImageDimensions(imagePath);
  
  // Build new attributes
  let newImg = originalImg;
  
  // Add width/height if not present and dimensions available
  if (dimensions) {
    if (!originalImg.includes('width=')) {
      newImg = newImg.replace(/<img/, `<img width="${dimensions.width}"`);
    }
    if (!originalImg.includes('height=')) {
      newImg = newImg.replace(/<img/, `<img height="${dimensions.height}"`);
    }
  }
  
  // Add loading="lazy" if appropriate
  if (!newImg.includes('loading=') && shouldLazyLoad(src)) {
    newImg = newImg.replace(/<img/, '<img loading="lazy"');
  }
  
  // Add decoding="async" if not present
  if (!newImg.includes('decoding=')) {
    newImg = newImg.replace(/<img/, '<img decoding="async"');
  }
  
  // Check for WebP version and convert to picture element
  const webpPath = hasOptimizedWebP(src);
  if (webpPath && shouldUsePicture(src)) {
    // Build relative webp path
    let webpSrc = webpPath;
    if (fileDir !== '.') {
      // Adjust path for subdirectory HTML files
      const depth = fileDir.split('/').length;
      webpSrc = '../'.repeat(depth) + webpPath;
    }
    
    // Create picture element
    const pictureElement = `<picture>
  <source srcset="${webpSrc}" type="image/webp">
  ${newImg}
</picture>`;
    
    return pictureElement;
  }
  
  return newImg;
}

/**
 * Process an HTML file
 */
async function processHtmlFile(filePath) {
  console.log(`\n📄 Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  
  // Get directory of the HTML file for relative path resolution
  const fileDir = path.dirname(filePath);
  
  // Find all img tags (not already in picture elements)
  const imgRegex = /<img[^>]+>/gi;
  const matches = [...content.matchAll(imgRegex)];
  
  let updatedCount = 0;
  
  for (const match of matches) {
    const originalImg = match[0];
    
    // Skip if already in a picture element
    const imgIndex = match.index;
    const beforeImg = content.substring(Math.max(0, imgIndex - 50), imgIndex);
    if (beforeImg.includes('<picture>') || beforeImg.includes('<source')) {
      continue;
    }
    
    const newImg = await processImgTag(match, content, fileDir);
    
    if (newImg !== originalImg) {
      content = content.replace(originalImg, newImg);
      updatedCount++;
    }
  }
  
  // Only write if changes were made
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`   ✓ Updated ${updatedCount} images`);
    return updatedCount;
  } else {
    console.log(`   - No changes needed`);
    return 0;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🖼️  HTML Image Updater');
  console.log('======================\n');
  
  // Get all HTML files
  const htmlFiles = [];
  for (const pattern of CONFIG.htmlPatterns) {
    const files = await glob(pattern);
    htmlFiles.push(...files);
  }
  
  console.log(`Found ${htmlFiles.length} HTML files to process`);
  
  let totalUpdated = 0;
  
  for (const file of htmlFiles) {
    const updated = await processHtmlFile(file);
    totalUpdated += updated;
  }
  
  console.log('\n======================');
  console.log('📈 UPDATE COMPLETE');
  console.log('======================');
  console.log(`   Files processed: ${htmlFiles.length}`);
  console.log(`   Images updated:  ${totalUpdated}`);
  
  // Verify with asset checker if available
  console.log('\n🔍 Verifying image references...');
  try {
    const { execSync } = require('child_process');
    execSync('npm run assets:check', { stdio: 'inherit' });
  } catch (error) {
    console.log('   (Asset verification skipped or had warnings)');
  }
}

// Run
main().catch(console.error);
