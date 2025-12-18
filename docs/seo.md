# SEO Configuration Guide

This document explains the site configuration system for SEO management across different environments (development, staging, production).

## Overview

The SEO configuration consists of three components:

1. **`/seo/site.config.json`** - Central configuration file with site-wide SEO settings
2. **`/seo/lib/config.js`** - Node.js helper module for reading config and detecting environment
3. **Per-page `.seo.json` files** - Optional sidecar files for page-specific SEO overrides

## Configuration File

### Location

`/seo/site.config.json`

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `siteName` | string | The official name of the site (used in titles, meta tags) |
| `baseUrl` | string | The canonical base URL for the site (e.g., `https://mysurestart.com`) |
| `canonicalHostPolicy` | `"www"` \| `"non-www"` | Whether canonical URLs should use www or non-www |
| `trailingSlash` | boolean | Whether URLs should end with a trailing slash |
| `defaultRobotsProd` | string | Robots meta directive for production (e.g., `"index,follow"`) |
| `defaultRobotsNonProd` | string | Robots meta directive for non-production (e.g., `"noindex,nofollow"`) |
| `defaultOgImage` | string | Path to the default Open Graph image |

### Example Configuration

```json
{
  "siteName": "MySureStart",
  "baseUrl": "https://mysurestart.com",
  "canonicalHostPolicy": "non-www",
  "trailingSlash": false,
  "defaultRobotsProd": "index,follow",
  "defaultRobotsNonProd": "noindex,nofollow",
  "defaultOgImage": "/static/images/SureStart_Standard Logo (1).png"
}
```

## Per-Page SEO Overrides

You can override SEO settings for individual pages by creating a sidecar JSON file with the same name as the HTML file but with a `.seo.json` extension.

### Location

Place the `.seo.json` file next to the corresponding HTML file in `/src/`:

```
/src/
  index.html
  index.seo.json       # SEO overrides for index.html
  about-us.html
  about-us.seo.json    # SEO overrides for about-us.html
  vibe-lab.html
  vibe-lab.seo.json    # SEO overrides for vibe-lab.html
```

### Available Fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Page title (appears in `<title>` and OG title) |
| `description` | string | Page description (meta description and OG description) |
| `ogImage` | string | Page-specific Open Graph image (overrides default) |
| `breadcrumbs` | array | Breadcrumb trail for structured data (see below) |
| `noindex` | boolean | Set to `true` to exclude from sitemap |

### Example Per-Page Config

**`/src/about-us.seo.json`**
```json
{
  "title": "About Us — MySureStart",
  "description": "Learn about SureStart's mission to empower the next generation of AI leaders.",
  "ogImage": "/static/images/about-us-hero.jpg"
}
```

**`/src/vibe-lab.seo.json`**
```json
{
  "title": "Vibe Lab: AI for Building Your First Social Enterprise | MySureStart",
  "description": "Turn your ideas into AI-powered apps that make a difference. No coding experience required!",
  "ogImage": "/static/images/hero-vibe-lab.png"
}
```

### Default Fallbacks

If a `.seo.json` file doesn't exist or a field is missing, the build system uses these defaults:

- **title**: "MySureStart"
- **description**: "Empowering the next generation of AI leaders through accessible, world-class education."
- **ogImage**: Value from `defaultOgImage` in `site.config.json`

## Build System

### HTML Partials and Tokens

The build system processes HTML files from `/src/` and outputs to `/dist/`.

#### Include Directive

Use the include directive to import shared partials:

```html
<head>
<!-- INCLUDE:partials/head.html -->
<link rel="stylesheet" href="styles.css">
</head>
```

#### SEO Tokens

The following tokens are replaced during build:

| Token | Replaced With |
|-------|---------------|
| `{{TITLE}}` | Page title from `.seo.json` or default |
| `{{DESCRIPTION}}` | Page description from `.seo.json` or default |
| `{{CANONICAL}}` | Full canonical URL for the page |
| `{{ROBOTS}}` | Robots directive based on environment |
| `{{OG_IMAGE}}` | Full URL to Open Graph image |
| `{{SITE_NAME}}` | Site name from config |

### Running the Build

```bash
# Development build
npm run build

# Production build
npm run build:prod

# Build and serve locally
npm run dev
```

## Environment Detection

The config helper detects the current environment using environment variables:

### Priority Order

1. **`SITE_ENV`** (primary) - Explicit site environment variable
2. **`NODE_ENV`** (fallback) - Standard Node.js environment variable
3. **`development`** (default) - If neither is set

### Valid Environment Values

| Environment | Values Recognized |
|-------------|-------------------|
| Production | `production`, `prod` |
| Staging | `staging`, `stage` |
| Development | `development`, `dev`, or any other value |

## Setting baseUrl for Different Environments

### Option 1: Single Config with Environment Override (Recommended)

Keep a single `site.config.json` with your production URL and override in your build/deploy scripts:

**For Production:**
```bash
# The baseUrl in config is already set for production
NODE_ENV=production npm run build
```

**For Staging:**
```bash
# Override baseUrl via environment variable
SITE_ENV=staging SITE_BASE_URL=https://staging.mysurestart.com npm run build
```

### Option 2: Environment-Specific Config Files

Create multiple config files and copy the appropriate one during deployment:

```
/seo/
  site.config.json           # Default (development)
  site.config.staging.json   # Staging overrides
  site.config.prod.json      # Production overrides
```

In your deploy script:
```bash
# For staging
cp seo/site.config.staging.json seo/site.config.json

# For production
cp seo/site.config.prod.json seo/site.config.json
```

### Option 3: CI/CD Variable Substitution

Use your CI/CD platform's variable substitution to inject the correct baseUrl:

**GitHub Actions Example:**
```yaml
env:
  BASE_URL: ${{ vars.SITE_BASE_URL }}

steps:
  - name: Build for Production
    run: npm run build:prod
    env:
      SITE_ENV: production
      SITE_BASE_URL: https://mysurestart.com

  - name: Build for Staging
    run: npm run build
    env:
      SITE_ENV: staging
      SITE_BASE_URL: https://staging.mysurestart.com
```

**Netlify Example:**

Set in `netlify.toml`:
```toml
[context.production.environment]
  SITE_ENV = "production"
  SITE_BASE_URL = "https://mysurestart.com"

[context.deploy-preview.environment]
  SITE_ENV = "staging"
  SITE_BASE_URL = "https://staging.mysurestart.com"
```

**Vercel Example:**

Set environment variables in Vercel dashboard:
- Production: `SITE_ENV=production`, `SITE_BASE_URL=https://mysurestart.com`
- Preview: `SITE_ENV=staging`, `SITE_BASE_URL=https://preview.mysurestart.com`

## Using the Config Helper

### Basic Usage

```javascript
const { 
  getConfig, 
  isProd, 
  getRobotsDirective, 
  buildCanonicalUrl 
} = require('./seo/lib/config');

// Get full configuration
const config = getConfig();
console.log(config.siteName); // "MySureStart"

// Check environment
if (isProd()) {
  console.log('Running in production');
}

// Get robots directive based on environment
const robots = getRobotsDirective();
// Production: "index,follow"
// Non-prod: "noindex,nofollow"

// Build canonical URLs
const canonicalUrl = buildCanonicalUrl('/about-us');
// Returns: "https://mysurestart.com/about-us"
```

### Available Functions

| Function | Returns | Description |
|----------|---------|-------------|
| `getConfig()` | Object | Full configuration object |
| `getEnv()` | string | Current environment name |
| `isProd()` | boolean | True if production environment |
| `isStaging()` | boolean | True if staging environment |
| `getBaseUrl()` | string | Configured base URL |
| `getRobotsDirective()` | string | Robots directive for current environment |
| `getDefaultOgImage()` | string | Path to default OG image |
| `buildCanonicalUrl(path)` | string | Full canonical URL for given path |
| `getFullContext()` | Object | Config + environment info combined |
| `clearCache()` | void | Clear cached config (for reloading) |

## Sitemap Generation

The build system automatically generates a `sitemap.xml` file in `/dist/` after each build.

### How It Works

The sitemap generator (`/scripts/generate-sitemap.js`):

1. Scans `/dist` for all `.html` files
2. Maps `index.html` to `/` (the root URL)
3. Uses `baseUrl` from `/seo/site.config.json` for absolute URLs
4. Excludes certain pages automatically
5. Outputs `/dist/sitemap.xml`

### Automatic Exclusions

The following are automatically excluded from the sitemap:

- **`404.html`** - Error pages
- **Files under `/dist/admin/`** - Admin/internal pages
- **Pages marked `noindex`** - Pages with `"noindex": true` in their `.seo.json`

### Excluding a Page from Sitemap

To exclude a specific page from the sitemap, add `"noindex": true` to its `.seo.json` file:

**`/src/internal-page.seo.json`**
```json
{
  "title": "Internal Page",
  "description": "This page should not be indexed",
  "noindex": true
}
```

### Running Sitemap Generation

The sitemap is generated automatically with `npm run build`. To generate it manually:

```bash
# Generate sitemap only (requires /dist to exist)
npm run seo:sitemap
```

### Sitemap Output Example

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://mysurestart.com/</loc>
    <lastmod>2025-01-15</lastmod>
  </url>
  <url>
    <loc>https://mysurestart.com/about-us.html</loc>
    <lastmod>2025-01-15</lastmod>
  </url>
  <!-- ... more URLs ... -->
</urlset>
```

## Robots.txt Generation

The build system automatically generates an environment-aware `robots.txt` file in `/dist/`.

### How It Works

The robots.txt generator (`/scripts/generate-robots.js`):

1. Detects the current environment using `SITE_ENV` or `NODE_ENV`
2. Generates different content based on environment
3. Includes sitemap reference for production
4. Outputs `/dist/robots.txt`

### Environment-Aware Behavior

**Production Environment** (`SITE_ENV=production` or `NODE_ENV=production`):
```
# Robots.txt - Production
User-agent: *
Allow: /

Disallow: /admin/
Disallow: /partials/

Sitemap: https://mysurestart.com/sitemap.xml
```

**Non-Production Environments** (staging, development):
```
# Robots.txt - Non-Production (development)
User-agent: *
Disallow: /
```

### Why This Matters

- **Non-production sites should never be indexed** - Staging and development sites can leak unreleased content, confuse search engines with duplicate content, and waste crawl budget.
- **Production needs the sitemap** - The `Sitemap:` directive helps search engines discover all pages efficiently.

### Running Robots.txt Generation

The robots.txt is generated automatically with `npm run build`. To generate it manually:

```bash
# Generate robots.txt only (requires /dist to exist)
npm run seo:robots
```

### Testing Different Environments

```bash
# Development (default) - generates Disallow: /
npm run build

# Production - generates Allow: / with sitemap
npm run build:prod

# Or explicitly set the environment
SITE_ENV=production npm run seo:robots
SITE_ENV=staging npm run seo:robots
```

## Structured Data (JSON-LD)

The build system automatically generates JSON-LD structured data for improved search engine understanding and rich snippets.

### Organization Schema

An Organization schema is automatically added to every page from the site configuration.

**Configuration in `/seo/site.config.json`:**

```json
{
  "siteName": "MySureStart",
  "baseUrl": "https://mysurestart.com",
  "organization": {
    "name": "MySureStart",
    "legalName": "MySureStart Inc.",
    "description": "Empowering the next generation of AI leaders",
    "logo": "/static/images/SureStart_Standard Logo (1).png",
    "sameAs": [
      "https://www.linkedin.com/company/mysurestart",
      "https://twitter.com/mysurestart"
    ],
    "contactPoint": {
      "contactType": "customer service",
      "email": "info@mysurestart.com"
    }
  }
}
```

**Generated JSON-LD:**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "MySureStart",
  "legalName": "MySureStart Inc.",
  "url": "https://mysurestart.com",
  "logo": "https://mysurestart.com/static/images/SureStart_Standard Logo (1).png",
  "description": "Empowering the next generation of AI leaders",
  "sameAs": [
    "https://www.linkedin.com/company/mysurestart",
    "https://twitter.com/mysurestart"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "info@mysurestart.com"
  }
}
</script>
```

### Breadcrumb Schema

Breadcrumbs can be added per page via the `.seo.json` file.

**IMPORTANT:** Breadcrumbs in JSON-LD must reflect **visible breadcrumbs** on the page. Only include breadcrumb items that are actually displayed to users. Google requires consistency between structured data and on-page content.

**Example `/src/about-us.seo.json`:**

```json
{
  "title": "About Us — MySureStart",
  "description": "Learn about our mission...",
  "breadcrumbs": [
    { "name": "Home", "url": "/" },
    { "name": "About Us", "url": "/about-us.html" }
  ]
}
```

**Generated JSON-LD:**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://mysurestart.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "About Us",
      "item": "https://mysurestart.com/about-us.html"
    }
  ]
}
</script>
```

### Breadcrumb Requirements

| Requirement | Description |
|-------------|-------------|
| **Visibility** | JSON-LD breadcrumbs must match visible breadcrumbs on the page |
| **Order** | Items are ordered by position (1, 2, 3, ...) |
| **URLs** | Relative URLs are converted to absolute using `baseUrl` |
| **Current page** | Include the current page as the last item |

### Adding Breadcrumbs to a Page

1. Add the `breadcrumbs` array to the page's `.seo.json` file
2. Ensure the breadcrumb trail matches your visible breadcrumb navigation
3. Use relative URLs (they'll be converted to absolute)

**Example for a nested page:**

```json
{
  "title": "K-12 AI Program — MySureStart",
  "breadcrumbs": [
    { "name": "Home", "url": "/" },
    { "name": "Programs", "url": "/programs.html" },
    { "name": "K-12", "url": "/k12.html" }
  ]
}
```

### JSON-LD Tokens

These tokens are used in the head partial and replaced during build:

| Token | Replaced With |
|-------|---------------|
| `{{JSONLD_ORGANIZATION}}` | Organization schema from config |
| `{{JSONLD_BREADCRUMB}}` | BreadcrumbList schema from page config |

### Validating Structured Data

After building, validate your structured data:

1. **Google's Rich Results Test**: https://search.google.com/test/rich-results
2. **Schema.org Validator**: https://validator.schema.org/
3. **Google Search Console**: Check for structured data errors

## Pre-launch SEO Checks

Run all SEO validation checks with a single command before deployment.

### Running Pre-launch Checks

```bash
# Development mode (default)
npm run seo:prelaunch

# Production mode (stricter checks)
npm run seo:prelaunch -- --production
```

### What It Does

The pre-launch script runs these checks in order:

| Step | Check | Description |
|------|-------|-------------|
| 1 | **Build** | Compiles HTML, generates sitemap, robots.txt, and redirects |
| 2 | **Redirects Validation** | Validates `/seo/redirects.csv` for errors |
| 3 | **SEO Smoke Test** | Checks title, description, canonical, robots on all pages |
| 4 | **Link Checker** | Validates all internal links and assets |

### Expected Output Files

After a successful run, these files are generated in `/dist/`:

```
/dist/
├── sitemap.xml              # XML sitemap for search engines
├── robots.txt               # Robots directives (env-aware)
├── _redirects               # Netlify redirects file
└── /reports/
    └── link-check.csv       # Link checker results
```

### Example Output

```
🚀 SEO Pre-launch Checks


Running in DEVELOPMENT mode (use --production for stricter checks)

📦 Step 1/4: Building site...
   ✓ Build complete

🔀 Step 2/4: Validating redirects...
   ✓ Redirects valid

🌐 Starting local server on port 8080...
   Server running at http://localhost:8080

🔬 Step 3/4: Running SEO smoke test...
   ✓ Smoke test passed

🔗 Step 4/4: Running link checker...
   ✓ Link check passed

🛑 Stopping local server...

PRE-LAUNCH CHECK SUMMARY

  ✓ Build & Generate: PASSED (2.3s)
  ✓ Redirects Validation: PASSED (0.5s)
  ✓ SEO Smoke Test: PASSED (3.1s)
  ✓ Link Checker: PASSED (5.2s)

------------------------------------------------------------
OUTPUT FILES:
------------------------------------------------------------
  /dist/sitemap.xml
  /dist/robots.txt
  /dist/_redirects
  /dist/reports/link-check.csv

✅ All pre-launch checks PASSED
```

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All checks passed |
| 1 | One or more checks failed |

### CI/CD Integration

```yaml
# GitHub Actions
- name: SEO Pre-launch Checks
  run: npm run seo:prelaunch -- --production
  env:
    SITE_ENV: production
```

### Production vs Development Mode

| Feature | Development | Production |
|---------|-------------|------------|
| Robots directive | `noindex,nofollow` | `index,follow` |
| Canonical host check | Lenient | Must match baseUrl |
| noindex allowed | Yes | No (error) |

## Best Practices

1. **Create `.seo.json` files for important pages** - At minimum, create them for the homepage, landing pages, and any pages you want to rank well in search.

2. **Never commit production secrets** - The baseUrl is not sensitive, but if you add API keys later, use environment variables.

3. **Always use `noindex,nofollow` for non-production** - This prevents search engines from indexing staging/dev sites.

4. **Keep canonical URLs consistent** - Pick either `www` or `non-www` and stick with it. Configure server redirects accordingly.

5. **Test the build locally** - Run `npm run build` and check the output in `/dist/` before deploying.

6. **Document environment variables** - Add to your `.env.example` file:
   ```
   SITE_ENV=development
   SITE_BASE_URL=http://localhost:3000
   ```

## Project Structure

```
/surestart-website/
├── /src/                      # Source files (HTML, CSS, JS)
│   ├── index.html
│   ├── index.seo.json         # Per-page SEO config
│   ├── about-us.html
│   ├── about-us.seo.json
│   ├── /partials/
│   │   └── head.html          # Shared head partial with SEO tokens
│   ├── /static/               # Static assets
│   └── ...
├── /dist/                     # Build output (gitignored)
├── /seo/
│   ├── site.config.json       # Site-wide SEO configuration
│   └── /lib/
│       └── config.js          # Config helper module
├── /scripts/
│   └── build.js               # Build script
├── /docs/
│   └── seo.md                 # This documentation
└── package.json               # npm scripts
```

## Troubleshooting

### Config not loading
- Ensure `site.config.json` exists at `/seo/site.config.json`
- Check JSON syntax is valid

### Wrong environment detected
- Check that `SITE_ENV` or `NODE_ENV` is set correctly
- Environment variables are case-insensitive (`PRODUCTION` = `production`)

### Canonical URLs incorrect
- Verify `baseUrl` doesn't have a trailing slash
- Check `canonicalHostPolicy` matches your server configuration

### SEO tokens not replaced
- Ensure the partial is included with `<!-- INCLUDE:partials/head.html -->`
- Check that tokens use double curly braces: `{{TITLE}}`

### Per-page config not applied
- Verify the `.seo.json` filename matches the HTML filename exactly
- Check JSON syntax is valid
