#!/usr/bin/env node
/**
 * template-init.cjs
 *
 * Initialize a Git subtree from the ZoneVast template repository.
 * Run this in a NEW project directory to set up the template as a subtree.
 *
 * Usage:
 *   node scripts/template-init.cjs <template-url> [prefix]
 *
 * Example:
 *   node scripts/template-init.cjs git@github.com:zonevast/zonevast-template.git
 *   node scripts/template-init.cjs git@github.com:zonevast/zonevast-template.git template
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ANSI = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
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
const templateUrl = args[0];
const prefix = args[1] || 'template';
const branch = args[2] || 'main';

if (!templateUrl) {
  error('Template URL is required.\nUsage: node template-init.cjs <template-url> [prefix] [branch]\nExample: node template-init.cjs git@github.com:zonevast/zonevast-template.git');
}

// Check if we're in a git repo
try {
  execSync('git rev-parse --git-dir', { stdio: 'ignore' });
  log('✓ Git repository detected', 'green');
} catch {
  error('Not a git repository. Run "git init" first.');
}

// Check if prefix directory already exists
if (existsSync(resolve(prefix))) {
  error(`Directory "${prefix}" already exists. Remove it first or use a different prefix.`);
}

// Add remote if it doesn't exist
const remoteName = 'zonevast-template';
try {
  const remotes = execSync('git remote').toString();
  if (!remotes.includes(remoteName)) {
    log(`\n→ Adding remote: ${remoteName}`, 'cyan');
    execSync(`git remote add ${remoteName} ${templateUrl}`, { stdio: 'inherit' });
    log(`✓ Remote added`, 'green');
  } else {
    log(`✓ Remote "${remoteName}" already exists`, 'green');
  }
} catch (err) {
  error(`Failed to add remote: ${err.message}`);
}

// Fetch from remote
log(`\n→ Fetching from ${templateUrl}...`, 'cyan');
try {
  execSync(`git fetch ${remoteName}`, { stdio: 'inherit' });
  log('✓ Fetched successfully', 'green');
} catch (err) {
  error(`Failed to fetch: ${err.message}`);
}

// Add subtree
log(`\n→ Adding subtree with prefix: ${prefix}`, 'cyan');
try {
  execSync(
    `git subtree add --prefix=${prefix} ${remoteName} ${branch} --squash`,
    { stdio: 'inherit' }
  );
  log('✓ Subtree added successfully', 'green');
} catch (err) {
  error(`Failed to add subtree: ${err.message}`);
}

// Create initial project structure
log('\n→ Setting up project structure...', 'cyan');

const projectRoot = resolve(process.cwd(), '..');
const customDir = resolve(projectRoot, 'src', 'custom');

// Create custom directory if it doesn't exist
if (!existsSync(customDir)) {
  execSync(`mkdir -p ${customDir}/features`, { stdio: 'ignore' });
  writeFileSync(
    resolve(customDir, 'README.md'),
    '# Custom Features\n\nThis directory contains your custom overrides and features.\n\nFiles here override template components when configured in zvs.config.json.\n'
  );
  log('✓ Created src/custom/ directory', 'green');
}

// Success message
log('\n' + '='.repeat(60), 'blue');
log('Template initialization complete!', 'green');
log('='.repeat(60), 'blue');
log('\nNext steps:', 'cyan');
log('  1. Review the template files in: ' + prefix, 'reset');
log('  2. Customize zvs.config.json for your project', 'reset');
log('  3. Add your custom features to src/custom/', 'reset');
log('  4. Run: npm install', 'reset');
log('  5. Run: npm run dev', 'reset');
log('\nTo sync future template updates:', 'yellow');
log(`  npm run template:sync`, 'reset');
log('='.repeat(60) + '\n', 'blue');
