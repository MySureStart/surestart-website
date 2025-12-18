# SEO Testing Guide

This document explains how to run SEO smoke tests to validate the built static site before deployment.

## Overview

The SEO smoke test (`/scripts/seo-smoke-test.js`) validates critical SEO elements across all pages in the sitemap. It's designed to catch common SEO issues before they reach production.

## Quick Start

```bash
# 1. Build the site
npm run build

# 2. Start a local server (in a separate terminal)
npx serve dist -l 8080

# 3. Run the smoke test
npm run seo:smoke
```

## What Gets Tested

| Check | Type | Description |
|-------|------|-------------|
| HTTP 200 | Error | Page must return HTTP 200 status |
| Single `<title>` | Error | Exactly one `<title>` tag required |
| Meta description | Warning | Should have a meta description (50-160 chars) |
| Single canonical | Error | Exactly one `<link rel="canonical">` required |
| Absolute canonical | Error | Canonical URL must start with `http://` or `https://` |
| Canonical host match | Error (prod) | In production, canonical host must match baseUrl |
| No noindex in prod | Error (prod) | Pages must not have `noindex` when `SITE_ENV=production` |

## Running the Test

### Basic Usage

```bash
# Uses sitemap.xml and defaults to http://localhost:8080
npm run seo:smoke
```

### Custom Base URL

```bash
# Test against a different port
npm run seo:smoke -- --base-url http://localhost:3000

# Test against a staging server
npm run seo:smoke -- --base-url https://staging.mysurestart.com
```

### Test Specific URLs

```bash
# Test only specific pages (skip sitemap)
npm run seo:smoke -- --urls /,/about-us,/contact-us
```

### Production Mode

```bash
# Run in production mode (stricter checks)
$env:SITE_ENV="production"; npm run seo:smoke
```

## Example Output

### Successful Test

```
🔬 SEO Smoke Test

============================================================

Environment: development
Is Production: false
Configured baseUrl: https://example.com
Test base URL: http://localhost:8080

Testing 9 URLs from sitemap.xml

Testing /... ✓ PASS
Testing /about-us.html... ✓ PASS
Testing /contact-us.html... ✓ PASS
Testing /higher-ed.html... ✓ PASS
Testing /impact-stories.html... ✓ PASS
Testing /k12.html... ✓ PASS
Testing /students.html... ✓ PASS
Testing /vibe-coding.html... ✓ PASS
Testing /vibe-lab.html... ✓ PASS

============================================================
SUMMARY
============================================================

Total pages tested: 9
  ✓ Passed:  9
  ⚠️  Warned:  0
  ❌ Failed:  0

Total errors: 0
Total warnings: 0

✅ SEO smoke test PASSED
```

### Test with Issues

```
🔬 SEO Smoke Test

============================================================

Testing /... ⚠️  WARN
Testing /about-us.html... ❌ FAIL

============================================================
DETAILED RESULTS
============================================================

📄 /
   ⚠️  Meta description too short (45 chars, recommend 50-160)

📄 /about-us.html
   ❌ Multiple <title> tags found (2)
   ❌ Missing canonical link

============================================================
SUMMARY
============================================================

Total pages tested: 9
  ✓ Passed:  7
  ⚠️  Warned:  1
  ❌ Failed:  1

Total errors: 2
Total warnings: 1

❌ SEO smoke test FAILED
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All tests passed (with or without warnings) |
| 1 | One or more tests failed |

## CI/CD Integration

### GitHub Actions

```yaml
name: SEO Tests

on: [push, pull_request]

jobs:
  seo-smoke-test:
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
        env:
          SITE_ENV: production
      
      - name: Start server
        run: npx serve dist -l 8080 &
        
      - name: Wait for server
        run: sleep 3
      
      - name: Run SEO smoke test
        run: npm run seo:smoke
        env:
          SITE_ENV: production
```

### GitLab CI

```yaml
seo-test:
  stage: test
  script:
    - npm ci
    - npm run build
    - npx serve dist -l 8080 &
    - sleep 3
    - npm run seo:smoke
  variables:
    SITE_ENV: production
```

### Netlify Build Plugin

Add to `netlify.toml`:

```toml
[[plugins]]
  package = "netlify-plugin-local-test"
  
  [plugins.inputs]
    testCommand = "npm run seo:smoke -- --base-url http://localhost:8888"
```

## Production vs Development Mode

### Development Mode (default)

- Warnings for missing meta descriptions
- Canonical URL just needs to be absolute
- `noindex` robots directive is allowed

### Production Mode (`SITE_ENV=production`)

Additional strict checks:
- Canonical host must match configured `baseUrl` host
- `noindex` robots directive is NOT allowed (error)

## Common Issues and Fixes

### Missing `<title>` tag

**Cause:** The page doesn't have a `<title>` tag or it wasn't processed.

**Fix:** Ensure the page includes the head partial:
```html
<head>
<!-- INCLUDE:partials/head.html -->
</head>
```

### Multiple `<title>` tags

**Cause:** Title is defined both in the partial and manually in the page.

**Fix:** Remove the manual `<title>` tag and use the `.seo.json` file:
```json
{
  "title": "Page Title — MySureStart"
}
```

### Missing canonical link

**Cause:** The canonical link wasn't generated during build.

**Fix:** Ensure the head partial includes the canonical token and rebuild.

### Canonical not absolute

**Cause:** The canonical URL is relative (e.g., `/about-us`).

**Fix:** Check that `baseUrl` is set correctly in `/seo/site.config.json`.

### Canonical host mismatch (production)

**Cause:** The canonical URL's host doesn't match the configured `baseUrl`.

**Fix:** Update `/seo/site.config.json` with the correct production URL:
```json
{
  "baseUrl": "https://mysurestart.com"
}
```

### noindex in production

**Cause:** A page has `<meta name="robots" content="noindex,nofollow">` in production.

**Fix:** Either:
1. Remove the `noindex: true` from the page's `.seo.json`
2. Or ensure `SITE_ENV=production` is set during build

### Connection refused

**Cause:** The local server isn't running.

**Fix:** Start the server before running the test:
```bash
npx serve dist -l 8080 &
sleep 2
npm run seo:smoke
```

## Best Practices

### 1. Run Before Every Deployment

Add smoke tests to your CI/CD pipeline to catch issues early.

### 2. Test in Production Mode

Always test with `SITE_ENV=production` before deploying to production:
```bash
$env:SITE_ENV="production"; npm run seo:smoke
```

### 3. Fix Errors, Not Just Warnings

While warnings don't fail the test, they indicate potential SEO improvements.

### 4. Monitor Results Over Time

Track test results to ensure SEO quality doesn't degrade.

### 5. Test After Major Changes

Always run smoke tests after:
- Updating the head partial
- Adding new pages
- Changing the build system
- Modifying SEO configuration

## npm Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run seo:smoke` | Run SEO smoke test against local server |
| `npm run seo:smoke -- --base-url URL` | Test against custom base URL |
| `npm run seo:smoke -- --urls /,/about-us` | Test specific paths only |

## File Structure

```
/surestart-website/
├── /scripts/
│   ├── seo-smoke-test.js    # SEO smoke test script
│   └── link-check.js        # Internal link & asset checker
├── /dist/
│   ├── sitemap.xml          # Source of URLs to test
│   └── /reports/
│       └── link-check.csv   # Link check report
├── /seo/
│   └── site.config.json     # baseUrl and other config
└── /docs/
    └── seo-testing.md       # This documentation
```

---

# Internal Link & Asset Checker

The link checker (`/scripts/link-check.js`) crawls all pages in your sitemap and validates that internal links and assets are not broken.

## Quick Start

```bash
# 1. Build the site
npm run build

# 2. Start a local server (in a separate terminal)
npx serve dist -l 8080

# 3. Run the link checker
npm run seo:links
```

## What Gets Checked

| Type | Validation | Success |
|------|------------|---------|
| Internal links (`<a href>`) | HTTP status code | 200-399 |
| Internal assets (`<img src>`) | HTTP status code | 200 only |
| srcset images | HTTP status code | 200 only |

## Running the Link Checker

### Basic Usage

```bash
# Uses sitemap.xml and defaults to http://localhost:8080
npm run seo:links
```

### Custom Base URL

```bash
# Test against a different port
npm run seo:links -- --base-url http://localhost:3000
```

### Include External Links

```bash
# Also check external links (slower)
npm run seo:links -- --external
```

### Custom Output Path

```bash
npm run seo:links -- --output ./my-report.csv
```

## CSV Report Output

The link checker exports a CSV report to `/dist/reports/link-check.csv`:

```csv
source_page,type,url,status,result,timestamp
/index.html,link,/about-us.html,200,OK,2025-01-15T10:00:00Z
/index.html,asset,/static/images/logo.png,200,OK,2025-01-15T10:00:00Z
/about-us.html,link,/missing-page.html,404,FAIL,2025-01-15T10:00:01Z
```

### CSV Columns

| Column | Description |
|--------|-------------|
| `source_page` | The page containing the link/asset |
| `type` | `link`, `asset`, `external-link`, or `external-asset` |
| `url` | The URL being checked |
| `status` | HTTP status code (0 for connection errors) |
| `result` | `OK` or `FAIL` |
| `timestamp` | When the check was performed |

## Example Output

```
🔗 Internal Link & Asset Checker


Base URL: http://localhost:8080
Output: d:\surestart-website\dist\reports\link-check.csv
Check external: false

Found 9 pages in sitemap

Crawling /... 15 links, 23 assets
Crawling /about-us.html... 8 links, 12 assets
Crawling /contact-us.html... 5 links, 3 assets
...

GENERATING REPORT

✓ CSV report: d:\surestart-website\dist\reports\link-check.csv

SUMMARY

Total checks: 156
  ✓ Passed: 154
  ❌ Failed: 2

❌ Broken internal links:
   /about-us.html → /old-page.html (HTTP 404)

❌ Missing assets:
   /index.html → /static/images/missing.png (HTTP 404)

❌ Link check FAILED
```

## CI/CD Integration

### GitHub Actions

```yaml
- name: Run link checker
  run: |
    npx serve dist -l 8080 &
    sleep 3
    npm run seo:links

- name: Upload link check report
  uses: actions/upload-artifact@v4
  if: always()
  with:
    name: link-check-report
    path: dist/reports/link-check.csv
```

## Common Issues

### Broken Internal Link

**Cause:** A page links to another page that doesn't exist.

**Fix:** Either:
1. Create the missing page
2. Update the link to point to an existing page
3. Add a redirect in `/seo/redirects.csv`

### Missing Asset (404)

**Cause:** An `<img>` or other asset references a file that doesn't exist.

**Fix:**
1. Add the missing image to `/src/static/images/`
2. Or update the `src` attribute to point to an existing file

### Connection Refused

**Cause:** The local server isn't running.

**Fix:** Start the server before running the check:
```bash
npx serve dist -l 8080 &
sleep 2
npm run seo:links
```

## Link Checker npm Scripts

| Script | Description |
|--------|-------------|
| `npm run seo:links` | Run link checker against local server |
| `npm run seo:links -- --base-url URL` | Check against custom URL |
| `npm run seo:links -- --external` | Also check external links |
| `npm run seo:links -- --output FILE` | Custom CSV output path |
