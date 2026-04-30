# SEO Snippet Fixes — Handoff & Next Steps

**Date:** 2025-04-24
**Issue:** Google search results for mysurestart.com pages are showing poor‑quality snippets — e.g. Airtable form field labels ("Name. First Name (required). Last Name (required). Email (required) …"), "Other. Share what you're interested in contacting …", a truncated "huge advocate for the next generation of tech leaders." Dr …" testimonial on `/about/`, and a stale `/for-companies` result that no longer exists.

This document explains what was fixed automatically and what a human still needs to do.

---

## 1. Root cause

Google does **not** always use the `<meta name="description">` tag. When the on‑page visible text doesn't mirror the meta description, Google generates its own snippet from whatever text it deems most relevant on the page. In our case it was picking up:

| Page | What Google grabbed | Why |
|---|---|---|
| `/contact/` | "Other. Share what you're interested in contacting …" | Airtable form field labels inside the embedded iframe |
| `/for-universities/` | "Name. First Name (required). Last Name (required)…" | Same Airtable-style form text (likely from a popup form or Google's cached older version) |
| `/for-companies/` | "Name. First Name (required)…" | **Page no longer exists** — this is a cached snippet of an old URL |
| `/about/` | "… huge advocate for the next generation of tech leaders." Dr …" | Text from an older version of the page (no longer in the repo — Google's cache is stale) |
| `/vibe-lab/` | "… prototype at The Social Enterprise Symposium. *No …" | On-page text from the "Showcase:" bullet + the "*No prior coding experience required!*" copy directly below it |

---

## 2. What was fixed in this commit (automated)

### 2.1 `data-nosnippet` wrappers
Google respects `data-nosnippet` as a signal to exclude a block from snippet generation ([docs](https://developers.google.com/search/docs/crawling-indexing/special-tags#data-nosnippet-attr)). Wrappers were added around:

| File | Block | Purpose |
|---|---|---|
| `contact/index.html` | `<div class="airtable-form-container">` | Blocks Airtable form field labels from snippets |
| `for-students/index.html` | `#notify-popup-overlay` and `#waitlist-popup-overlay` | Blocks popup Airtable form labels |
| `vibe-lab/index.html` | The "Showcase:" detail item | Blocks "Pitch your prototype at The Social Enterprise Symposium" from being chosen as the snippet |

### 2.2 `max-snippet` robots meta upgrade
The `<meta name="robots">` tag was upgraded from `index, follow` to `index, follow, max-snippet:160, max-image-preview:large` on these 8 pages:

- `index.html`
- `about/index.html`
- `contact/index.html`
- `for-universities/index.html`
- `for-students/index.html`
- `vibe-lab/index.html`
- `k12/index.html`
- `impact-stories/index.html`

`max-snippet:160` caps Google's auto‑generated snippet length at ~160 characters (same length as our meta descriptions), which strongly nudges Google toward using the meta description instead of improvising.

### 2.3 `/for-companies/` stale result
Already handled — `seo/redirects.final.csv` contains:
```
/for-companies,/,301,"Companies page retired - redirect to home"
```
No code change needed, but the stale snippet in Google will persist until Google re‑crawls. See §4 for the manual GSC steps.

---

## 3. What a HUMAN still needs to do

> The single biggest remaining lever for fixing snippets is **making the visible on-page copy mirror the meta description**. Pick EITHER (a) rewrite the hero subtitle to echo the meta description, OR (b) rewrite the meta description to echo the hero subtitle. Don't touch both. Pick one per page.

### 3.1 Per-page reconciliation table

| Page | Current `<meta name="description">` | Current hero subtitle (visible `<p>` under H1) | Recommendation |
|---|---|---|---|
| `/` | "SureStart delivers AI education for middle and high school students through mentorship, real-world projects, and a strong foundation in AI literacy and responsible AI." | "Applied AI programs for grades 6 through college. Learn from top tech university mentors, solve real-world problems, and emerge ready to lead with confidence." | **These differ in phrasing.** Recommend: rewrite meta to match subtitle OR add a short lead paragraph right after `<h1>` that echoes the meta. |
| `/about/` | "Learn about SureStart's mission to deliver responsible AI education—combining ethics, mentorship, and real-world learning to prepare students for a rapidly changing future." | "Empowering the next generation of AI leaders through hands-on learning and mentorship." | **Differ.** Subtitle is shorter/more marketing. Recommend: rewrite the subtitle to something like: *"SureStart's mission is to deliver responsible AI education — combining ethics, mentorship, and real-world learning for a rapidly changing future."* |
| `/contact/` | "Contact SureStart to learn how our AI education programs support schools, families, and students with ethical, mentorship-driven learning experiences." | "Interested in learning more about the SureStart program? Get in touch" | **Differ significantly.** Recommend: rewrite the subtitle to: *"Contact SureStart to learn how our AI programs support schools, families, and students with ethical, mentorship-driven learning."* |
| `/for-universities/` | "SureStart partners with universities to strengthen career readiness through applied AI education, mentorship, and real-world, interdisciplinary learning experiences." | "SureStart partners with leading universities to equip students with AI fluency and durable skills for an AI-driven future." | **Close but not matching.** Recommend: pick one phrasing and use it in both. Suggest: update meta to match the subtitle (the subtitle is punchier). |
| `/for-students/` | "Students develop AI literacy, confidence, and career-ready skills through mentorship, hands-on projects, and responsible AI learning with SureStart." | "AI is transforming careers. Build the skills needed to help you grow, adapt, and stay ahead." | **Differ.** Recommend: rewrite subtitle to: *"Build AI literacy, confidence, and career-ready skills through mentorship, hands-on projects, and responsible AI learning."* |
| `/vibe-lab/` | "Vibe Lab is SureStart's innovation space where students build AI literacy through creative projects, experimentation, and responsible use of emerging technologies." | "Turn your ideas into apps that make a difference." | **Differ significantly.** Recommend: add a short paragraph after the subtitle (or rewrite the subtitle) that echoes the meta, e.g.: *"SureStart's innovation space where students build AI literacy through creative projects, experimentation, and responsible use of emerging technologies."* |
| `/k12/` | "SureStart brings AI into the classroom for K–12 schools through mentorship, turnkey curriculum, and ethical, hands-on learning experiences that prepare students for the future." | "We know adopting new programs requires alignment with school goals. SureStart does this by equipping teachers, enriching curriculum, and adding value across the school community." | **Differ.** Recommend: update meta to include "alignment with school goals" language, OR rewrite subtitle to lead with "SureStart brings AI into K-12 classrooms through mentorship, turnkey curriculum, and ethical hands-on learning." |
| `/impact-stories/` | "Discover how SureStart students are gaining confidence, building real AI projects, and achieving top university admissions and career opportunities." | "SureStart changing the lives of students all over the world." | **Differ + grammar bug.** The subtitle is grammatically broken ("SureStart changing …" → should be "SureStart is changing …"). Recommend: rewrite subtitle to: *"Discover how SureStart students are gaining confidence, building real AI projects, and winning top university admissions."* — fixes both the grammar AND the snippet mismatch in one edit. |

### 3.2 Google Search Console (GSC) actions

After the code fixes above are deployed to production:

1. **Verify property** (if not already): https://search.google.com/search-console → property `mysurestart.com`
2. For each fixed URL, use **URL Inspection** → **Request Indexing** to expedite re-crawl:
   - `https://mysurestart.com/`
   - `https://mysurestart.com/about/`
   - `https://mysurestart.com/contact/`
   - `https://mysurestart.com/for-universities/`
   - `https://mysurestart.com/for-students/`
   - `https://mysurestart.com/vibe-lab/`
   - `https://mysurestart.com/k12/`
   - `https://mysurestart.com/impact-stories/`
3. **Remove stale `/for-companies` snippet:** GSC → **Removals** → **Outdated content** → paste `https://mysurestart.com/for-companies` or `https://mysurestart.com/for-companies/`. This forces Google to drop the cached snippet.
4. Re-check `site:mysurestart.com` results in Google after **7–14 days**. Expected result: each page's snippet should now match (or be very close to) the meta description.

### 3.3 Verification checklist

- [ ] After deploy, open View Source on each of the 8 pages and confirm `max-snippet:160, max-image-preview:large` appears in the robots meta.
- [ ] Confirm `data-nosnippet` is present on the contact Airtable wrapper, on both for-students popups, and on the vibe-lab "Showcase:" detail item.
- [ ] Request Indexing for all 8 URLs in GSC.
- [ ] Submit Outdated-content removal for `/for-companies` and `/for-companies/`.
- [ ] Wait 7–14 days, re-run `site:mysurestart.com` in Google, confirm snippets now match meta descriptions.
- [ ] For each page where you chose to reconcile subtitle↔meta, confirm the visible first paragraph now contains the same core phrasing as the meta description.

---

## 4. Technical notes

### Why `data-nosnippet` and not `nofollow`/`noindex`?
- `noindex` would remove the iframe/block from Google's index entirely. We don't want that — the forms are functional and the page should still be indexed.
- `nofollow` only affects link equity, not snippet selection.
- `data-nosnippet` is the exact tool designed for this: "don't use this block's text in auto-generated search snippets."

### About the Airtable iframes
The Airtable embed URL itself is a third-party page on `airtable.com`. Google crawls and indexes it separately. Our `data-nosnippet` wrapper only protects the snippet that appears **under our domain's result**. The Airtable page itself is Airtable's problem, not ours.

### About the "advocate for the next generation of tech leaders" snippet on /about/
That exact phrase **does not exist in the current `about/index.html`**. It is either:
- Legacy content from an older deploy that Google has cached, OR
- A synthesized phrase Google composed from related bios (multiple team-member bios reference "next generation" and "leaders")

Either way, the combination of (a) the `max-snippet:160` cap + (b) reconciling subtitle ↔ meta per §3.1 should replace it once Google re-crawls.

### Optional follow-ups (nice-to-have, not required)
- Add JSON-LD `Organization` + `WebPage` schema to each page with a `description` property matching the meta description. This gives Google a structured signal.
- Add an `og:image:alt` property to each page's Open Graph tags.
- Consider adding a short static intro paragraph (2 sentences, visible) at the top of `/contact/` and `/for-universities/` above the form embeds — this gives Google clean, snippet-worthy copy to choose from even without `data-nosnippet`.

---

## 5. Files changed in this commit

- `contact/index.html` — robots meta + `data-nosnippet` on Airtable wrapper
- `vibe-lab/index.html` — robots meta + `data-nosnippet` on Showcase detail item
- `for-students/index.html` — robots meta + `data-nosnippet` on both popup overlays
- `for-universities/index.html` — robots meta only
- `about/index.html` — robots meta only
- `index.html` — robots meta only
- `k12/index.html` — robots meta only
- `impact-stories/index.html` — robots meta only
- `docs/seo-snippet-fixes.md` — this file (new)
