# SEO Data Extraction Notes

**Generated:** January 20, 2026  
**Source:** `SureStart Website - URL Structure.xlsx` (sheet: "SureStart URL Structure + Meta")

---

## Summary

| File | Records | Status |
|------|---------|--------|
| `page-seo.json` | 7 pages | ✅ Complete |
| `redirects.seed.csv` | 15 redirects | ✅ Complete |

---

## Pages Included in `page-seo.json`

Only pages that **exist in this repo** were included:

| Spreadsheet Row | Mapped To | Notes |
|-----------------|-----------|-------|
| Home | `/` (index.html) | ✅ Direct match |
| Contact | `/contact/` | ✅ Direct match |
| Impact Stories | `/impact-stories/` | ✅ Direct match |
| About | `/about/` | ✅ Direct match |
| For Universities | `/for-universities/` | ✅ Mapped (spreadsheet said `/offerings/higher-ed`) |
| K-12 | `/k12/` | ✅ New page (spreadsheet said `/offerings/k-12`) |
| Students | `/for-students/` | ✅ New page (spreadsheet said `/offerings/students`) |

---

## Pages Excluded (Not in Repo)

These pages from the spreadsheet were **NOT** included in `page-seo.json` because they don't exist yet:

| Spreadsheet Row | Planned URL | Reason Excluded |
|-----------------|-------------|-----------------|
| Vibe Lab | `/courses/vibe-lab` | Page not created |
| AI Courses | `/courses` | Page not created |
| FutureMakers/For Students | `/courses/mit-futuremakers` | Page not created |
| Case Study: EMPath | N/A | Content merged into Impact Stories |

---

## Ambiguous Mappings in `redirects.seed.csv`

### High Confidence Redirects

| From | To | Confidence | Reasoning |
|------|-----|-----------|-----------|
| `/surestart` | `/` | ✅ High | Spreadsheet explicitly says redirect to home |
| `/for-students-2024` | `/for-students/` | ✅ High | Old students page → new students page |
| `/case-study` | `/impact-stories/` | ✅ High | Spreadsheet maps to impact-stories |
| `/store` | `/` | ✅ High | Retired page → home |
| `/for-companies` | `/` | ✅ High | Retired page → home |

### Medium Confidence Redirects (Best Guess)

| From | To | Confidence | Reasoning |
|------|-----|-----------|-----------|
| `/vibe-lab` | `/for-students/` | ⚠️ Medium | Page doesn't exist; `/for-students/` is closest match |
| `/vibe-lab-sneak-peek` | `/for-students/` | ⚠️ Medium | Form page doesn't exist; redirect to students |
| `/courses` | `/for-students/` | ⚠️ Medium | Courses index doesn't exist; students is closest |
| `/futuremakers-track-1,2,3` | `/for-students/` | ⚠️ Medium | Resources pages don't exist; students is closest |
| `/discord` | `/contact/` | ⚠️ Medium | Form page; contact is reasonable fallback |
| `/join-newsletter` | `/contact/` | ⚠️ Medium | Form page; contact has forms |
| `/getting-started-1` | `/for-students/` | ⚠️ Medium | Student resource → students page |

---

## Spreadsheet URL Structure Discrepancies

The spreadsheet planned a different URL structure than what we implemented:

| Spreadsheet Planned | We Implemented | Decision |
|---------------------|----------------|----------|
| `/offerings/k-12` | `/k12/` | Simpler, matches legacy `/k12` if existed |
| `/offerings/higher-ed` | `/for-universities/` | Matches legacy exactly |
| `/offerings/students` | `/for-students/` | Matches legacy approximately |
| `/about-us` | `/about/` | Matches legacy exactly |

**Rationale:** We prioritized matching legacy Squarespace URLs over the spreadsheet's planned structure to minimize redirects needed.

---

## Missing OG Images

The `ogImage` paths in `page-seo.json` are **placeholders**. These images don't exist yet:

```
/assets/images/og/home.png
/assets/images/og/about.png
/assets/images/og/contact.png
/assets/images/og/higher-ed.png
/assets/images/og/students.png
/assets/images/og/k12.png
/assets/images/og/impact-stories.png
```

**Action needed:** Create OG images (recommended size: 1200x630px) or update paths to existing images.

---

## Data Quality Notes

1. **Meta descriptions** were taken directly from spreadsheet "New Meta Description" column
2. **H1 headers** were taken from spreadsheet "H1 Header" column
3. **Titles** were constructed as `{Page Name} — SureStart` pattern
4. **robots** set to `index, follow` for all public pages (error pages should be `noindex, nofollow`)

---

## Recommendations

1. **Create missing pages** for Vibe Lab, Courses, MIT FutureMakers to reduce redirect complexity
2. **Create OG images** for social sharing
3. **Review redirect targets** for medium-confidence items before deployment
4. **Add forms** to Contact page for Discord, Newsletter functionality
