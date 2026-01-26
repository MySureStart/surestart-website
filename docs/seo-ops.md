# SEO Operations Guide

This document describes the SEO-related scripts and their usage.

---

## Quick Start

```bash
# Generate both sitemap.xml and robots.txt (production mode)
npm run seo:generate
```

---

## Scripts

### `npm run seo:sitemap`

Generates `sitemap.xml` with all public pages.

**Usage:**
```bash
npm run seo:sitemap
# or
node scripts/generate-sitemap.js
```

**Output:** `sitemap.xml` in project root

**Pages Included:**
- `/` (index.html)
- `/about/`
- `/contact/`
- `/for-universities/`
- `/for-students/`
- `/k12/`
- `/impact-stories/`

**Pages Excluded:**
- `403.html`, `404.html`, `500.html`, `503.html` (error pages)
- Legacy flat HTML files (to be deleted)

---

### `npm run seo:robots`

Generates `robots.txt` for **development** (blocks all crawlers).

**Usage:**
```bash
npm run seo:robots
# or
node scripts/generate-robots.js
```

**Output:** `robots.txt` with `Disallow: /`

---

### `npm run seo:robots:prod`

Generates `robots.txt` for **production** (allows all crawlers).

**Usage:**
```bash
npm run seo:robots:prod
# or
SITE_ENV=production node scripts/generate-robots.js
# or (PowerShell)
$env:SITE_ENV="production"; node scripts/generate-robots.js
```

**Output:** `robots.txt` with `Allow: /` and `Sitemap:` directive

---

### `npm run seo:generate`

Combines sitemap and production robots.txt generation.

**Usage:**
```bash
npm run seo:generate
```

**Runs:**
1. `seo:sitemap` - generates sitemap.xml
2. `seo:robots:prod` - generates production robots.txt

---

## Placeholder: {{BASE_URL}}

Both scripts use `{{BASE_URL}}` as a placeholder for the site URL.

**Before deployment, replace with your domain:**

```bash
# Example: Replace placeholder with actual domain
# Linux/Mac:
sed -i 's/{{BASE_URL}}/https:\/\/mysurestart.org/g' sitemap.xml robots.txt

# Windows PowerShell:
(Get-Content sitemap.xml) -replace '\{\{BASE_URL\}\}', 'https://mysurestart.org' | Set-Content sitemap.xml
(Get-Content robots.txt) -replace '\{\{BASE_URL\}\}', 'https://mysurestart.org' | Set-Content robots.txt
```

---

## Files

| File | Description |
|------|-------------|
| `scripts/generate-sitemap.js` | Sitemap generator |
| `scripts/generate-robots.js` | Robots.txt generator |
| `sitemap.xml` | Generated sitemap (7 URLs) |
| `robots.txt` | Generated robots file |

---

## Environment Variables

| Variable | Values | Default | Description |
|----------|--------|---------|-------------|
| `SITE_ENV` | `production`, `development` | `development` | Controls robots.txt behavior |

---

## Workflow

### Development
```bash
npm run seo:robots  # Generates Disallow: / (prevents crawling)
```

### Production Deployment
```bash
npm run seo:generate  # Generates both files for production
# Then replace {{BASE_URL}} with actual domain
```

---

## Adding New Pages

To add a new page to the sitemap:

1. Open `scripts/generate-sitemap.js`
2. Add to the `pages` array:
   ```javascript
   { path: '/new-page/', priority: '0.8', changefreq: 'monthly' }
   ```
3. Run `npm run seo:sitemap`

---

## Priority Guidelines

| Priority | Usage |
|----------|-------|
| 1.0 | Homepage only |
| 0.9 | Main product/service pages (K-12, Higher Ed, Students) |
| 0.8 | Secondary pages (About, Contact) |
| 0.7 | Content pages (Impact Stories, Blog) |
| 0.5 | Utility pages |

---

## Change Frequency Guidelines

| Frequency | Usage |
|-----------|-------|
| `weekly` | Homepage, product pages |
| `monthly` | About, Contact, Impact Stories |
| `yearly` | Legal pages, rarely updated content |
