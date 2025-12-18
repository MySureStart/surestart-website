#!/usr/bin/env node
/**
 * SEO Pre-launch Checks
 * 
 * Runs all SEO validation checks in sequence before deployment.
 * 
 * Steps:
 * 1. Build the site (HTML processing, sitemap, robots.txt, redirects)
 * 2. Validate redirects configuration
 * 3. Start local server
 * 4. Run SEO smoke test
 * 5. Run link checker
 * 6. Stop server and report results
 * 
 * Usage:
 *   npm run seo:prelaunch
 *   npm run seo:prelaunch -- --production
 * 
 * Output:
 *   /dist/sitemap.xml
 *   /dist/robots.txt
 *   /dist/_redirects (or redirects.json)
 *   /dist/reports/link-check.csv
 */

const { spawn, execSync } = require('child_process');
const path = require('path');

const PORT = 8080;
const BASE_URL = `http://localhost:${PORT}`;

// Track results
const results = {
  build: { status: 'pending', duration: 0 },
  redirects: { status: 'pending', duration: 0 },
  smoke: { status: 'pending', duration: 0 },
  links: { status: 'pending', duration: 0 }
};

/**
 * Run a command and return promise
 */
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const isWindows = process.platform === 'win32';
    
    // Use shell on Windows for npm commands
    const spawnOptions = {
      stdio: 'inherit',
      shell: isWindows,
      ...options
    };
    
    const child = spawn(command, args, spawnOptions);
    
    child.on('close', (code) => {
      const duration = Date.now() - startTime;
      if (code === 0) {
        resolve({ success: true, duration });
      } else {
        reject({ success: false, code, duration });
      }
    });
    
    child.on('error', (err) => {
      reject({ success: false, error: err.message, duration: Date.now() - startTime });
    });
  });
}

/**
 * Start local server in background
 */
function startServer() {
  return new Promise((resolve, reject) => {
    console.log(`\n🌐 Starting local server on port ${PORT}...`);
    
    const isWindows = process.platform === 'win32';
    const npxCmd = isWindows ? 'npx.cmd' : 'npx';
    
    const server = spawn(npxCmd, ['serve', 'dist', '-l', PORT.toString(), '--no-clipboard'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: isWindows,
      detached: !isWindows
    });
    
    let started = false;
    
    server.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Accepting connections') || output.includes('Local:')) {
        if (!started) {
          started = true;
          console.log(`   Server running at ${BASE_URL}`);
          resolve(server);
        }
      }
    });
    
    server.stderr.on('data', (data) => {
      // Some servers output to stderr
      const output = data.toString();
      if (output.includes('Local:') || output.includes('listening')) {
        if (!started) {
          started = true;
          console.log(`   Server running at ${BASE_URL}`);
          resolve(server);
        }
      }
    });
    
    server.on('error', (err) => {
      reject(new Error(`Failed to start server: ${err.message}`));
    });
    
    // Timeout after 10 seconds
    setTimeout(() => {
      if (!started) {
        started = true;
        console.log(`   Server assumed running at ${BASE_URL}`);
        resolve(server);
      }
    }, 5000);
  });
}

/**
 * Stop the server
 */
function stopServer(server) {
  if (!server) return;
  
  console.log('\n🛑 Stopping local server...');
  
  const isWindows = process.platform === 'win32';
  
  if (isWindows) {
    // On Windows, kill the process tree
    try {
      execSync(`taskkill /pid ${server.pid} /T /F`, { stdio: 'ignore' });
    } catch (e) {
      // Process may already be dead
    }
  } else {
    // On Unix, kill the process group
    try {
      process.kill(-server.pid, 'SIGTERM');
    } catch (e) {
      server.kill('SIGTERM');
    }
  }
}

/**
 * Print summary
 */
function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('PRE-LAUNCH CHECK SUMMARY');
  console.log('='.repeat(60) + '\n');
  
  const checks = [
    { name: 'Build & Generate', key: 'build' },
    { name: 'Redirects Validation', key: 'redirects' },
    { name: 'SEO Smoke Test', key: 'smoke' },
    { name: 'Link Checker', key: 'links' }
  ];
  
  let allPassed = true;
  
  checks.forEach(check => {
    const result = results[check.key];
    const icon = result.status === 'passed' ? '✓' : result.status === 'failed' ? '❌' : '⏭️';
    const status = result.status.toUpperCase();
    const duration = result.duration ? ` (${(result.duration / 1000).toFixed(1)}s)` : '';
    
    console.log(`  ${icon} ${check.name}: ${status}${duration}`);
    
    if (result.status === 'failed') allPassed = false;
  });
  
  console.log('\n' + '-'.repeat(60));
  console.log('OUTPUT FILES:');
  console.log('-'.repeat(60));
  console.log('  /dist/sitemap.xml');
  console.log('  /dist/robots.txt');
  console.log('  /dist/_redirects');
  console.log('  /dist/reports/link-check.csv');
  console.log('');
  
  if (allPassed) {
    console.log('✅ All pre-launch checks PASSED\n');
    return 0;
  } else {
    console.log('❌ Pre-launch checks FAILED - fix issues before deploying\n');
    return 1;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 SEO Pre-launch Checks\n');
  console.log('='.repeat(60));
  console.log('');
  
  // Check for production flag
  const isProd = process.argv.includes('--production') || process.argv.includes('--prod');
  
  if (isProd) {
    process.env.NODE_ENV = 'production';
    process.env.SITE_ENV = 'production';
    console.log('Running in PRODUCTION mode\n');
  } else {
    console.log('Running in DEVELOPMENT mode (use --production for stricter checks)\n');
  }
  
  let server = null;
  let exitCode = 0;
  
  try {
    // Step 1: Build
    console.log('📦 Step 1/4: Building site...\n');
    try {
      const buildCmd = isProd ? 'npm run build:prod' : 'npm run build';
      const buildResult = await runCommand(buildCmd, [], { shell: true });
      results.build = { status: 'passed', duration: buildResult.duration };
      console.log('\n   ✓ Build complete\n');
    } catch (err) {
      results.build = { status: 'failed', duration: err.duration || 0 };
      console.error('\n   ❌ Build failed\n');
      throw new Error('Build failed');
    }
    
    // Step 2: Validate redirects
    console.log('🔀 Step 2/4: Validating redirects...\n');
    try {
      const redirectsResult = await runCommand('npm', ['run', 'seo:redirects:validate']);
      results.redirects = { status: 'passed', duration: redirectsResult.duration };
      console.log('\n   ✓ Redirects valid\n');
    } catch (err) {
      results.redirects = { status: 'failed', duration: err.duration || 0 };
      console.error('\n   ❌ Redirects validation failed\n');
      // Don't throw - continue with other checks
    }
    
    // Start server for remaining tests
    server = await startServer();
    
    // Wait a moment for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 3: SEO Smoke Test
    console.log('\n🔬 Step 3/4: Running SEO smoke test...\n');
    try {
      const smokeResult = await runCommand('npm', ['run', 'seo:smoke', '--', '--base-url', BASE_URL]);
      results.smoke = { status: 'passed', duration: smokeResult.duration };
    } catch (err) {
      results.smoke = { status: 'failed', duration: err.duration || 0 };
      console.error('\n   ❌ Smoke test failed\n');
    }
    
    // Step 4: Link Checker
    console.log('\n🔗 Step 4/4: Running link checker...\n');
    try {
      const linksResult = await runCommand('npm', ['run', 'seo:links', '--', '--base-url', BASE_URL]);
      results.links = { status: 'passed', duration: linksResult.duration };
    } catch (err) {
      results.links = { status: 'failed', duration: err.duration || 0 };
      console.error('\n   ❌ Link check failed\n');
    }
    
  } catch (error) {
    console.error(`\nFatal error: ${error.message}\n`);
  } finally {
    // Always stop server
    stopServer(server);
    
    // Print summary
    exitCode = printSummary();
  }
  
  process.exit(exitCode);
}

// Run
main();
