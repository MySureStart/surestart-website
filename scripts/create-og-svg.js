const fs = require('fs');
const path = require('path');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <rect width="1200" height="630" fill="#1a1a2e"/>
  <text x="600" y="280" font-family="Arial, sans-serif" font-size="96" font-weight="bold" fill="#ffffff" text-anchor="middle">SureStart</text>
  <text x="600" y="380" font-family="Arial, sans-serif" font-size="36" fill="#b8b8d0" text-anchor="middle">AI education for schools and students</text>
</svg>`;

const outputPath = path.join(__dirname, '..', 'assets', 'images', 'og', 'default.svg');
fs.writeFileSync(outputPath, svg);
console.log('✅ OG image created:', outputPath);
