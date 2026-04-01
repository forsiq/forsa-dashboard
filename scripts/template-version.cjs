#!/usr/bin/env node
/**
 * template-version.cjs
 *
 * Check template version information.
 *
 * Usage:
 *   node scripts/template-version.cjs
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { execSync } from 'child_process';
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

// Get template version from config
function getTemplateVersion(configPath) {
  if (!existsSync(configPath)) {
    return null;
  }
  try {
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    return config.template?.version || null;
  } catch {
    return null;
  }
}

// Get latest version from remote
function getLatestVersion() {
  try {
    const tags = execSync('git tag --sort=-v:refname | head -5').toString().trim();
    return tags.split('\n')[0] || null;
  } catch {
    return null;
  }
}

// Get last update date
function getLastUpdate(prefix) {
  try {
    const date = execSync(`git log -1 --format=%cd --date=short ${prefix}`).toString().trim();
    return date;
  } catch {
    return null;
  }
}

// Main
const projectRoot = resolve(__dirname, '..');
const prefix = 'template';
const templateConfigPath = resolve(projectRoot, prefix, 'template.config.json');
const localConfigPath = resolve(projectRoot, 'zvs.config.json');

log('\n' + '='.repeat(60), 'blue');
log('ZoneVast Template Version Info', 'cyan');
log('='.repeat(60), 'blue');

// Template version
const templateVersion = getTemplateVersion(templateConfigPath);
log(`\nTemplate Version:`, 'cyan');
if (templateVersion) {
  log(`  v${templateVersion}`, 'green');
} else {
  log('  unknown (template directory not found)', 'dim');
}

// Project's tracked template version
let projectTemplateVersion = null;
if (existsSync(localConfigPath)) {
  try {
    const localConfig = JSON.parse(readFileSync(localConfigPath, 'utf-8'));
    projectTemplateVersion = localConfig.template?.version || null;
  } catch {
    // Ignore
  }
}
if (projectTemplateVersion) {
  log(`\nTracked in Project:`, 'cyan');
  log(`  v${projectTemplateVersion}`, 'reset');
}

// Latest available version
const latestVersion = getLatestVersion();
if (latestVersion) {
  log(`\nLatest Available:`, 'cyan');
  log(`  ${latestVersion}`, 'yellow');
}

// Last sync date
const lastUpdate = getLastUpdate(prefix);
if (lastUpdate) {
  log(`\nLast Sync:`, 'cyan');
  log(`  ${lastUpdate}`, 'reset');
}

// Compatibility check
if (templateVersion && projectTemplateVersion) {
  log('\n' + '-'.repeat(60), 'blue');
  if (templateVersion === projectTemplateVersion) {
    log('✓ Project is in sync with template', 'green');
  } else {
    log('⚠ Template version differs from tracked version', 'yellow');
    log(`  Template: v${templateVersion}`, 'reset');
    log(`  Tracked:  v${projectTemplateVersion}`, 'reset');
    log('\n→ Run: npm run template:sync', 'cyan');
  }
}

log('\n' + '='.repeat(60) + '\n', 'blue');
