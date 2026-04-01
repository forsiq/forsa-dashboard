#!/usr/bin/env node
/**
 * template-sync.cjs
 *
 * Pull latest changes from the ZoneVast template upstream.
 * Run this to update your project with the latest template changes.
 *
 * Usage:
 *   node scripts/template-sync.cjs [prefix]
 *
 * Example:
 *   node scripts/template-sync.cjs
 *   node scripts/template-sync.cjs template
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const ANSI = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${ANSI[color]}${message}${ANSI.reset}`);
}

function error(message) {
  log(`ERROR: ${message}`, 'red');
  process.exit(1);
}

// Parse arguments
const args = process.argv.slice(2);
const prefix = args[0] || 'template';
const branch = args[1] || 'main';
const remoteName = 'zonevast-template';

// Check if we're in a git repo
try {
  execSync('git rev-parse --git-dir', { stdio: 'ignore' });
} catch {
  error('Not a git repository.');
}

// Check if prefix directory exists
if (!existsSync(resolve(prefix))) {
  error(`Template directory "${prefix}" not found. Run "npm run template:init" first.`);
}

// Check for uncommitted changes
try {
  const status = execSync('git status --porcelain').toString();
  if (status.trim()) {
    log('\nWARNING: You have uncommitted changes:', 'yellow');
    log(status, 'reset');
    error('Please commit or stash your changes before syncing template.');
  }
} catch {
  // Ignore
}

// Get current template version
let currentVersion = 'unknown';
const templateConfigPath = resolve(prefix, 'template.config.json');
if (existsSync(templateConfigPath)) {
  try {
    const config = JSON.parse(readFileSync(templateConfigPath, 'utf-8'));
    currentVersion = config.template?.version || 'unknown';
  } catch {
    // Ignore
  }
}

log('\n' + '='.repeat(60), 'blue');
log('ZoneVast Template Sync', 'cyan');
log('='.repeat(60), 'blue');
log(`Current template version: ${currentVersion}`, 'reset');
log(`Prefix: ${prefix}`, 'reset');
log(`Remote: ${remoteName}/${branch}`, 'reset');

// Fetch from remote
log(`\n→ Fetching from ${remoteName}...`, 'cyan');
try {
  execSync(`git fetch ${remoteName}`, { stdio: 'inherit' });
  log('✓ Fetched successfully', 'green');
} catch (err) {
  error(`Failed to fetch: ${err.message}`);
}

// Check if there are updates
try {
  const localRef = execSync(`git rev-parse ${remoteName}/${branch}`).toString().trim();
  const localSubtree = execSync(`git log --pretty=format:%H -1 --grep="Split" ${prefix} 2>/dev/null || echo "none"`).toString().trim();

  if (localSubtree !== 'none') {
    const ahead = execSync(`git log ${localSubtree}..${remoteName}/${branch} --oneline | wc -l`).toString().trim();
    if (ahead === '0') {
      log('\n✓ Already up to date!', 'green');
      process.exit(0);
    }
  }
} catch {
  // Continue anyway
}

// Pull subtree updates
log(`\n→ Pulling subtree updates...`, 'cyan');
log('This may take a moment...', 'reset');

try {
  execSync(
    `git subtree pull --prefix=${prefix} ${remoteName} ${branch} --squash`,
    { stdio: 'inherit' }
  );
  log('✓ Subtree updated successfully', 'green');
} catch (err) {
  if (err.message.includes('merge conflict')) {
    log('\n⚠ Merge conflicts detected!', 'yellow');
    log('\nTo resolve conflicts:', 'cyan');
    log('  1. Review conflicts in: ' + prefix, 'reset');
    log('  2. Resolve each conflict manually', 'reset');
    log('  3. git add <resolved-files>', 'reset');
    log('  4. git commit', 'reset');
    log('\nTIP: Files in template/ should generally be kept as-is.', 'yellow');
    log('      Your custom code belongs in src/custom/', 'reset');
    process.exit(1);
  }
  error(`Failed to pull subtree: ${err.message}`);
}

// Get new version
let newVersion = 'unknown';
if (existsSync(templateConfigPath)) {
  try {
    const config = JSON.parse(readFileSync(templateConfigPath, 'utf-8'));
    newVersion = config.template?.version || 'unknown';
  } catch {
    // Ignore
  }
}

// Success
log('\n' + '='.repeat(60), 'blue');
log('Template sync complete!', 'green');
log('='.repeat(60), 'blue');
if (currentVersion !== newVersion && newVersion !== 'unknown') {
  log(`Updated: v${currentVersion} → v${newVersion}`, 'green');
}
log('\nRecommended:', 'cyan');
log('  1. Review the changes: git log --oneline -10', 'reset');
log('  2. Run: npm install', 'reset');
log('  3. Test your app: npm run dev', 'reset');
log('  4. Commit the update: git add . && git commit -m "chore: sync template v' + newVersion + '"', 'reset');
log('='.repeat(60) + '\n', 'blue');
