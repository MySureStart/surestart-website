#!/usr/bin/env node
/**
 * Migration Parity Audit Tool
 * 
 * Compares SEO elements between old Squarespace site (via Screaming Frog export)
 * and new static site to ensure parity during migration.
 * 
 * Usage:
 *   node scripts/parity-audit.js --screaming-frog <path-to-csv>
 * 
 * Inputs:
 *   - Screaming Frog CSV export (required columns: Address, Title 1, Meta Description 1, H1-1, Canonical Link Element 1)
 *   - URL mapping CSV (/seo/url-map.csv) with columns: old_url, new_path, priority
 * 
 * Output:
 *   - /dist/reports/parity-report.csv
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

// Paths
const DEFAULT_URL_MAP = path.resolve(__dirname, '../seo/url-map.csv');
const REPORTS_DIR = path.resolve(__dirname, '../dist/reports');
const OUTPUT_FILE = path.join(REPORTS_DIR, 'parity-report.csv');

// Screaming Frog column names (may vary slightly based on export settings)
const SF_COLUMNS = {
  address: ['Address', 'URL'],
  title: ['Title 1', 'Title'],
  description: ['Meta Description 1', 'Meta Description'],
  h1: ['H1-1', 'H1'],
  canonical: ['Canonical Link Element 1', 'Canonical']
};

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    screamingFrog: null,
    urlMap: DEFAULT_URL_MAP,
    baseUrl: 'http://localhost:8080',
    output: OUTPUT_FILE
  };
  
  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '--screaming-frog' || args[i] === '-sf') && args[i + 1]) {
      options.screamingFrog = args[i + 1];
      i++;
    } else if ((args[i] === '--url-map' || args[i] === '-m') && args[i + 1]) {
      options.urlMap = args[i + 1];
      i++;
    } else if ((args[i] === '--base-url' || args[i] === '-b') && args[i + 1]) {
      options.baseUrl = args[i + 1].replace(/\/$/, '');
      i++;
    } else if ((args[i] === '--output' || args[i] === '-o') && args[i + 1]) {
      options.output = args[i + 1];
      i++;
    } else if (args[i] === '--help' || args[i] === '-h') {
      printHelp();
      process.exit(0);
    }
  }
  
  return options;
}

/**
 * Print help message
 */
function printHelp() {
  console.log(`
Migration Parity Audit Tool

Usage:
  node scripts/parity-audit.js --screaming-frog <path-to-csv> [options]

Required:
  --screaming-frog, -sf <path>   Path to Screaming Frog CSV export

Options:
  --url-map, -m <path>           Path to URL mapping CSV (default: /seo/url-map.csv)
  --base-url, -b <url>           Local server base URL (default: http://localhost:8080)
  --output, -o <path>            Output CSV path (default: /dist/reports/parity-report.csv)
  --help, -h                     Show this help message

Screaming Frog CSV Required Columns:
  - Address (or URL)
  - Title 1 (or Title)
  - Meta Description 1 (or Meta Description)
  - H1-1 (or H1)
  - Canonical Link Element 1 (or Canonical)
`);
}

/**
 * Parse CSV content into array of objects
 */
function parseCSV(content, delimiter = ',') {
  const lines = content.split('\n');
  const results = [];
  
  if (lines.length === 0) return results;
  
  // Parse header
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine, delimiter);
  
  // Parse rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;
    
    const values = parseCSVLine(line, delimiter);
    const row = {};
    
    headers.forEach((header, idx) => {
      row[header.trim()] = values[idx] ? values[idx].trim() : '';
    });
    
    results.push(row);
  }
  
  return results;
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line, delimiter = ',') {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current);
  return values;
}

/**
 * Get column value with fallback names
 */
function getColumnValue(row, columnNames) {
  for (const name of columnNames) {
    if (row[name] !== undefined) {
      return row[name];
    }
  }
  return '';
}

/**
 * Fetch HTML from URL
 */
function fetchHtml(url) {
  return new Promise((resolve) => {
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
 * Extract SEO elements from HTML
 */
function extractSEO(html) {
  const result = {
    title: '',
    description: '',
    h1: '',
    canonical: ''
  };
  
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (titleMatch) result.title = titleMatch[1].trim();
  
  // Extract meta description
  const descMatch = html.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
                    html.match(/<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
  if (descMatch) result.description = descMatch[1].trim();
  
  // Extract H1
  const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
  if (h1Match) result.h1 = h1Match[1].trim();
  
  // Extract canonical
  const canonMatch = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i) ||
                     html.match(/<link\s+[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["'][^>]*>/i);
  if (canonMatch) result.canonical = canonMatch[1].trim();
  
  return result;
}

/**
 * Calculate similarity between two strings (0-100%)
 */
function calculateSimilarity(str1, str2) {
  if (!str1 && !str2) return 100;
  if (!str1 || !str2) return 0;
  
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 100;
  
  // Simple character-based similarity
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 100;
  
  let matches = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) matches++;
  }
  
  return Math.round((matches / longer.length) * 100);
}

/**
 * Determine severity based on comparison results
 */
function determineSeverity(comparison, priority) {
  const { newStatus, titleSimilarity, descSimilarity, h1Similarity, hasCanonical, hasTitle, hasH1 } = comparison;
  
  // HTTP errors are always HIGH
  if (newStatus !== 200) return 'HIGH';
  
  // Missing critical elements are HIGH
  if (!hasTitle) return 'HIGH';
  if (!hasCanonical) return 'HIGH';
  if (!hasH1 && priority === 'high') return 'HIGH';
  
  // Big changes in high priority pages
  if (priority === 'high') {
    if (titleSimilarity < 50) return 'HIGH';
    if (h1Similarity < 50) return 'MEDIUM';
  }
  
  // Medium changes
  if (titleSimilarity < 50 || descSimilarity < 30) return 'MEDIUM';
  if (h1Similarity < 50) return 'MEDIUM';
  
  // Minor changes
  if (titleSimilarity < 80 || descSimilarity < 60 || h1Similarity < 80) return 'LOW';
  
  return 'OK';
}

/**
 * Main audit function
 */
async function runParityAudit() {
  console.log('🔍 Migration Parity Audit\n');
  console.log('='.repeat(60) + '\n');
  
  const options = parseArgs();
  
  // Validate Screaming Frog file
  if (!options.screamingFrog) {
    console.error('❌ Error: --screaming-frog <path> is required');
    console.error('   Use --help for usage information\n');
    process.exit(1);
  }
  
  if (!fs.existsSync(options.screamingFrog)) {
    console.error(`❌ Error: Screaming Frog file not found: ${options.screamingFrog}\n`);
    process.exit(1);
  }
  
  // Validate URL map file
  if (!fs.existsSync(options.urlMap)) {
    console.error(`❌ Error: URL map file not found: ${options.urlMap}\n`);
    process.exit(1);
  }
  
  console.log(`Screaming Frog CSV: ${options.screamingFrog}`);
  console.log(`URL Map: ${options.urlMap}`);
  console.log(`Base URL: ${options.baseUrl}`);
  console.log(`Output: ${options.output}\n`);
  
  // Parse Screaming Frog CSV
  console.log('Loading Screaming Frog data...');
  const sfContent = fs.readFileSync(options.screamingFrog, 'utf8');
  const sfData = parseCSV(sfContent);
  console.log(`  Found ${sfData.length} pages in Screaming Frog export\n`);
  
  // Build lookup map from Screaming Frog data
  const sfLookup = new Map();
  sfData.forEach(row => {
    const address = getColumnValue(row, SF_COLUMNS.address);
    if (address) {
      sfLookup.set(address, {
        title: getColumnValue(row, SF_COLUMNS.title),
        description: getColumnValue(row, SF_COLUMNS.description),
        h1: getColumnValue(row, SF_COLUMNS.h1),
        canonical: getColumnValue(row, SF_COLUMNS.canonical)
      });
    }
  });
  
  // Parse URL map
  console.log('Loading URL map...');
  const urlMapContent = fs.readFileSync(options.urlMap, 'utf8');
  const urlMap = parseCSV(urlMapContent);
  console.log(`  Found ${urlMap.length} URL mappings\n`);
  
  // Process each mapped URL
  const results = [];
  
  for (const mapping of urlMap) {
    const oldUrl = mapping.old_url;
    const newPath = mapping.new_path;
    const priority = mapping.priority || 'medium';
    
    if (!oldUrl || !newPath) continue;
    
    process.stdout.write(`Auditing ${newPath}... `);
    
    // Get old SEO data
    const oldSeo = sfLookup.get(oldUrl) || {
      title: '',
      description: '',
      h1: '',
      canonical: ''
    };
    
    const hadOldData = sfLookup.has(oldUrl);
    
    // Fetch new page
    const newUrl = options.baseUrl + newPath;
    const { status, body } = await fetchHtml(newUrl);
    
    if (!body) {
      console.log(`❌ HTTP ${status}`);
      results.push({
        oldUrl,
        newPath,
        priority,
        newStatus: status,
        severity: 'HIGH',
        issues: [`New page returned HTTP ${status}`],
        oldTitle: oldSeo.title,
        newTitle: '',
        titleSimilarity: 0,
        oldDescription: oldSeo.description,
        newDescription: '',
        descSimilarity: 0,
        oldH1: oldSeo.h1,
        newH1: '',
        h1Similarity: 0,
        oldCanonical: oldSeo.canonical,
        newCanonical: ''
      });
      continue;
    }
    
    // Extract new SEO data
    const newSeo = extractSEO(body);
    
    // Compare
    const titleSimilarity = calculateSimilarity(oldSeo.title, newSeo.title);
    const descSimilarity = calculateSimilarity(oldSeo.description, newSeo.description);
    const h1Similarity = calculateSimilarity(oldSeo.h1, newSeo.h1);
    
    const comparison = {
      newStatus: status,
      titleSimilarity,
      descSimilarity,
      h1Similarity,
      hasTitle: !!newSeo.title,
      hasCanonical: !!newSeo.canonical,
      hasH1: !!newSeo.h1
    };
    
    const severity = determineSeverity(comparison, priority);
    
    // Collect issues
    const issues = [];
    if (!newSeo.title) issues.push('Missing title');
    if (!newSeo.canonical) issues.push('Missing canonical');
    if (!newSeo.h1) issues.push('Missing H1');
    if (titleSimilarity < 50 && oldSeo.title) issues.push(`Title changed significantly (${titleSimilarity}% similar)`);
    if (descSimilarity < 30 && oldSeo.description) issues.push(`Description changed significantly (${descSimilarity}% similar)`);
    if (h1Similarity < 50 && oldSeo.h1) issues.push(`H1 changed significantly (${h1Similarity}% similar)`);
    if (!hadOldData) issues.push('No matching old URL in Screaming Frog data');
    
    // Log result
    if (severity === 'HIGH') {
      console.log('❌ HIGH');
    } else if (severity === 'MEDIUM') {
      console.log('⚠️  MEDIUM');
    } else if (severity === 'LOW') {
      console.log('ℹ️  LOW');
    } else {
      console.log('✓ OK');
    }
    
    results.push({
      oldUrl,
      newPath,
      priority,
      newStatus: status,
      severity,
      issues: issues.join('; '),
      oldTitle: oldSeo.title,
      newTitle: newSeo.title,
      titleSimilarity,
      oldDescription: oldSeo.description,
      newDescription: newSeo.description,
      descSimilarity,
      oldH1: oldSeo.h1,
      newH1: newSeo.h1,
      h1Similarity,
      oldCanonical: oldSeo.canonical,
      newCanonical: newSeo.canonical
    });
  }
  
  // Generate CSV report
  console.log('\n' + '='.repeat(60));
  console.log('GENERATING REPORT');
  console.log('='.repeat(60) + '\n');
  
  // Ensure reports directory exists
  const reportsDir = path.dirname(options.output);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  // Build CSV
  const csvHeader = 'old_url,new_path,priority,new_status,severity,issues,old_title,new_title,title_similarity,old_description,new_description,desc_similarity,old_h1,new_h1,h1_similarity,old_canonical,new_canonical\n';
  const csvRows = results.map(r => {
    const escape = (s) => `"${(s || '').replace(/"/g, '""')}"`;
    return [
      escape(r.oldUrl),
      escape(r.newPath),
      r.priority,
      r.newStatus,
      r.severity,
      escape(r.issues),
      escape(r.oldTitle),
      escape(r.newTitle),
      r.titleSimilarity,
      escape(r.oldDescription),
      escape(r.newDescription),
      r.descSimilarity,
      escape(r.oldH1),
      escape(r.newH1),
      r.h1Similarity,
      escape(r.oldCanonical),
      escape(r.newCanonical)
    ].join(',');
  }).join('\n');
  
  fs.writeFileSync(options.output, csvHeader + csvRows + '\n', 'utf8');
  console.log(`✓ Report saved: ${options.output}\n`);
  
  // Print summary
  console.log('='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60) + '\n');
  
  const high = results.filter(r => r.severity === 'HIGH').length;
  const medium = results.filter(r => r.severity === 'MEDIUM').length;
  const low = results.filter(r => r.severity === 'LOW').length;
  const ok = results.filter(r => r.severity === 'OK').length;
  
  console.log(`Total pages audited: ${results.length}`);
  console.log(`  ❌ HIGH:   ${high}`);
  console.log(`  ⚠️  MEDIUM: ${medium}`);
  console.log(`  ℹ️  LOW:    ${low}`);
  console.log(`  ✓ OK:     ${ok}`);
  console.log('');
  
  // Print high severity issues
  if (high > 0) {
    console.log('❌ HIGH SEVERITY ISSUES:');
    results.filter(r => r.severity === 'HIGH').forEach(r => {
      console.log(`   ${r.newPath}: ${r.issues}`);
    });
    console.log('');
  }
  
  // Exit code
  if (high > 0) {
    console.log('❌ Parity audit FAILED - fix HIGH severity issues before launch\n');
    process.exit(1);
  } else if (medium > 0) {
    console.log('⚠️  Parity audit PASSED with warnings - review MEDIUM severity issues\n');
    process.exit(0);
  } else {
    console.log('✅ Parity audit PASSED\n');
    process.exit(0);
  }
}

// Run
runParityAudit().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
