# Technical Context: Stack & Infrastructure

## Technology Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| **Markup** | HTML5 | Static files, no templating |
| **Styling** | CSS3 | Custom CSS, no preprocessor |
| **Interactivity** | Vanilla JavaScript | No framework dependencies |
| **Build Tools** | Node.js scripts | SEO automation, no bundler |
| **Forms** | Airtable Embeds | External form handling |
| **Video** | YouTube Embeds + Self-hosted | Hero videos self-hosted |
| **Hosting** | GitHub Pages | Static file serving |
| **DNS** | Custom domain | mysurestart.org via CNAME |

---

## Build System: Node.js Scripts

This project has **no bundler** (Webpack, Vite, etc.) but includes Node.js scripts for SEO automation.

### package.json Scripts

```json
{
  "scripts": {
    "seo:sitemap": "node scripts/generate-sitemap.js",
    "seo:robots": "node scripts/generate-robots.js",
    "seo:robots:prod": "cross-env SITE_ENV=production node scripts/generate-robots.js",
    "seo:generate": "npm run seo:sitemap && npm run seo:robots:prod",
    "seo:check": "node scripts/seo-smoke-test.js",
    "redirects:merge": "node scripts/generate-redirects.js",
    "redirects:validate": "node scripts/validate-redirects.js",
    "redirects:build": "node scripts/build-redirects.js",
    "redirects:all": "npm run redirects:merge && npm run redirects:validate && npm run redirects:build"
  }
}
```

### Scripts Directory

| Script | Purpose | Output |
|--------|---------|--------|
| `generate-sitemap.js` | Generates sitemap.xml | `/sitemap.xml` |
| `generate-robots.js` | Generates robots.txt (env-aware) | `/robots.txt` |
| `generate-redirects.js` | Merges redirect CSV sources | `/seo/redirects.final.csv` |
| `build-redirects.js` | Builds platform-specific redirects | `/dist/redirects/*` |
| `validate-redirects.js` | Validates for duplicates/chains/loops | Console output |
| `seo-smoke-test.js` | Validates HTML files for SEO | Console output, exit code |

---

## SEO Automation

### Sitemap Generation

```bash
npm run seo:sitemap
```

- Generates sitemap.xml with 7 public pages
- Uses `{{BASE_URL}}` placeholder (replace before deploy)
- Includes lastmod, changefreq, priority

### Robots.txt Generation

```bash
npm run seo:robots        # Development (Disallow: /)
npm run seo:robots:prod   # Production (Allow: /)
```

- Environment-aware via `SITE_ENV` variable
- Development mode blocks all crawlers
- Production mode allows crawling + includes sitemap

### SEO Smoke Test

```bash
npm run seo:check
```

Validates all HTML files for:
- Exactly one `<title>` tag
- Meta description exists (public pages)
- Canonical tag exists (public pages)
- Robots meta exists and not noindex (public pages)
- Exactly one `<h1>` tag
- No missing alt attributes

**Exit codes:** 0 = pass, 1 = failures (CI ready)

---

## Redirect System

### Input Files

| File | Description |
|------|-------------|
| `/seo/legacy/coverage-report.csv` | Legacy URL analysis |
| `/seo/redirects.seed.csv` | Manual redirect mapping |

### Output Files

| File | Platform | Location |
|------|----------|----------|
| `redirects.final.csv` | Master list | `/seo/` |
| `_redirects` | Netlify | `/dist/redirects/` |
| `vercel.json` | Vercel | `/dist/redirects/` |
| `nginx.conf` | nginx | `/dist/redirects/` |

### Workflow

```bash
npm run redirects:merge     # Merge CSV sources
npm run redirects:validate  # Check for issues
npm run redirects:build     # Generate platform files
npm run redirects:all       # Run all three
```

---

## Hosting: GitHub Pages

**Repository:** https://github.com/MySureStart/surestart-website.git

### Configuration

- **CNAME file:** Points to `mysurestart.org`
- **Default branch:** `main`
- **Deployment:** Automatic on push to main

### URL Mapping (Folder-Based)

```
Repository File              → Live URL
─────────────────────────────────────────────
index.html                   → mysurestart.org/
about/index.html             → mysurestart.org/about/
contact/index.html           → mysurestart.org/contact/
for-universities/index.html  → mysurestart.org/for-universities/
for-students/index.html      → mysurestart.org/for-students/
k12/index.html               → mysurestart.org/k12/
impact-stories/index.html    → mysurestart.org/impact-stories/
404.html                     → mysurestart.org/404.html (auto-serves)
```

### Limitations

- No server-side redirects (.htaccess not supported)
- 301 redirects require Netlify/Vercel or external service
- No dynamic content processing

---

## Domain Configuration

### Current Setup

| Domain | Purpose | Hosting |
|--------|---------|---------|
| `mysurestart.org` | Production website | GitHub Pages |
| `mysurestart.com` | Legacy (Squarespace) | To be redirected |

### CNAME Record

The `CNAME` file in repo root contains:
```
mysurestart.org
```

---

## External Services

### Airtable (Forms)

- **Purpose:** Form handling, lead capture
- **Integration:** iframe embeds
- **Forms:** Contact form, course notification, waitlist

### YouTube (Videos)

- **Purpose:** Embedded video content
- **Integration:** iframe embeds with `youtube.com/embed/`
- **Usage:** Testimonials, program overviews

### Social Platforms

- LinkedIn: https://www.linkedin.com/company/mysurestart
- Twitter/X: https://x.com/My_SureStart
- Instagram: https://www.instagram.com/mysurestart/
- Facebook: https://www.facebook.com/MySureStart
- YouTube: https://www.youtube.com/@surestart7136
- Discord: https://discord.gg/vCc8W8595m

---

## SEO Configuration

### Current State (All Complete ✅)

| Element | Status |
|---------|--------|
| robots.txt | ✅ Production mode |
| sitemap.xml | ✅ 7 pages listed |
| Meta descriptions | ✅ All public pages |
| Canonical tags | ✅ All public pages |
| Open Graph tags | ✅ All public pages |
| Twitter Cards | ✅ All public pages |
| noindex on errors | ✅ 403, 404, 500, 503 |
| SEO smoke test | ✅ All passing |

### Sitemap URLs

```
https://mysurestart.org/
https://mysurestart.org/about/
https://mysurestart.org/contact/
https://mysurestart.org/for-universities/
https://mysurestart.org/for-students/
https://mysurestart.org/k12/
https://mysurestart.org/impact-stories/
```

---

## Fonts

### Google Fonts (Preconnect)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

### Self-Hosted Fonts

Located in `assets/fonts/`:
- DM Sans (variable font)
- Eastman Grotesque (multiple weights)
- Inter
- Source Serif Pro

---

## File Structure

```
surestart-website/
├── index.html                  # Homepage
├── about/index.html            # About page
├── contact/index.html          # Contact page
├── for-universities/index.html # Higher Ed page
├── for-students/index.html     # Students page
├── k12/index.html              # K-12 page
├── impact-stories/index.html   # Impact Stories
├── 403.html, 404.html, etc.    # Error pages
├── sitemap.xml                 # Generated
├── robots.txt                  # Generated
├── package.json                # npm scripts
├── scripts/                    # Node.js automation
│   ├── generate-sitemap.js
│   ├── generate-robots.js
│   ├── generate-redirects.js
│   ├── build-redirects.js
│   ├── validate-redirects.js
│   └── seo-smoke-test.js
├── seo/                        # SEO documentation
│   ├── page-seo.json
│   ├── redirects.seed.csv
│   ├── redirects.final.csv
│   └── legacy/
├── dist/redirects/             # Generated redirect files
│   ├── _redirects
│   ├── vercel.json
│   └── nginx.conf
├── docs/
│   └── seo-ops.md
├── memory-bank/                # Project documentation
└── assets/                     # CSS, JS, images, videos
```

---

## Development Workflow

### Local Development

```bash
# Clone repository
git clone https://github.com/MySureStart/surestart-website.git

# Start local server
npx serve .

# Run SEO check
npm run seo:check

# Commit and push to deploy
git add .
git commit -m "Description"
git push origin main
```

### Deployment

Automatic via GitHub Pages on push to `main` branch.

No CI/CD pipeline - direct deployment of static files.

### Pre-Deployment Checklist

```bash
# 1. Run SEO smoke test
npm run seo:check

# 2. Regenerate SEO files
npm run seo:generate

# 3. Build redirects (if needed)
npm run redirects:all

# 4. Replace {{BASE_URL}} placeholder
# 5. Commit and push
```
