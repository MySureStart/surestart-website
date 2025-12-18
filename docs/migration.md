# Migration & Redirect Management Guide

This document explains how to manage URL redirects during site migrations and URL structure changes.

## Overview

The redirect management system consists of:

1. **`/seo/redirects.csv`** - Source of truth for all redirect rules
2. **`/scripts/validate-redirects.js`** - Validation script to catch common issues
3. **`/scripts/build-redirects.js`** - Exports redirects to multiple platform formats

## Redirects CSV Format

### Location

`/seo/redirects.csv`

### Columns

| Column | Required | Description |
|--------|----------|-------------|
| `from` | Yes | The old URL path to redirect from |
| `to` | Yes | The new URL path to redirect to |
| `status` | Yes | HTTP status code (301, 302, 307, 308) |
| `note` | No | Optional description/reason for the redirect |

### Example CSV

```csv
from,to,status,note
# Old site structure redirects
/home,/,301,Homepage redirect
/about,/about-us,301,URL structure change
/contact,/contact-us,301,URL structure change
/k-12,/k12,301,URL simplification
/higher-education,/higher-ed,301,URL simplification
/programs/students,/students,301,Flattened URL structure
# Legacy promotional URLs
/summer-program,/students,302,Temporary redirect to students page
```

### Status Codes

| Code | Type | Use Case |
|------|------|----------|
| `301` | Permanent | Use for permanent URL changes. Search engines will update their index. |
| `302` | Temporary | Use for temporary redirects (promotions, A/B tests). Original URL keeps SEO value. |
| `307` | Temporary | Same as 302 but preserves HTTP method. |
| `308` | Permanent | Same as 301 but preserves HTTP method. |

**Best Practice:** Use `301` for permanent URL changes during migrations. Use `302` for temporary campaigns or features.

### Comments

Lines starting with `#` are treated as comments and ignored:

```csv
from,to,status,note
# Migration Phase 1: Core pages
/old-page,/new-page,301,Phase 1 migration
```

## Validation

### Running Validation

```bash
npm run seo:redirects:validate
```

### Validation Checks

The validator checks for:

| Issue | Type | Description |
|-------|------|-------------|
| **Duplicate "from"** | Error | Same source path appears multiple times |
| **Self redirect** | Error | Path redirects to itself (infinite loop) |
| **Invalid status** | Error | Status code not in [301, 302, 303, 307, 308] |
| **Redirect chain** | Warning | A→B→C should be A→C for efficiency |
| **Missing leading slash** | Warning | Paths should start with `/` |
| **Empty from/to** | Error | Required fields are missing |

### Example Output

```
🔍 Validating redirects.csv...

Found 10 redirect rules

⚠️  Warnings:
   Line Multiple: [REDIRECT_CHAIN] Redirect chain detected: "/old" → "/temp" → "/new". Consider: "/old" → "/new"

✅ Validation passed with 1 warning(s)
   10 redirect rules validated
```

### Fixing Common Issues

**Duplicate "from" paths:**
```csv
# BAD - duplicate
/old-page,/new-page-1,301,First rule
/old-page,/new-page-2,301,Second rule

# GOOD - single rule
/old-page,/new-page-final,301,Consolidated rule
```

**Redirect chains:**
```csv
# BAD - chain: A→B→C
/page-v1,/page-v2,301,
/page-v2,/page-v3,301,

# GOOD - direct: A→C
/page-v1,/page-v3,301,Skip intermediate
/page-v2,/page-v3,301,
```

**Self redirects:**
```csv
# BAD - infinite loop
/about,/about,301,

# GOOD - actual redirect
/about,/about-us,301,
```

## Building Redirect Files

### Running the Build

```bash
# Build all redirect formats
npm run seo:redirects:build

# Or run as part of full build
npm run build
```

### Output Files

The build generates redirect configurations for multiple platforms:

| File | Platform | Location |
|------|----------|----------|
| `_redirects` | Netlify | `/dist/_redirects` and `/dist/redirects/_redirects` |
| `vercel.json` | Vercel | `/dist/redirects/vercel.json` |
| `nginx.conf` | nginx | `/dist/redirects/nginx.conf` |
| `.htaccess` | Apache | `/dist/redirects/.htaccess` |

## Platform-Specific Deployment

### Netlify

The `_redirects` file is automatically copied to `/dist/_redirects` (root). No additional configuration needed.

**Format:**
```
/old-page  /new-page  301  # Comment
```

**Deployment:**
1. Run `npm run build`
2. Deploy `/dist` to Netlify
3. Redirects are automatically applied

### Vercel

Copy the contents of `/dist/redirects/vercel.json` to your project's `vercel.json`:

**Format:**
```json
{
  "redirects": [
    {
      "source": "/old-page",
      "destination": "/new-page",
      "permanent": true
    }
  ]
}
```

**Deployment:**
1. Run `npm run seo:redirects:build`
2. Copy `redirects` array to your `vercel.json`
3. Deploy to Vercel

### nginx

Include the generated configuration in your nginx server block:

**Format:**
```nginx
location = /old-page {
    return 301 /new-page;
}
```

**Deployment:**
1. Run `npm run seo:redirects:build`
2. Copy `/dist/redirects/nginx.conf` to your server
3. Include in nginx config: `include /path/to/redirects.conf;`
4. Reload nginx: `nginx -s reload`

### Apache

Add the rules from `/dist/redirects/.htaccess` to your server's `.htaccess`:

**Format:**
```apache
RewriteEngine On
RewriteRule ^old-page$ /new-page [R=301,L]
```

**Deployment:**
1. Run `npm run seo:redirects:build`
2. Copy rules to your `.htaccess` file
3. Upload to server

## Migration Workflow

### Step 1: Plan Your Redirects

Before migrating, document all URL changes:

1. Export list of all current URLs
2. Map each to its new destination
3. Identify pages to be removed (redirect to relevant alternatives)

### Step 2: Add Redirects to CSV

```csv
from,to,status,note
# Phase 1: Core pages
/old-homepage,/,301,Homepage consolidation
/about-company,/about-us,301,URL simplification
# Phase 2: Product pages
/products/item-1,/shop/item-1,301,New shop structure
```

### Step 3: Validate

```bash
npm run seo:redirects:validate
```

Fix any errors before proceeding.

### Step 4: Build and Test

```bash
npm run build
```

Test redirects locally or in staging before production.

### Step 5: Deploy

Deploy the new site with redirects to your platform.

### Step 6: Monitor

After launch:
- Check Google Search Console for crawl errors
- Monitor 404 logs for missed redirects
- Add any missing redirects to the CSV

## Best Practices

### 1. Use Permanent Redirects for Migrations

```csv
# GOOD: 301 for permanent changes
/old-url,/new-url,301,Site migration
```

### 2. Keep Redirects as Long as Needed

Redirects should stay active for:
- At least 1 year for SEO value transfer
- As long as backlinks point to old URLs
- Indefinitely for high-traffic legacy URLs

### 3. Avoid Redirect Chains

```csv
# BAD
/a,/b,301,
/b,/c,301,

# GOOD
/a,/c,301,
/b,/c,301,
```

### 4. Document Everything

Use the `note` column:

```csv
/old-page,/new-page,301,Migrated per JIRA-123 (Jan 2025)
```

### 5. Validate Before Every Deploy

Add validation to your CI/CD pipeline:

```yaml
- name: Validate Redirects
  run: npm run seo:redirects:validate
```

### 6. Test Redirects in Staging

Always test redirects before production deployment.

## Troubleshooting

### Redirect Not Working

1. Verify the redirect is in `/seo/redirects.csv`
2. Run `npm run seo:redirects:validate` to check for issues
3. Rebuild: `npm run seo:redirects:build`
4. Check platform-specific file is deployed correctly
5. Clear CDN/browser cache

### 404 After Migration

1. Check Google Search Console for the 404 URL
2. Add redirect to CSV
3. Validate and rebuild
4. Redeploy

### Redirect Loop

1. Run validation to detect self-redirects
2. Check for A→B→A patterns
3. Fix in CSV and rebuild

## npm Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run seo:redirects:validate` | Validate redirects.csv for errors |
| `npm run seo:redirects:build` | Generate platform-specific redirect files |
| `npm run build` | Full build including redirect generation |

## File Structure

```
/surestart-website/
├── /seo/
│   └── redirects.csv           # Source redirect rules
├── /scripts/
│   ├── validate-redirects.js   # Validation script
│   └── build-redirects.js      # Export script
├── /dist/
│   ├── _redirects              # Netlify (root)
│   └── /redirects/
│       ├── _redirects          # Netlify
│       ├── vercel.json         # Vercel
│       ├── nginx.conf          # nginx
│       └── .htaccess           # Apache
└── /docs/
    └── migration.md            # This documentation
```
