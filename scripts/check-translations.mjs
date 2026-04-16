#!/usr/bin/env node
/**
 * Lists t('...') keys used in src/ that are missing from the English locale bundle.
 * Run: node scripts/check-translations.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.next') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(tsx|ts|jsx|js)$/.test(e.name)) acc.push(p);
  }
  return acc;
}

function loadLocaleKeys(localeDir) {
  const keys = new Set();
  const keyRe = /["']([a-zA-Z0-9_.@-]+(?:\.[a-zA-Z0-9_.@-]+)+)["']\s*:/g;
  for (const lf of fs.readdirSync(localeDir).filter((x) => x.endsWith('.ts') && x !== 'index.ts')) {
    const c = fs.readFileSync(path.join(localeDir, lf), 'utf8');
    let m;
    while ((m = keyRe.exec(c))) keys.add(m[1]);
  }
  return keys;
}

const srcDir = path.join(root, 'src');
const files = walk(srcDir);
const used = new Set();
const staticRe = /\bt\(\s*['"]([^'"]+)['"]/g;
for (const f of files) {
  const c = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = staticRe.exec(c))) used.add(m[1]);
}

const enDir = path.join(root, 'src/core/translations/locales/en');
const enKeys = loadLocaleKeys(enDir);
const missing = [...used].filter((k) => !enKeys.has(k)).sort();

if (missing.length === 0) {
  console.log('OK: no keys used in code are missing from English locales.');
  process.exit(0);
}

console.error(`Missing ${missing.length} key(s) in English locales:\n`);
for (const k of missing) console.error(`  ${k}`);
process.exit(1);
