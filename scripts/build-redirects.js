#!/usr/bin/env node
/**
 * Redirect Builder
 * 
 * Exports redirects.csv to multiple formats:
 * - Netlify: /dist/redirects/_redirects
 * - Vercel: /dist/redirects/vercel.json
 * - nginx: /dist/redirects/nginx.conf
 * 
 * Usage:
 *   node scripts/build-redirects.js
 */

const fs = require('fs');
const path = require('path');

// Paths
const REDIRECTS_CSV = path.resolve(__dirname, '../seo/redirects.csv');
const DIST_DIR = path.resolve(__dirname, '../dist');
const OUTPUT_DIR = path.join(DIST_DIR, 'redirects');

/**
 * Parse CSV file into array of redirect objects
 */
function parseCSV(content) {
  const lines = content.split('\n');
  const redirects = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines, comments, and header
    if (!line || line.startsWith('#') || line.toLowerCase().startsWith('from,')) {
      continue;
    }
    
    const parts = line.split(',');
    if (parts.length < 3) continue;
    
    let from = parts[0].trim();
    let to = parts[1].trim();
    const status = parts[2].trim();
    const note = parts.slice(3).join(',').trim();
    
    // Normalize paths to have leading slash
    if (!from.startsWith('/')) from = '/' + from;
    if (!to.startsWith('/') && !to.startsWith('http')) to = '/' + to;
    
    redirects.push({ from, to, status, note });
  }
  
  return redirects;
}

/**
 * Generate Netlify _redirects format
 * Format: /from /to STATUS
 */
function generateNetlify(redirects) {
  const header = `# Netlify Redirects
# Generated from /seo/redirects.csv
# Documentation: https://docs.netlify.com/routing/redirects/

`;
  
  const rules = redirects.map(r => {
    const comment = r.note ? `  # ${r.note}` : '';
    return `${r.from}  ${r.to}  ${r.status}${comment}`;
  }).join('\n');
  
  return header + rules + '\n';
}

/**
 * Generate Vercel redirects JSON format
 */
function generateVercel(redirects) {
  const vercelRedirects = redirects.map(r => ({
    source: r.from,
    destination: r.to,
    permanent: r.status === '301'
  }));
  
  const config = {
    redirects: vercelRedirects
  };
  
  return JSON.stringify(config, null, 2) + '\n';
}

/**
 * Generate nginx redirect configuration snippet
 */
function generateNginx(redirects) {
  const header = `# nginx Redirect Configuration
# Generated from /seo/redirects.csv
# Include this file in your server block: include /path/to/redirects.conf;

`;
  
  const rules = redirects.map(r => {
    const comment = r.note ? `    # ${r.note}\n` : '';
    // Use exact match for simple paths, regex for patterns
    if (r.from.includes('*')) {
      // Convert glob pattern to regex
      const regex = r.from.replace(/\*/g, '(.*)');
      const replacement = r.to.replace(/\*/g, '$1');
      return `${comment}location ~ ^${regex}$ {
    return ${r.status} ${replacement};
}`;
    } else {
      return `${comment}location = ${r.from} {
    return ${r.status} ${r.to};
}`;
    }
  }).join('\n\n');
  
  return header + rules + '\n';
}

/**
 * Generate Apache .htaccess format
 */
function generateApache(redirects) {
  const header = `# Apache .htaccess Redirects
# Generated from /seo/redirects.csv
# Add these rules to your .htaccess file

RewriteEngine On

`;
  
  const rules = redirects.map(r => {
    const comment = r.note ? `# ${r.note}\n` : '';
    const flag = r.status === '301' ? 'R=301,L' : 'R=302,L';
    // Escape special regex characters in from path
    const fromEscaped = r.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return `${comment}RewriteRule ^${fromEscaped.substring(1)}$ ${r.to} [${flag}]`;
  }).join('\n');
  
  return header + rules + '\n';
}

/**
 * Ensure directory exists
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Main build function
 */
function main() {
  console.log('📦 Building redirect configurations...\n');
  
  // Check if CSV exists
  if (!fs.existsSync(REDIRECTS_CSV)) {
    console.error('❌ Error: /seo/redirects.csv not found');
    process.exit(1);
  }
  
  // Check if dist exists
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Error: /dist directory not found. Run "npm run build" first.');
    process.exit(1);
  }
  
  // Parse CSV
  const content = fs.readFileSync(REDIRECTS_CSV, 'utf8');
  const redirects = parseCSV(content);
  
  console.log(`Found ${redirects.length} redirect rules\n`);
  
  if (redirects.length === 0) {
    console.log('⚠️  No redirects to process');
    return;
  }
  
  // Ensure output directory exists
  ensureDir(OUTPUT_DIR);
  
  // Generate and write Netlify format
  const netlifyContent = generateNetlify(redirects);
  const netlifyPath = path.join(OUTPUT_DIR, '_redirects');
  fs.writeFileSync(netlifyPath, netlifyContent, 'utf8');
  console.log('  ✓ Netlify: /dist/redirects/_redirects');
  
  // Generate and write Vercel format
  const vercelContent = generateVercel(redirects);
  const vercelPath = path.join(OUTPUT_DIR, 'vercel.json');
  fs.writeFileSync(vercelPath, vercelContent, 'utf8');
  console.log('  ✓ Vercel:  /dist/redirects/vercel.json');
  
  // Generate and write nginx format
  const nginxContent = generateNginx(redirects);
  const nginxPath = path.join(OUTPUT_DIR, 'nginx.conf');
  fs.writeFileSync(nginxPath, nginxContent, 'utf8');
  console.log('  ✓ nginx:   /dist/redirects/nginx.conf');
  
  // Generate and write Apache format (bonus)
  const apacheContent = generateApache(redirects);
  const apachePath = path.join(OUTPUT_DIR, '.htaccess');
  fs.writeFileSync(apachePath, apacheContent, 'utf8');
  console.log('  ✓ Apache:  /dist/redirects/.htaccess');
  
  // Also copy _redirects to dist root for Netlify
  const netlifyRootPath = path.join(DIST_DIR, '_redirects');
  fs.writeFileSync(netlifyRootPath, netlifyContent, 'utf8');
  console.log('  ✓ Netlify: /dist/_redirects (root copy)');
  
  console.log(`\n✅ Redirect configurations generated!`);
  console.log(`   ${redirects.length} rules exported to 4 formats\n`);
}

// Run
main();
