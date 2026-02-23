# CSS/JS Minification Report

**Generated:** 2026-02-23
**Build Output:** `/dist/`

---

## Summary

| Metric | Value |
|--------|-------|
| Files Copied to /dist | 2014 |
| CSS Files Minified | 8 |
| JS Files Minified | 3 |
| HTML Files Updated | 4 |
| Original Total Size | 751.9 KB |
| Minified Total Size | 481.3 KB |
| **Total Savings** | **270.6 KB (36.0%)** |

---

## CSS Minification Details

| Original File | Size | Minified | Savings |
|---------------|------|----------|---------|
| `about-us.css` | 32.2 KB | 22.9 KB | 9.3 KB (28.9%) |
| `contact-us.css` | 18.3 KB | 12.9 KB | 5.3 KB (29.1%) |
| `error-pages.css` | 8.0 KB | 5.7 KB | 2.3 KB (29.1%) |
| `higher-ed.css` | 55.3 KB | 40.4 KB | 14.8 KB (26.8%) |
| `impact-stories.css` | 100.6 KB | 69.1 KB | 31.5 KB (31.3%) |
| `k12.css` | 149.8 KB | 106.2 KB | 43.7 KB (29.1%) |
| `students.css` | 67.9 KB | 48.5 KB | 19.4 KB (28.5%) |
| `styles.css` | 132.4 KB | 89.6 KB | 42.9 KB (32.4%) |


---

## JS Minification Details

| Original File | Size | Minified | Savings |
|---------------|------|----------|---------|
| `impact-stories.js` | 100.4 KB | 50.5 KB | 49.9 KB (49.7%) |
| `k12-scroll.js` | 12.2 KB | 6.5 KB | 5.7 KB (46.7%) |
| `script.js` | 75.0 KB | 29.0 KB | 45.9 KB (61.3%) |


---

## Build Verification

The production build in `/dist/` includes:

- ✅ All HTML pages with updated asset references
- ✅ Minified CSS files (`*.min.css`)
- ✅ Minified JS files (`*.min.js`)
- ✅ All images and fonts
- ✅ CNAME for custom domain
- ✅ robots.txt and sitemap.xml

---

## Usage

```bash
# Build production version
npm run build:prod

# Serve production build locally
npm run serve:dist

# Build and generate this report
npm run perf:build
```

---

## Deployment

The `/dist/` folder is ready for deployment:

1. **GitHub Pages**: Point to the `dist` folder or copy contents
2. **Netlify/Vercel**: Set build output to `dist`
3. **Static hosting**: Upload `/dist/` contents

---

## Notes

- Original source files in `/assets/` remain unchanged
- Both minified (`.min.css`, `.min.js`) and original files exist in `/dist/assets/`
- HTML files reference minified versions for production
- Folder-based URLs (/about/, /k12/, etc.) work correctly

