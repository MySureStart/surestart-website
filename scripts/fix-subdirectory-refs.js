#!/usr/bin/env node
/**
 * Fix relative paths in subdirectory index.html files
 */
const fs = require('fs');

const files = [
  'for-students/index.html',
  'for-universities/index.html', 
  'impact-stories/index.html',
  'k12/index.html'
];

files.forEach(f => {
  console.log(`\nProcessing ${f}...`);
  let c = fs.readFileSync(f, 'utf8');
  
  // Convert relative asset paths to root-relative
  c = c.split('href="assets/').join('href="/assets/');
  c = c.split("href='assets/").join("href='/assets/");
  c = c.split('src="assets/').join('src="/assets/');
  c = c.split("src='assets/").join("src='/assets/");
  
  // Fix inline style url() references
  c = c.split("url('assets/").join("url('/assets/");
  c = c.split('url("assets/').join('url("/assets/');
  c = c.split('url(assets/').join('url(/assets/');
  
  // Convert page references to new folder URLs
  c = c.split('href="index.html"').join('href="/"');
  c = c.split('href="k12.html"').join('href="/k12/"');
  c = c.split('href="higher-ed.html"').join('href="/for-universities/"');
  c = c.split('href="students.html"').join('href="/for-students/"');
  c = c.split('href="about-us.html"').join('href="/about/"');
  c = c.split('href="about-us.html#').join('href="/about/#');
  c = c.split('href="impact-stories.html"').join('href="/impact-stories/"');
  c = c.split('href="contact-us.html"').join('href="/contact/"');
  c = c.split('href="contact-us.html?').join('href="/contact/?');
  c = c.split('href="vibe-lab.html"').join('href="/vibe-lab/"');
  
  fs.writeFileSync(f, c);
  console.log(`  Fixed: ${f}`);
});

console.log('\nDone!');
