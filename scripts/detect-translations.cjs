#!/usr/bin/env node
/**
 * Translation Detection Script
 *
 * This script scans the source code for:
 * 1. Hardcoded strings that should be translated
 * 2. Missing translation keys referenced in t() calls
 *
 * Usage: node scripts/detect-translations.js
 */

const fs = require('fs');
const path = require('path');

// Recursively find all files in a directory
function findFiles(dir, extension, results = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and build directories
      if (!['node_modules', 'dist', '.next', '.git', 'backup'].includes(file)) {
        findFiles(filePath, extension, results);
      }
    } else if (file.endsWith(extension)) {
      results.push(filePath);
    }
  }

  return results;
}

// Load all translation keys from locale files
function loadTranslationKeys() {
  const keys = new Set();
  const localesPath = path.join(__dirname, '../src/core/translations/locales');

  // Read English translations
  const enIndexPath = path.join(localesPath, 'en/index.ts');
  if (fs.existsSync(enIndexPath)) {
    const content = fs.readFileSync(enIndexPath, 'utf8');

    // Extract keys from import statements and object spread
    // Pattern: "key": "value" or 'key': 'value'
    const keyPattern = /["']([\w.]+)["']:\s*["']/g;
    let match;

    // Also read individual files
    const enDir = path.join(localesPath, 'en');
    const enFiles = fs.readdirSync(enDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

    for (const file of enFiles) {
      const filePath = path.join(enDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const matches = content.matchAll(/["']([^"']+)["']:\s*["']([^"']+)["']/g);
      for (const m of matches) {
        keys.add(m[1]);
      }
    }
  }

  return keys;
}

// Extract strings from a source file
function extractStringsFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const strings = {
    hardcoded: new Set(),
    tCalls: new Set(),
    jsxText: new Set(),
    attributes: new Set(),
  };

  // Find t() calls
  const tCallMatches = content.matchAll(/t\(['"`]([^'"`]+)['"`]\)/g);
  for (const match of tCallMatches) {
    strings.tCalls.add(match[1]);
  }

  // Find JSX text content between tags
  const jsxMatches = content.matchAll(/>([^<{>\n\s][^<{>\n]{2,})</g);
  for (const match of jsxMatches) {
    const text = match[1].trim();
    // Filter out: single chars, pure numbers, special chars
    if (text.length >= 2 &&
        !/^[0-9]+$/.test(text) &&
        !/^[{}()[\],;]$/.test(text) &&
        !text.startsWith('...') &&
        !/className|style|onClick|onChange|key=|src=|href=|alt=|id=|data-|aria-/.test(text)) {
      strings.jsxText.add(text);
    }
  }

  // Find attribute values that might need translation
  const attrMatches = content.matchAll(/(placeholder|title|label|alt|aria-label)=["']([^"']{2,})["']/g);
  for (const match of attrMatches) {
    strings.attributes.add(match[2]);
  }

  // Find template literals with text
  const templateMatches = content.matchAll(/`([^`\n]{5,}[\w\s]+[^`\n])`/g);
  for (const match of templateMatches) {
    const text = match[1].trim();
    if (!text.includes('${') && text.length > 3) {
      strings.hardcoded.add(text);
    }
  }

  return strings;
}

// Check if a string is a valid translation key
function isValidTranslationKey(key) {
  return /^[\w.]+$/.test(key) &&
         !key.startsWith('__') &&
         key.includes('.') &&
         key.length < 100;
}

// Generate a suggested translation key
function suggestKey(text, feature) {
  const clean = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim()
    .replace(/\s+/g, '_')
    .substring(0, 40);
  return `${feature}.${clean}`;
}

// Main function
function main() {
  console.log('🔍 Translation Detection Script\n');
  console.log('=' .repeat(60));

  const srcPath = path.join(__dirname, '../src');

  // Find all TypeScript/TSX files
  console.log('\n📁 Scanning source files...');
  const tsFiles = findFiles(srcPath, '.ts');
  const tsxFiles = findFiles(srcPath, '.tsx');
  const allFiles = [...tsFiles, ...tsxFiles];

  // Filter out test files and node_modules
  const sourceFiles = allFiles.filter(f =>
    !f.includes('.test.') &&
    !f.includes('.spec.') &&
    !f.includes('/node_modules/') &&
    !f.includes('/dist/')
  );

  console.log(`   Found ${sourceFiles.length} source files`);

  // Load existing translation keys
  console.log('\n📚 Loading existing translations...');
  const existingKeys = loadTranslationKeys();
  console.log(`   Found ${existingKeys.size} translation keys`);

  // Extract strings from all files
  console.log('\n🔎 Extracting strings from source files...');

  const allTCallKeys = new Set();
  const allHardcodedStrings = new Map(); // string -> count
  const stringLocations = new Map();     // string -> [files]

  for (const file of sourceFiles) {
    const strings = extractStringsFromFile(file);

    // Collect t() call keys
    for (const key of strings.tCalls) {
      allTCallKeys.add(key);
    }

    // Collect hardcoded strings
    for (const text of [...strings.jsxText, ...strings.attributes]) {
      if (text.length < 3 || text.length > 100) continue;
      if (/^[0-9\s.,]+$/.test(text)) continue;
      if (/className|Function|Interface|Type|import|export|from|return|const|let|var/.test(text)) continue;

      allHardcodedStrings.set(text, (allHardcodedStrings.get(text) || 0) + 1);

      if (!stringLocations.has(text)) {
        stringLocations.set(text, []);
      }
      stringLocations.get(text).push(path.relative(srcPath, file));
    }
  }

  console.log(`   Found ${allTCallKeys.size} t() call keys`);
  console.log(`   Found ${allHardcodedStrings.size} potential translatable strings`);

  // Find missing translation keys
  console.log('\n📊 Analysis Results:\n');
  console.log('='.repeat(60));

  const missingKeys = [];
  for (const key of allTCallKeys) {
    if (!existingKeys.has(key)) {
      missingKeys.push(key);
    }
  }

  if (missingKeys.length > 0) {
    console.log(`\n❌ Missing translation keys (${missingKeys.length}):\n`);
    for (const key of missingKeys.sort()) {
      console.log(`   - ${key}`);
    }
  } else {
    console.log('\n✅ All t() call keys have translations!');
  }

  // Most common hardcoded strings
  const sortedStrings = Array.from(allHardcodedStrings.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50);

  if (sortedStrings.length > 0) {
    console.log(`\n⚠️  Top ${sortedStrings.length} hardcoded strings to translate:\n`);
    console.log('   String'.padEnd(50) + 'Count  Suggested Key');
    console.log('   ' + '-'.repeat(80));

    for (const [text, count] of sortedStrings) {
      const displayText = text.length > 45 ? text.substring(0, 42) + '...' : text;
      const feature = detectFeature(stringLocations.get(text)[0]);
      const suggestedKey = suggestKey(text, feature);
      console.log(`   "${displayText}"`.padEnd(50) + `${count}    ${suggestedKey}`);
    }
  }

  // Generate output files
  const outputPath = path.join(__dirname, 'translation-output');
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  // Generate missing translations file
  const missingPath = path.join(outputPath, 'add-these-translations.txt');
  let output = '// Add these translations to appropriate files in src/core/translations/locales/en/\n\n';

  output += '// === Missing translation keys ===\n';
  for (const key of missingKeys.sort()) {
    output += `"${key}": "TODO: translate ${key}",\n`;
  }

  output += '\n// === Hardcoded strings to translate ===\n';
  for (const [text, count] of sortedStrings) {
    const feature = detectFeature(stringLocations.get(text)[0]);
    const suggestedKey = suggestKey(text, feature);
    output += `\n// Used ${count} time(s) in: ${stringLocations.get(text).slice(0, 2).join(', ')}\n`;
    output += `"${suggestedKey}": "${text.replace(/"/g, '\\"')}",\n`;
  }

  fs.writeFileSync(missingPath, output);

  console.log(`\n📝 Generated: ${missingPath}`);
  console.log('\n✅ Done!\n');
}

function detectFeature(filePath) {
  if (filePath.includes('/features/')) {
    const match = filePath.match(/\/features\/(\w+)\//);
    return match ? match[1] : 'common';
  }
  if (filePath.includes('/core/')) return 'core';
  if (filePath.includes('/components/')) return 'ui';
  return 'common';
}

main();
