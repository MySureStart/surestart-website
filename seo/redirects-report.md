# Redirects Report

**Generated:** January 26, 2026  
**Status:** ✅ All validations passed

---

## Summary

| Metric | Value |
|--------|-------|
| **Total redirects** | 18 |
| **Duplicates** | 0 |
| **Chains** | 0 |
| **Loops** | 0 |
| **Invalid targets** | 0 |

---

## Commands Executed

```bash
npm run redirects:all
```

This runs:
1. `npm run redirects:merge` — Merges seed CSVs → `redirects.final.csv`
2. `npm run redirects:validate` — Validates for duplicates/chains/loops
3. `npm run redirects:build` — Generates platform-specific files

---

## Generated Output Files

| File | Platform | Path |
|------|----------|------|
| `_redirects` | Netlify | `/dist/redirects/_redirects` |
| `vercel.json` | Vercel | `/dist/redirects/vercel.json` |
| `nginx.conf` | nginx | `/dist/redirects/nginx.conf` |
| `redirects.final.csv` | Master CSV | `/seo/redirects.final.csv` |

---

## Redirect Inventory (18 total)

| # | Source | Destination |
|---|--------|-------------|
| 1 | `/about` | `/about/` |
| 2 | `/case-study` | `/impact-stories/` |
| 3 | `/contact` | `/contact/` |
| 4 | `/courses` | `/for-students/` |
| 5 | `/discord` | `/contact/` |
| 6 | `/for-companies` | `/` |
| 7 | `/for-students-2024` | `/for-students/` |
| 8 | `/for-universities` | `/for-universities/` |
| 9 | `/futuremakers-track-1` | `/for-students/` |
| 10 | `/futuremakers-track-2` | `/for-students/` |
| 11 | `/futuremakers-track-3` | `/for-students/` |
| 12 | `/getting-started-1` | `/for-students/` |
| 13 | `/join-newsletter` | `/contact/` |
| 14 | `/sel-checkout` | `/` |
| 15 | `/store` | `/` |
| 16 | `/surestart` | `/` |
| 17 | `/vibe-lab` | `/for-students/` |
| 18 | `/vibe-lab-sneak-peek` | `/for-students/` |

---

## Validation Results

- ✅ **Duplicate sources:** None
- ✅ **Redirect chains:** None (all point to final destinations)
- ✅ **Redirect loops:** None
- ✅ **Invalid targets:** None (all destinations in sitemap)

---

## Conclusion

All 18 redirects are valid and ready for production deployment.
