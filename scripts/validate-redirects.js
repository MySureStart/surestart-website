#!/usr/bin/env node
/**
 * Redirect Validator
 * 
 * Validates the redirects.csv file for common issues:
 * - Duplicate "from" paths
 * - Redirect chains (A->B->C)
 * - Self redirects (A->A)
 * - Missing leading slashes
 * - Invalid status codes
 * 
 * Usage:
 *   node scripts/validate-redirects.js
 */

const fs = require('fs');
const path = require('path');

// Paths
const REDIRECTS_CSV = path.resolve(__dirname, '../seo/redirects.csv');

// Valid HTTP redirect status codes
const VALID_STATUS_CODES = ['301', '302', '303', '307', '308'];

/**
 * Parse CSV file into array of redirect objects
 */
function parseCSV(content) {
  const lines = content.split('\n');
  const redirects = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNumber = i + 1;
    
    // Skip empty lines and comments
    if (!line || line.startsWith('#')) {
      continue;
    }
    
    // Skip header row
    if (line.toLowerCase().startsWith('from,')) {
      continue;
    }
    
    // Parse CSV line (handle commas in note field)
    const parts = line.split(',');
    if (parts.length < 3) {
      redirects.push({
        lineNumber,
        raw: line,
        error: 'Invalid CSV format - requires at least from,to,status'
      });
      continue;
    }
    
    const from = parts[0].trim();
    const to = parts[1].trim();
    const status = parts[2].trim();
    const note = parts.slice(3).join(',').trim(); // Rest is the note
    
    redirects.push({
      lineNumber,
      from,
      to,
      status,
      note,
      raw: line
    });
  }
  
  return redirects;
}

/**
 * Normalize path to ensure leading slash
 */
function normalizePath(pathStr) {
  if (!pathStr) return pathStr;
  return pathStr.startsWith('/') ? pathStr : '/' + pathStr;
}

/**
 * Validate redirects and return errors/warnings
 */
function validateRedirects(redirects) {
  const errors = [];
  const warnings = [];
  
  // Build lookup maps
  const fromPaths = new Map(); // from -> [line numbers]
  const toByFrom = new Map();  // from -> to (for chain detection)
  
  // First pass: collect data and check basic issues
  redirects.forEach(redirect => {
    // Skip already errored entries
    if (redirect.error) {
      errors.push({
        line: redirect.lineNumber,
        type: 'PARSE_ERROR',
        message: redirect.error,
        raw: redirect.raw
      });
      return;
    }
    
    const { lineNumber, from, to, status } = redirect;
    
    // Check for empty from/to
    if (!from) {
      errors.push({
        line: lineNumber,
        type: 'EMPTY_FROM',
        message: 'Missing "from" path',
        raw: redirect.raw
      });
      return;
    }
    
    if (!to) {
      errors.push({
        line: lineNumber,
        type: 'EMPTY_TO',
        message: 'Missing "to" path',
        raw: redirect.raw
      });
      return;
    }
    
    // Check for missing leading slash
    if (!from.startsWith('/')) {
      warnings.push({
        line: lineNumber,
        type: 'MISSING_SLASH_FROM',
        message: `"from" path missing leading slash: "${from}" → should be "${normalizePath(from)}"`,
        autofix: true
      });
    }
    
    if (!to.startsWith('/') && !to.startsWith('http')) {
      warnings.push({
        line: lineNumber,
        type: 'MISSING_SLASH_TO',
        message: `"to" path missing leading slash: "${to}" → should be "${normalizePath(to)}"`,
        autofix: true
      });
    }
    
    // Check for valid status code
    if (!VALID_STATUS_CODES.includes(status)) {
      errors.push({
        line: lineNumber,
        type: 'INVALID_STATUS',
        message: `Invalid status code: "${status}" (valid: ${VALID_STATUS_CODES.join(', ')})`
      });
    }
    
    // Check for self redirect
    const normalizedFrom = normalizePath(from);
    const normalizedTo = to.startsWith('http') ? to : normalizePath(to);
    
    if (normalizedFrom === normalizedTo) {
      errors.push({
        line: lineNumber,
        type: 'SELF_REDIRECT',
        message: `Self redirect detected: "${from}" → "${to}" (infinite loop)`
      });
    }
    
    // Track for duplicate/chain detection
    if (!fromPaths.has(normalizedFrom)) {
      fromPaths.set(normalizedFrom, []);
    }
    fromPaths.get(normalizedFrom).push(lineNumber);
    toByFrom.set(normalizedFrom, normalizedTo);
  });
  
  // Second pass: check for duplicates
  fromPaths.forEach((lines, fromPath) => {
    if (lines.length > 1) {
      errors.push({
        line: lines.join(', '),
        type: 'DUPLICATE_FROM',
        message: `Duplicate "from" path: "${fromPath}" appears on lines ${lines.join(', ')}`
      });
    }
  });
  
  // Third pass: check for redirect chains
  toByFrom.forEach((to, from) => {
    // Check if the "to" is also a "from" somewhere else
    const normalizedTo = to.startsWith('http') ? null : to;
    if (normalizedTo && toByFrom.has(normalizedTo)) {
      const finalDest = toByFrom.get(normalizedTo);
      warnings.push({
        line: 'Multiple',
        type: 'REDIRECT_CHAIN',
        message: `Redirect chain detected: "${from}" → "${normalizedTo}" → "${finalDest}". Consider: "${from}" → "${finalDest}"`
      });
    }
  });
  
  return { errors, warnings };
}

/**
 * Main validation function
 */
function main() {
  console.log('🔍 Validating redirects.csv...\n');
  
  // Check if file exists
  if (!fs.existsSync(REDIRECTS_CSV)) {
    console.error('❌ Error: /seo/redirects.csv not found');
    process.exit(1);
  }
  
  // Read and parse CSV
  const content = fs.readFileSync(REDIRECTS_CSV, 'utf8');
  const redirects = parseCSV(content);
  
  // Filter out parse errors for count
  const validEntries = redirects.filter(r => !r.error);
  console.log(`Found ${validEntries.length} redirect rules\n`);
  
  // Validate
  const { errors, warnings } = validateRedirects(redirects);
  
  // Report warnings
  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    warnings.forEach(w => {
      console.log(`   Line ${w.line}: [${w.type}] ${w.message}`);
    });
    console.log('');
  }
  
  // Report errors
  if (errors.length > 0) {
    console.log('❌ Errors:');
    errors.forEach(e => {
      console.log(`   Line ${e.line}: [${e.type}] ${e.message}`);
    });
    console.log('');
    console.log(`❌ Validation failed with ${errors.length} error(s)`);
    process.exit(1);
  }
  
  // Success
  if (warnings.length > 0) {
    console.log(`✅ Validation passed with ${warnings.length} warning(s)`);
  } else {
    console.log('✅ Validation passed - no issues found');
  }
  
  console.log(`   ${validEntries.length} redirect rules validated\n`);
}

// Run
main();
