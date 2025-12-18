# Migration Parity Audit Guide

This document explains how to use the parity audit tool to compare SEO elements between the old Squarespace site and the new static site during migration.

## Overview

The parity audit tool (`/scripts/parity-audit.js`) ensures that critical SEO elements are preserved during the Squarespace to static site migration. It compares:

- Page titles
- Meta descriptions
- H1 headings
- Canonical URLs

## Prerequisites

### 1. Screaming Frog Export

Export your old Squarespace site using [Screaming Frog SEO Spider](https://www.screamingfrog.co.uk/seo-spider/).

**Required columns in export:**

| Column Name | Alternative | Description |
|-------------|-------------|-------------|
| `Address` | `URL` | Full URL of the page |
| `Title 1` | `Title` | Page title |
| `Meta Description 1` | `Meta Description` | Meta description |
| `H1-1` | `H1` | First H1 heading |
| `Canonical Link Element 1` | `Canonical` | Canonical URL |

**How to export from Screaming Frog:**

1. Open Screaming Frog SEO Spider
2. Enter your old site URL (e.g., `https://www.mysurestart.com`)
3. Click "Start" to crawl
4. Wait for crawl to complete
5. Go to **File → Export → All** or select specific tabs
6. Save as CSV

### 2. URL Mapping File

Create `/seo/url-map.csv` to map old URLs to new paths:

```csv
old_url,new_path,priority
https://www.mysurestart.com/,/,high
https://www.mysurestart.com/about,/about-us.html,high
https://www.mysurestart.com/contact,/contact-us.html,medium
https://www.mysurestart.com/k-12,/k12.html,high
```

**Columns:**

| Column | Required | Description |
|--------|----------|-------------|
| `old_url` | Yes | Full URL from old Squarespace site |
| `new_path` | Yes | Path on new site (relative to domain root) |
| `priority` | No | `high`, `medium`, or `low` (affects severity) |

## Quick Start

```bash
# 1. Build the new site
npm run build

# 2. Start a local server
npx serve dist -l 8080 &

# 3. Run the parity audit
npm run seo:parity -- --screaming-frog ./screaming-frog-export.csv
```

## Running the Audit

### Basic Usage

```bash
npm run seo:parity -- --screaming-frog <path-to-csv>
```

### CLI Options

| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| `--screaming-frog` | `-sf` | (required) | Path to Screaming Frog CSV export |
| `--url-map` | `-m` | `/seo/url-map.csv` | Path to URL mapping file |
| `--base-url` | `-b` | `http://localhost:8080` | Local server base URL |
| `--output` | `-o` | `/dist/reports/parity-report.csv` | Output report path |
| `--help` | `-h` | - | Show help message |

### Examples

```bash
# Basic usage
npm run seo:parity -- --screaming-frog ./old-site-crawl.csv

# Custom URL mapping
npm run seo:parity -- -sf ./crawl.csv --url-map ./custom-mapping.csv

# Different server port
npm run seo:parity -- -sf ./crawl.csv --base-url http://localhost:3000

# Custom output location
npm run seo:parity -- -sf ./crawl.csv --output ./my-report.csv
```

## Severity Levels

The audit assigns severity levels based on the comparison results:

| Severity | Condition |
|----------|-----------|
| **HIGH** | New page returns 404 or error |
| **HIGH** | Missing title on new page |
| **HIGH** | Missing canonical on new page |
| **HIGH** | Missing H1 on high-priority page |
| **HIGH** | Title changed >50% on high-priority page |
| **MEDIUM** | Title changed >50% (other pages) |
| **MEDIUM** | Description changed >70% |
| **MEDIUM** | H1 changed >50% |
| **LOW** | Minor text changes (<50% difference) |
| **OK** | Values match or acceptable variation |

## Output Report

The audit generates a CSV report at `/dist/reports/parity-report.csv`:

```csv
old_url,new_path,priority,new_status,severity,issues,old_title,new_title,title_similarity,...
```

### Report Columns

| Column | Description |
|--------|-------------|
| `old_url` | Original Squarespace URL |
| `new_path` | New site path |
| `priority` | Page priority (high/medium/low) |
| `new_status` | HTTP status of new page |
| `severity` | HIGH, MEDIUM, LOW, or OK |
| `issues` | Semicolon-separated list of issues |
| `old_title` | Title from old site |
| `new_title` | Title on new site |
| `title_similarity` | 0-100% similarity score |
| `old_description` | Description from old site |
| `new_description` | Description on new site |
| `desc_similarity` | 0-100% similarity score |
| `old_h1` | H1 from old site |
| `new_h1` | H1 on new site |
| `h1_similarity` | 0-100% similarity score |
| `old_canonical` | Canonical from old site |
| `new_canonical` | Canonical on new site |

## Example Output

```
🔍 Migration Parity Audit

============================================================

Screaming Frog CSV: ./screaming-frog-export.csv
URL Map: d:\surestart-website\seo\url-map.csv
Base URL: http://localhost:8080
Output: d:\surestart-website\dist\reports\parity-report.csv

Loading Screaming Frog data...
  Found 45 pages in Screaming Frog export

Loading URL map...
  Found 9 URL mappings

Auditing /... ✓ OK
Auditing /about-us.html... ✓ OK
Auditing /contact-us.html... ⚠️  MEDIUM
Auditing /k12.html... ✓ OK
Auditing /higher-ed.html... ❌ HIGH
...

============================================================
SUMMARY
============================================================

Total pages audited: 9
  ❌ HIGH:   1
  ⚠️  MEDIUM: 1
  ℹ️  LOW:    0
  ✓ OK:     7

❌ HIGH SEVERITY ISSUES:
   /higher-ed.html: Missing canonical

❌ Parity audit FAILED - fix HIGH severity issues before launch
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Migration Parity Check

on: [push]

jobs:
  parity-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build site
        run: npm run build
      
      - name: Start server
        run: npx serve dist -l 8080 &
      
      - name: Wait for server
        run: sleep 3
      
      - name: Run parity audit
        run: npm run seo:parity -- --screaming-frog ./seo/screaming-frog-baseline.csv
      
      - name: Upload parity report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: parity-report
          path: dist/reports/parity-report.csv
```

## Common Issues and Fixes

### Missing Title

**Issue:** New page doesn't have a `<title>` tag.

**Fix:** Ensure the page has an `.seo.json` file with a `title` field:
```json
{
  "title": "Page Title — MySureStart"
}
```

### Missing Canonical

**Issue:** New page doesn't have a canonical link.

**Fix:** The build system should inject canonicals automatically. Check that:
1. The head partial includes the canonical token
2. `baseUrl` is set in `/seo/site.config.json`

### Title Changed Significantly

**Issue:** New title is very different from old title.

**Fix:** This may be intentional (rebranding). If not:
1. Update the page's `.seo.json` to match the old title
2. Or accept the change if it's an improvement

### No Matching Old URL

**Issue:** The old URL in `url-map.csv` wasn't found in the Screaming Frog export.

**Fix:** 
1. Check for typos in the URL
2. Ensure the Screaming Frog crawl included that page
3. The URL may have been removed from the old site

### HTTP 404 on New Page

**Issue:** The new page doesn't exist.

**Fix:**
1. Create the missing page
2. Or update the `new_path` in `url-map.csv`
3. Or add a redirect in `/seo/redirects.csv`

## Best Practices

### 1. Create Baseline Before Migration

Before starting the migration:
1. Crawl the old site with Screaming Frog
2. Save the export as a baseline
3. Commit it to the repository (e.g., `/seo/screaming-frog-baseline.csv`)

### 2. Prioritize High-Traffic Pages

Mark your most important pages as `high` priority in `url-map.csv`:
```csv
https://www.mysurestart.com/,/,high
https://www.mysurestart.com/about,/about-us.html,high
```

### 3. Run Audit Regularly

Run the parity audit:
- After major page changes
- Before each deployment
- As part of CI/CD pipeline

### 4. Fix HIGH Issues Before Launch

Never launch with HIGH severity issues. These indicate:
- Missing pages (404)
- Missing critical SEO elements
- Significant content changes on important pages

### 5. Review MEDIUM Issues

MEDIUM severity changes may be intentional. Review them to confirm:
- Intentional title/description improvements
- Acceptable H1 changes
- Planned content updates

## npm Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run seo:parity -- --screaming-frog <csv>` | Run parity audit |
| `npm run seo:parity -- --help` | Show help message |

## File Structure

```
/surestart-website/
├── /seo/
│   ├── url-map.csv              # URL mapping (old → new)
│   └── screaming-frog-baseline.csv  # Old site crawl (optional)
├── /scripts/
│   └── parity-audit.js          # Audit script
├── /dist/
│   └── /reports/
│       └── parity-report.csv    # Audit output
└── /docs/
    └── migration-parity.md      # This documentation
```
