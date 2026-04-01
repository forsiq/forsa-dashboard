#!/usr/bin/env node
/**
 * template-status.cjs
 *
 * Show sync status and pending template updates.
 *
 * Usage:
 *   node scripts/template-status.cjs
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
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
  dim: '\x1b[2m',
};

function log(message, color = 'reset') {
  console.log(`${ANSI[color]}${message}${ANSI.reset}`);
}

// Parse arguments
const prefix = 'template';
const remoteName = 'zonevast-template';
const branch = 'main';

// Check if we're in a git repo
try {
  execSync('git rev-parse --git-dir', { stdio: 'ignore' });
} catch {
  error('Not a git repository.');
}

log('\n' + '='.repeat(60), 'blue');
log('ZoneVast Template Sync Status', 'cyan');
log('='.repeat(60), 'blue');

// Check if remote exists
let hasRemote = false;
try {
  const remotes = execSync('git remote').toString();
  hasRemote = remotes.includes(remoteName);
} catch {
  // Ignore
}

if (hasRemote) {
  log(`\n✓ Remote "${remoteName}" configured`, 'green');
  try {
    const remoteUrl = execSync(`git remote get-url ${remoteName}`).toString().trim();
    log(`  URL: ${remoteUrl}`, 'dim');
  } catch {
    // Ignore
  }
} else {
  log(`\n✗ No remote "${remoteName}" found`, 'red');
  log('  Run: npm run template:init <url>', 'yellow');
}

// Check if prefix exists
if (existsSync(resolve(prefix))) {
  log(`\n✓ Template directory exists: ${prefix}/`, 'green');
} else {
  log(`\n✗ Template directory not found: ${prefix}/`, 'red');
  log('  Run: npm run template:init', 'yellow');
  process.exit(1);
}

// Get current version
const templateConfigPath = resolve(prefix, 'template.config.json');
let currentVersion = 'unknown';
if (existsSync(templateConfigPath)) {
  try {
    const config = JSON.parse(readFileSync(templateConfigPath, 'utf-8'));
    currentVersion = config.template?.version || 'unknown';
  } catch {
    // Ignore
  }
}
log(`\nCurrent Version: ${currentVersion}`, 'cyan');

// Check for pending updates
if (hasRemote) {
  log('\n→ Checking for updates...', 'cyan');
  try {
    execSync(`git fetch ${remoteName}`, { stdio: 'ignore' });

    // Get latest tag
    const latestTag = execSync(`git tag --sort=-v:refname | head -1`).toString().trim();

    if (latestTag) {
      log(`Latest Available: ${latestTag}`, 'cyan');

      // Compare commits
      try {
        const localCommit = execSync(`git rev-parse ${remoteName}/${branch}`).toString().trim();
        const subtreeCommit = execSync(`git log --pretty=format:%H -1 --grep="Split" ${prefix} 2>/dev/null || echo "none"`).toString().trim();

        if (subtreeCommit !== 'none') {
          const ahead = execSync(`git log ${subtreeCommit}..${remoteName}/${branch} --oneline 2>/dev/null | wc -l`).toString().trim();

          if (parseInt(ahead) > 0) {
            log(`\n⚠ ${ahead} new commit(s) available`, 'yellow');
            log('→ Run: npm run template:sync', 'cyan');
          } else {
            log('\n✓ Already up to date', 'green');
          }
        }
      } catch {
        // Ignore
      }
    }
  } catch (err) {
    log(`Could not check for updates: ${err.message}`, 'dim');
  }
}

// Show recent template commits
log('\n→ Recent template commits:', 'cyan');
try {
  const commits = execSync(`git log --oneline -5 ${prefix} 2>/dev/null || echo "no commits"`).toString().trim();
  if (commits !== 'no commits') {
    commits.split('\n').forEach(commit => {
      log(`  ${commit}`, 'dim');
    });
  }
} catch {
  // Ignore
}

log('\n' + '='.repeat(60) + '\n', 'blue');
