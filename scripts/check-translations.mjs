#!/usr/bin/env node
/**
 * Lists t('...') keys used in src/ that are missing after merging
 * @yousef2001/core-ui locale fragments (regex scan) with src/translations/en.ts and ar.ts.
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

/** Keys defined as "key": in a translations object literal */
function loadKeysFromFile(filePath) {
  const keys = new Set();
  const keyRe = /["']([a-zA-Z0-9_.@-]+(?:\.[a-zA-Z0-9_.@-]+)+)["']\s*:/g;
  const c = fs.readFileSync(filePath, 'utf8');
  let m;
  while ((m = keyRe.exec(c))) keys.add(m[1]);
  return keys;
}

function loadKeysFromDir(localeDir) {
  const keys = new Set();
  if (!fs.existsSync(localeDir)) return keys;
  for (const e of fs.readdirSync(localeDir, { withFileTypes: true })) {
    if (!e.isFile() || !e.name.endsWith('.js')) continue;
    for (const k of loadKeysFromFile(path.join(localeDir, e.name))) keys.add(k);
  }
  return keys;
}

function mergeKeySets(...sets) {
  const out = new Set();
  for (const s of sets) for (const k of s) out.add(k);
  return out;
}

function main() {
  const srcDir = path.join(root, 'src');
  const files = walk(srcDir);
  const used = new Set();
  const staticRe = /\bt\(\s*['"]([^'"]+)['"]/g;
  for (const f of files) {
    const c = fs.readFileSync(f, 'utf8');
    let m;
    while ((m = staticRe.exec(c))) used.add(m[1]);
  }

  const translationsDir = path.join(root, 'src/translations');
  if (!fs.existsSync(translationsDir)) {
    console.error(`Expected translations at ${translationsDir}`);
    process.exit(1);
  }

  const coreRoot = path.join(root, 'node_modules/@yousef2001/core-ui/dist/translations/locales');
  const coreEnDir = path.join(coreRoot, 'en');
  const coreArDir = path.join(coreRoot, 'ar');

  const mergedEn = mergeKeySets(
    loadKeysFromDir(coreEnDir),
    loadKeysFromFile(path.join(translationsDir, 'en.ts')),
  );
  const mergedAr = mergeKeySets(
    loadKeysFromDir(coreArDir),
    loadKeysFromFile(path.join(translationsDir, 'ar.ts')),
  );

  const missingEn = [...used].filter((k) => !mergedEn.has(k)).sort();
  const missingAr = [...used].filter((k) => !mergedAr.has(k)).sort();

  const appEnKeys = loadKeysFromFile(path.join(translationsDir, 'en.ts'));
  const appArKeys = loadKeysFromFile(path.join(translationsDir, 'ar.ts'));
  const onlyInEn = [...appEnKeys].filter((k) => !appArKeys.has(k)).sort();
  const onlyInAr = [...appArKeys].filter((k) => !appEnKeys.has(k)).sort();

  let exit = 0;
  if (missingEn.length === 0) {
    console.log('OK: no static t(...) keys from src/ are missing from merged English bundles.');
  } else {
    exit = 1;
    console.error(`Missing ${missingEn.length} key(s) for English (core-ui locales + src/translations):\n`);
    for (const k of missingEn) console.error(`  ${k}`);
  }

  if (missingAr.length === 0) {
    console.log('OK: no static t(...) keys from src/ are missing from merged Arabic bundles.');
  } else {
    exit = 1;
    console.error(`\nMissing ${missingAr.length} key(s) for Arabic (core-ui locales + src/translations):\n`);
    for (const k of missingAr) console.error(`  ${k}`);
  }

  if (onlyInEn.length === 0 && onlyInAr.length === 0) {
    console.log('OK: src/translations/en.ts and ar.ts define the same keys.');
  } else {
    exit = 1;
    if (onlyInEn.length) {
      console.error(`\nKeys in en.ts but missing in ar.ts (${onlyInEn.length}):\n`);
      for (const k of onlyInEn) console.error(`  ${k}`);
    }
    if (onlyInAr.length) {
      console.error(`\nKeys in ar.ts but missing in en.ts (${onlyInAr.length}):\n`);
      for (const k of onlyInAr) console.error(`  ${k}`);
    }
  }

  process.exit(exit);
}

main();
