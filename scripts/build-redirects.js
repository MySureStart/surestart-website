/**
 * Build platform-specific redirect files from redirects.final.csv
 * 
 * Output:
 *   - /dist/redirects/_redirects (Netlify)
 *   - /dist/redirects/vercel.json (Vercel)
 *   - /dist/redirects/nginx.conf (nginx)
 * 
 * Usage: node scripts/build-redirects.js
 */

const fs = require('fs');
const path = require('path');

// Parse CSV
function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    // Handle quoted values
    const values = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);
    
    const obj = {};
    headers.forEach((h, i) => obj[h.trim()] = (values[i] || '').trim());
    return obj;
  });
}

// Read input
const inputFile = path.join(__dirname, '..', 'seo', 'redirects.final.csv');
if (!fs.existsSync(inputFile)) {
  console.error('❌ redirects.final.csv not found. Run generate-redirects.js first.');
  process.exit(1);
}

const redirects = parseCSV(fs.readFileSync(inputFile, 'utf8'));

// Create output directory
const outputDir = path.join(__dirname, '..', 'dist', 'redirects');
fs.mkdirSync(outputDir, { recursive: true });

// 1. Netlify _redirects
const netlifyContent = `# Netlify redirects
# Generated: ${new Date().toISOString().split('T')[0]}
# Total: ${redirects.length} redirects

${redirects.map(r => `${r.from}  ${r.to}  ${r.status_code}`).join('\n')}
`;

fs.writeFileSync(path.join(outputDir, '_redirects'), netlifyContent);
console.log('✅ _redirects (Netlify) generated');

// 2. Vercel vercel.json
const vercelConfig = {
  redirects: redirects.map(r => ({
    source: r.from,
    destination: r.to,
    permanent: r.status_code === '301' || r.status_code === 301
  }))
};

fs.writeFileSync(
  path.join(outputDir, 'vercel.json'), 
  JSON.stringify(vercelConfig, null, 2)
);
console.log('✅ vercel.json (Vercel) generated');

// 3. nginx conf
const nginxContent = `# nginx redirect rules
# Generated: ${new Date().toISOString().split('T')[0]}
# Total: ${redirects.length} redirects
#
# Include in your nginx server block:
# include /path/to/nginx.conf;

${redirects.map(r => {
  const statusCode = r.status_code === '301' || r.status_code === 301 ? 301 : 302;
  return `location = ${r.from} { return ${statusCode} ${r.to}; }`;
}).join('\n')}
`;

fs.writeFileSync(path.join(outputDir, 'nginx.conf'), nginxContent);
console.log('✅ nginx.conf (nginx) generated');

console.log('');
console.log(`📁 Output directory: ${outputDir}`);
console.log(`   - _redirects`);
console.log(`   - vercel.json`);
console.log(`   - nginx.conf`);
