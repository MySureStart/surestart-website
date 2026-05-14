# CSS/JS Minification Report

**Generated:** 2026-05-14
**Build Output:** `/dist/`

---

## Summary

| Metric | Value |
|--------|-------|
| Files Copied to /dist | 2032 |
| CSS Files Minified | 11 |
| JS Files Minified | 9 |
| HTML Files Updated | 4 |
| Original Total Size | 923.9 KB |
| Minified Total Size | 581.9 KB |
| **Total Savings** | **342.0 KB (37.0%)** |

---

## CSS Minification Details

| Original File | Size | Minified | Savings |
|---------------|------|----------|---------|
| `about-us.css` | 32.4 KB | 23.1 KB | 9.3 KB (28.6%) |
| `blog.css` | 9.5 KB | 6.7 KB | 2.8 KB (29.2%) |
| `consent.css` | 9.9 KB | 5.8 KB | 4.1 KB (41.3%) |
| `contact-us.css` | 18.4 KB | 13.0 KB | 5.3 KB (28.9%) |
| `error-pages.css` | 8.0 KB | 5.7 KB | 2.3 KB (29.1%) |
| `higher-ed.css` | 55.8 KB | 40.8 KB | 15.0 KB (26.9%) |
| `impact-stories.css` | 100.8 KB | 69.3 KB | 31.5 KB (31.2%) |
| `k12.css` | 150.7 KB | 106.8 KB | 43.8 KB (29.1%) |
| `students.css` | 68.3 KB | 48.8 KB | 19.5 KB (28.5%) |
| `styles.css` | 133.0 KB | 90.1 KB | 43.0 KB (32.3%) |
| `vibe-lab.css` | 34.9 KB | 23.6 KB | 11.3 KB (32.4%) |


---

## JS Minification Details

| Original File | Size | Minified | Savings |
|---------------|------|----------|---------|
| `blog-data.js` | 45.5 KB | 35.0 KB | 10.5 KB (23.0%) |
| `blog.js` | 10.4 KB | 5.4 KB | 5.0 KB (48.0%) |
| `consent-ui.js` | 17.5 KB | 8.0 KB | 9.4 KB (54.0%) |
| `consent-vendors.js` | 20.5 KB | 7.9 KB | 12.5 KB (61.3%) |
| `consent.js` | 15.8 KB | 3.8 KB | 12.0 KB (76.1%) |
| `impact-stories.js` | 98.8 KB | 49.2 KB | 49.6 KB (50.2%) |
| `k12-scroll.js` | 12.2 KB | 6.5 KB | 5.7 KB (46.7%) |
| `script.js` | 77.7 KB | 30.1 KB | 47.6 KB (61.2%) |
| `vibe-checkout.js` | 4.0 KB | 2.1 KB | 1.8 KB (46.3%) |


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

