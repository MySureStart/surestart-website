/**
 * Generate robots.txt for SureStart website
 * 
 * Usage: 
 *   node scripts/generate-robots.js                                    # Development (Disallow all)
 *   SITE_ENV=production node scripts/generate-robots.js                # Production (Allow all, placeholder URL)
 *   SITE_ENV=production BASE_URL=https://mysurestart.org node scripts/generate-robots.js  # Production (actual domain)
 * 
 * npm scripts:
 *   npm run seo:robots       # Development (blocks crawlers)
 *   npm run seo:robots:prod  # Production (allows crawlers, actual domain)
 */

const fs = require('fs');
const path = require('path');

const env = process.env.SITE_ENV || 'development';

// Get BASE_URL from environment, normalize (remove trailing slash), or fall back to placeholder
const rawBaseUrl = process.env.BASE_URL || '{{BASE_URL}}';
const BASE_URL = rawBaseUrl.replace(/\/+$/, '');

let robots;

if (env === 'production') {
  robots = `# robots.txt - Production
# Generated: ${new Date().toISOString().split('T')[0]}

User-agent: *
Allow: /

# Sitemap location
Sitemap: ${BASE_URL}/sitemap.xml
`;
} else {
  robots = `# robots.txt - Non-Production (${env})
# Generated: ${new Date().toISOString().split('T')[0]}
# 
# WARNING: This robots.txt blocks all crawlers.
# For production, run: npm run seo:robots:prod

User-agent: *
Disallow: /
`;
}

const outputPath = path.join(__dirname, '..', 'robots.txt');
fs.writeFileSync(outputPath, robots);

console.log('✅ robots.txt generated');
console.log(`   - Environment: ${env}`);
console.log(`   - Crawling: ${env === 'production' ? 'ALLOWED' : 'BLOCKED'}`);
console.log(`   - Output: ${outputPath}`);

if (env === 'production') {
  console.log(`   - Base URL: ${BASE_URL}`);
}

if (env === 'production' && BASE_URL === '{{BASE_URL}}') {
  console.log('');
  console.log('⚠️  Warning: Using placeholder {{BASE_URL}}. Set BASE_URL env var for production.');
}
