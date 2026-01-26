/**
 * Merge redirect sources into final redirects CSV
 * 
 * Input:
 *   - /seo/legacy/coverage-report.csv
 *   - /seo/redirects.seed.csv
 * 
 * Output:
 *   - /seo/redirects.final.csv
 * 
 * Usage: node scripts/generate-redirects.js
 */

const fs = require('fs');
const path = require('path');

// Parse CSV (simple parser for our format)
function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((h, i) => obj[h.trim()] = (values[i] || '').trim());
    return obj;
  });
}

// Read input files
const coverageFile = path.join(__dirname, '..', 'seo', 'legacy', 'coverage-report.csv');
const seedFile = path.join(__dirname, '..', 'seo', 'redirects.seed.csv');

const coverageData = parseCSV(fs.readFileSync(coverageFile, 'utf8'));
const seedData = parseCSV(fs.readFileSync(seedFile, 'utf8'));

// Map to store final redirects (keyed by source path)
const redirects = new Map();

// Process seed file first (primary source - has updated paths)
seedData.forEach(row => {
  const from = row.from;
  const to = row.to;
  const note = row.note || '';
  
  redirects.set(from, { from, to, status_code: 301, note });
});

// Add any missing from coverage-report (only if not already in seed)
// Also convert old .html paths to new folder paths
const pathMappings = {
  '/contact-us.html': '/contact/',
  '/about-us.html': '/about/',
  '/higher-ed.html': '/for-universities/',
  '/students.html': '/for-students/',
  '/impact-stories.html': '/impact-stories/',
  '/k12.html': '/k12/',
  '/': '/'
};

coverageData.forEach(row => {
  const from = row.legacy_path;
  let to = row.proposed_new_path;
  const note = row.notes || '';
  
  // Skip if already in seed
  if (redirects.has(from)) return;
  
  // Skip if status is "covered" (means URL matches)
  if (row.status === 'covered') return;
  
  // Convert old .html paths to new folder paths
  to = pathMappings[to] || to;
  
  // Handle external URLs (keep as-is)
  if (to && to.startsWith('http')) {
    redirects.set(from, { from, to, status_code: 301, note });
    return;
  }
  
  // Ensure trailing slash for folder paths (except root)
  if (to && to !== '/' && !to.endsWith('/') && !to.includes('.')) {
    to = to + '/';
  }
  
  redirects.set(from, { from, to, status_code: 301, note });
});

// Convert to array and sort
const sortedRedirects = Array.from(redirects.values()).sort((a, b) => 
  a.from.localeCompare(b.from)
);

// Generate CSV output
const csvHeader = 'from,to,status_code,note';
const csvRows = sortedRedirects.map(r => 
  `${r.from},${r.to},${r.status_code},"${r.note.replace(/"/g, '""')}"`
);
const csvContent = [csvHeader, ...csvRows].join('\n');

// Write output
const outputFile = path.join(__dirname, '..', 'seo', 'redirects.final.csv');
fs.writeFileSync(outputFile, csvContent);

console.log('✅ redirects.final.csv generated');
console.log(`   - ${sortedRedirects.length} redirects merged`);
console.log(`   - Output: ${outputFile}`);
