/**
 * Validate redirects for duplicates, chains, and invalid targets
 * 
 * Checks:
 *   1. Duplicate sources (same from path multiple times)
 *   2. Redirect chains (A→B where B→C exists)
 *   3. Redirect loops (A→B→A)
 *   4. Invalid targets (destination not in sitemap)
 * 
 * Usage: node scripts/validate-redirects.js
 */

const fs = require('fs');
const path = require('path');

// Valid sitemap destinations
const validPaths = new Set([
  '/',
  '/about/',
  '/contact/',
  '/for-universities/',
  '/for-students/',
  '/k12/',
  '/impact-stories/'
]);

// Parse CSV
function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
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

// Build lookup maps
const fromMap = new Map(); // from -> to
const duplicates = [];
const chains = [];
const loops = [];
const invalidTargets = [];

// Check for duplicates and build map
redirects.forEach((r, index) => {
  if (fromMap.has(r.from)) {
    duplicates.push({
      path: r.from,
      first: fromMap.get(r.from),
      second: r.to,
      line: index + 2
    });
  } else {
    fromMap.set(r.from, r.to);
  }
});

// Check for chains and loops
redirects.forEach(r => {
  const to = r.to;
  
  // Skip external URLs
  if (to.startsWith('http')) return;
  
  // Check if destination is also a redirect source (chain)
  if (fromMap.has(to)) {
    const finalDest = fromMap.get(to);
    
    // Check for loop (A→B→A)
    if (finalDest === r.from) {
      loops.push({
        from: r.from,
        to: to,
        back: finalDest
      });
    } else {
      chains.push({
        from: r.from,
        via: to,
        final: finalDest,
        suggestion: `${r.from} → ${finalDest}`
      });
    }
  }
});

// Check for invalid targets
redirects.forEach(r => {
  const to = r.to;
  
  // Skip external URLs
  if (to.startsWith('http')) return;
  
  // Check if target is valid
  if (!validPaths.has(to)) {
    invalidTargets.push({
      from: r.from,
      to: to
    });
  }
});

// Output results
console.log('🔍 Redirect Validation Report');
console.log('='.repeat(50));
console.log(`   Total redirects: ${redirects.length}`);
console.log('');

// Duplicates
if (duplicates.length === 0) {
  console.log('✅ No duplicate sources found');
} else {
  console.log(`❌ ${duplicates.length} duplicate source(s) found:`);
  duplicates.forEach(d => {
    console.log(`   - ${d.path}`);
    console.log(`     First: → ${d.first}`);
    console.log(`     Second: → ${d.second} (line ${d.line})`);
  });
}

// Chains
console.log('');
if (chains.length === 0) {
  console.log('✅ No redirect chains detected');
} else {
  console.log(`⚠️  ${chains.length} redirect chain(s) detected:`);
  chains.forEach(c => {
    console.log(`   - ${c.from} → ${c.via} → ${c.final}`);
    console.log(`     Suggestion: ${c.suggestion}`);
  });
}

// Loops
console.log('');
if (loops.length === 0) {
  console.log('✅ No redirect loops detected');
} else {
  console.log(`❌ ${loops.length} redirect loop(s) detected:`);
  loops.forEach(l => {
    console.log(`   - ${l.from} → ${l.to} → ${l.back} (LOOP!)`);
  });
}

// Invalid targets
console.log('');
if (invalidTargets.length === 0) {
  console.log('✅ All targets are valid sitemap paths');
} else {
  console.log(`⚠️  ${invalidTargets.length} target(s) not in sitemap:`);
  invalidTargets.forEach(t => {
    console.log(`   - ${t.from} → ${t.to}`);
  });
  console.log('   Note: These may be valid (external URLs, anchors, etc.)');
}

// Summary
console.log('');
console.log('='.repeat(50));
const hasErrors = duplicates.length > 0 || loops.length > 0;
const hasWarnings = chains.length > 0 || invalidTargets.length > 0;

if (!hasErrors && !hasWarnings) {
  console.log('✅ All validations passed!');
} else if (hasErrors) {
  console.log('❌ Validation failed - fix errors before deployment');
} else {
  console.log('⚠️  Validation passed with warnings');
}

// Export results for report generation
module.exports = {
  total: redirects.length,
  duplicates,
  chains,
  loops,
  invalidTargets,
  hasErrors,
  hasWarnings
};
