# Performance Optimization Plan

**Generated:** 2026-02-09
**Status:** ✅ Phase 1 Complete (Image Optimization)

---

## Executive Summary

Image optimization has been implemented for the SureStart website, achieving **134.36 MB in savings (95.3% reduction)** through WebP conversion. HTML files have been updated with lazy loading, async decoding, and width/height attributes.

---

## Phase 1: Image Optimization ✅ COMPLETE

### Results

| Metric | Value |
|--------|-------|
| Images Processed | 81 |
| Original Total Size | 141.02 MB |
| Optimized Total Size | 6.67 MB |
| **Total Savings** | **134.36 MB (95.3%)** |

### What Was Done

1. **WebP Conversion**: All PNG/JPG images (except logos/icons) converted to WebP
2. **Output Location**: `https://pub-dcb79d88e2ec4567824453cc853f55f3.r2.dev/images/optimized/` (preserving folder structure)
3. **HTML Updates**: 357 images updated across 17 HTML files with:
   - `loading="lazy"` for below-fold images
   - `decoding="async"` for all images
   - `width` and `height` attributes (where dimensions could be detected)

### Top Savings

| Image | Original | WebP | Savings |
|-------|----------|------|---------|
| higher-ed-hero.jpg | 13.41 MB | 150.2 KB | 98.9% |
| contact-us-hero.jpg | 11.34 MB | 132.1 KB | 98.9% |
| break-through-ai.jpg | 10.53 MB | 166.0 KB | 98.5% |
| about-us-hero.jpg | 9.78 MB | 303.0 KB | 97.0% |
| mit-futuremakers.jpg | 8.85 MB | 320.0 KB | 96.5% |

---

## Phase 2: HTML Picture Elements (Optional Enhancement)

To use the WebP versions with fallback for older browsers:

```html
<picture>
  <source srcset="https://pub-dcb79d88e2ec4567824453cc853f55f3.r2.dev/images/optimized/heroes/about-us-hero.webp" type="image/webp">
  <img src="https://pub-dcb79d88e2ec4567824453cc853f55f3.r2.dev/images/heroes/about-us-hero.jpg" 
       alt="About Us Hero" 
       width="1920" height="1080" 
       loading="lazy" decoding="async">
</picture>
```

### Priority Images for Picture Elements

1. Hero images (LCP impact)
2. Program card backgrounds
3. Success story images
4. Team photos (high traffic pages)

---

## Phase 3: CSS/JS Optimization (Future)

### Current State

| Type | Files | Notes |
|------|-------|-------|
| CSS | 8 files | Main styles.css ~3500 lines |
| JS | 3 files | Already deferred (end of body) |

### Recommendations

1. **CSS Minification**: Use `cssnano` or similar
2. **Critical CSS**: Inline above-fold CSS for faster FCP
3. **Font Preload**: Add preload hints for Eastman Grotesque
4. **Unused CSS**: Audit with PurgeCSS

---

## Phase 4: Lighthouse Verification

### Run Commands

```bash
# Start local server
npx serve . -p 3000

# Run Lighthouse CLI
npx lighthouse http://localhost:3000 --output html --output-path ./lighthouse-home.html
npx lighthouse http://localhost:3000/k12/ --output html --output-path ./lighthouse-k12.html
npx lighthouse http://localhost:3000/about/ --output html --output-path ./lighthouse-about.html
```

### Target Metrics

| Metric | Target | Notes |
|--------|--------|-------|
| LCP | < 2.5s | Hero image optimization helps |
| CLS | < 0.1 | Width/height attributes added |
| FCP | < 1.8s | Consider critical CSS |
| TBT | < 200ms | JS already deferred |

---

## npm Scripts Available

```bash
# Image optimization
npm run images:optimize    # Convert images to WebP
npm run images:update-html # Update HTML with lazy loading

# Shortcut
npm run perf:images        # Run image optimization

# Verification
npm run assets:check       # Verify all asset references
```

---

## File Locations

| Purpose | Location |
|---------|----------|
| Original images | `https://pub-dcb79d88e2ec4567824453cc853f55f3.r2.dev/images/` |
| Optimized WebP | `https://pub-dcb79d88e2ec4567824453cc853f55f3.r2.dev/images/optimized/` |
| Optimization script | `/scripts/optimize-images.js` |
| HTML updater script | `/scripts/update-html-images.js` |
| Image report | `/seo/image-optimization-report.md` |
| This plan | `/seo/performance-plan.md` |

---

## Risk Mitigation

| Risk | Mitigation | Status |
|------|------------|--------|
| WebP browser support | Original images preserved as fallback | ✅ Safe |
| Broken image refs | Asset validator confirmed all 379 refs OK | ✅ Verified |
| Layout shift | Width/height attributes added | ✅ Done |
| Above-fold lazy load | Hero/logo images excluded from lazy load | ✅ Done |

---

## Verification Checklist

- [x] Images optimized (81 files, 134MB saved)
- [x] HTML updated (357 images across 17 files)
- [x] Asset validation passed (379 references OK)
- [x] Original images preserved (fallback available)
- [x] Scripts added to package.json
- [ ] Run Lighthouse audit
- [ ] Deploy and monitor Core Web Vitals

---

## Next Steps

1. **Deploy**: Push changes to staging/production
2. **Verify**: Run Lighthouse on deployed site
3. **Monitor**: Check Core Web Vitals in Google Search Console
4. **Iterate**: Apply Phase 2 (picture elements) if needed


