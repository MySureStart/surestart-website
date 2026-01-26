# Legacy robots.txt Summary

**Source:** `legacy_robots.txt` (Squarespace)  
**Domain:** mysurestart.com  
**Analyzed:** January 20, 2026

---

## Sitemap Reference

```
Sitemap: https://mysurestart.com/sitemap.xml
```

---

## AI Bot Blocking

The legacy Squarespace robots.txt blocks 25+ AI training/scraping bots:

| Bot | Company |
|-----|---------|
| AI2Bot, Ai2Bot-Dolma | Allen Institute for AI |
| anthropic-ai, ClaudeBot | Anthropic |
| GPTBot, ChatGPT-User | OpenAI |
| Google-Extended, GoogleOther | Google AI |
| Amazonbot | Amazon |
| Bytespider | ByteDance/TikTok |
| CCBot | Common Crawl |
| cohere-ai, cohere-training-data-crawler | Cohere |
| DuckAssistBot | DuckDuckGo |
| FacebookBot, Meta-ExternalAgent | Meta |
| Applebot-Extended | Apple |
| TikTokSpider | TikTok |
| YouBot | You.com |
| Quora-Bot | Quora |
| img2dataset | Image scraper |
| omgili, omgilibot | Omgili |
| aiHitBot | aiHit |
| MyCentralAIScraperBot | MyCentral |
| AdsBot-Google* | Google Ads |

---

## Disallow Rules

### Path-Based Disallows

| Path | Purpose |
|------|---------|
| `/config` | Squarespace configuration |
| `/search` | Search results pages |
| `/account$` | Account page (exact match) |
| `/account/` | Account subpages |
| `/commerce/digital-download/` | Digital downloads |
| `/api/` | API endpoints |
| `/static/` | Static assets |

**Exception:** `Allow: /api/ui-extensions/`

### Query Parameter Disallows

Blocks crawling of URLs with these parameters:

| Parameter | Purpose |
|-----------|---------|
| `?author=` / `&author=` | Author filter |
| `?tag=` / `&tag=` | Tag filter |
| `?month=` / `&month=` | Month filter |
| `?view=` / `&view=` | View mode |
| `?format=json` | JSON format |
| `?format=page-context` | Page context format |
| `?format=main-content` | Main content format |
| `?format=json-pretty` | Pretty JSON format |
| `?format=ical` | iCal format |
| `?reversePaginate=` | Reverse pagination |

---

## Notable Crawl Directives

1. **AI Training Opt-Out:** Comprehensive blocking of AI training crawlers (Anthropic, OpenAI, Google, Meta, etc.)

2. **Squarespace-Specific:** Rules target Squarespace platform paths (`/config`, `/api/`, `/static/`)

3. **Format Parameters:** Blocks JSON/API-style access via query parameters to prevent data scraping

4. **No Crawl-Delay:** No crawl rate limiting specified

5. **Permissive Otherwise:** Default `User-agent: *` allows standard search engine crawling

---

## Implications for Migration

| Consideration | Action |
|---------------|--------|
| AI bot blocking | **Decide:** Keep or remove AI bot rules in new robots.txt |
| Squarespace paths | **Remove:** `/config`, `/commerce` rules not needed on static site |
| Query parameters | **Review:** May not apply to static HTML site |
| Sitemap reference | **Update:** Already pointing to mysurestart.org in new robots.txt |
