/**
 * Generate sitemap.xml for SureStart website
 * 
 * Usage: 
 *   node scripts/generate-sitemap.js                              # Uses {{BASE_URL}} placeholder
 *   BASE_URL=https://mysurestart.com node scripts/generate-sitemap.js  # Uses actual domain
 * 
 * npm scripts:
 *   npm run seo:sitemap       # Development (placeholder)
 *   npm run seo:sitemap:prod  # Production (actual domain)
 */

const fs = require('fs');
const path = require('path');

// Get BASE_URL from environment, normalize (remove trailing slash), or fall back to placeholder
const rawBaseUrl = process.env.BASE_URL || '{{BASE_URL}}';
const BASE_URL = rawBaseUrl.replace(/\/+$/, '');

// Public pages configuration (folder-based URLs)
// Excludes: 403, 404, 500, 503 error pages
const pages = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/about/', priority: '0.8', changefreq: 'monthly' },
  { path: '/contact/', priority: '0.8', changefreq: 'monthly' },
  { path: '/for-universities/', priority: '0.9', changefreq: 'weekly' },
  { path: '/for-students/', priority: '0.9', changefreq: 'weekly' },
  { path: '/k12/', priority: '0.9', changefreq: 'weekly' },
  { path: '/impact-stories/', priority: '0.7', changefreq: 'monthly' },
  { path: '/blog/', priority: '0.7', changefreq: 'weekly' },
  // Individual blog posts. Hand-listed while the site uses mock data.
  // TODO(WordPress): once wired to the live WP REST API, replace these
  // with a build-time fetch of `/wp/v2/posts?per_page=100&_fields=slug,modified`
  // and emit one <url> per published post.
  { path: '/blog/best-practices-for-building-a-strong-ai-policy/', priority: '0.6', changefreq: 'monthly' },
  { path: '/blog/goal-setting-strategies-6-frameworks-for-achieving-goals/', priority: '0.6', changefreq: 'monthly' },
  { path: '/blog/vibe-coding-why-prompt-to-prototype-is-the-next-ai-fluency/', priority: '0.6', changefreq: 'monthly' }
];

const today = new Date().toISOString().split('T')[0];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${BASE_URL}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

const outputPath = path.join(__dirname, '..', 'sitemap.xml');
fs.writeFileSync(outputPath, sitemap);

console.log('✅ sitemap.xml generated');
console.log(`   - ${pages.length} URLs included`);
console.log(`   - Last modified: ${today}`);
console.log(`   - Base URL: ${BASE_URL}`);
console.log(`   - Output: ${outputPath}`);

if (BASE_URL === '{{BASE_URL}}') {
  console.log('');
  console.log('⚠️  Warning: Using placeholder {{BASE_URL}}. Set BASE_URL env var for production.');
}
