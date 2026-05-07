#!/usr/bin/env node
/**
 * Remove the dead "Terms of Service" link (and its preceding separator)
 * from the footer of every source HTML file. The link points to "#" and
 * has no destination page, so we drop it cleanly.
 *
 * Skips the build output directory (dist/).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'tests']);

/** Recursively collect *.html files under `dir`, skipping SKIP_DIRS. */
function collectHtml(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectHtml(full, out);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

// Matches the separator + the dead Terms of Service link, with any
// surrounding whitespace/newlines, so the remaining footer ends cleanly
// after Cookie Policy. Supports both "•" and "&middot;" separators.
const TOS_PATTERN =
  /\s*<span>(?:•|&middot;)<\/span>\s*<a href="#">Terms of Service<\/a>/g;

// Stale TODO comment in cookies/index.html that references Terms of Service.
const TODO_COMMENT_PATTERN =
  /\s*<!--\s*TODO:\s*Add link to Terms of Service once the page exists\s*-->/g;

const files = collectHtml(ROOT);
let changed = 0;
const touched = [];

for (const file of files) {
  const before = fs.readFileSync(file, 'utf8');
  let after = before.replace(TOS_PATTERN, '');
  after = after.replace(TODO_COMMENT_PATTERN, '');
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed++;
    touched.push(path.relative(ROOT, file));
  }
}

console.log(`Updated ${changed} file(s):`);
for (const f of touched) console.log(`  - ${f}`);
