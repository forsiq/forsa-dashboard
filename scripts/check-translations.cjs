#!/usr/bin/env node
/**
 * Translation Check Script - Runs after build
 * Shows summary of missing translations
 */

const fs = require('fs');
const path = require('path');

function findFiles(dir, extension, results = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (!['node_modules', 'dist', '.next', '.git', 'backup'].includes(file)) {
        findFiles(filePath, extension, results);
      }
    } else if (file.endsWith(extension)) {
      results.push(filePath);
    }
  }
  return results;
}

function loadTranslationKeys() {
  const keys = new Set();
  const localesPath = path.join(__dirname, '../src/core/translations/locales/en');

  const files = fs.readdirSync(localesPath).filter(f => f.endsWith('.ts') && f !== 'index.ts');

  for (const file of files) {
    const filePath = path.join(localesPath, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.matchAll(/["']([^"']+)["']:\s*["']/g);
    for (const m of matches) {
      if (m[1] && !m[1].includes('//') && m[1].length > 3) {
        keys.add(m[1]);
      }
    }
  }

  return keys;
}

function extractTCallKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const keys = new Set();
  const matches = content.matchAll(/t\(['"`]([^'"`]+)['"`]\)/g);
  for (const match of matches) {
    keys.add(match[1]);
  }
  return keys;
}

function main() {
  console.log('\n' + '='.repeat(70));
  console.log('📝 TRANSLATION CHECK REPORT');
  console.log('='.repeat(70) + '\n');

  const srcPath = path.join(__dirname, '../src');
  const tsFiles = findFiles(srcPath, '.tsx').concat(findFiles(srcPath, '.ts'));
  const sourceFiles = tsFiles.filter(f =>
    !f.includes('.test.') &&
    !f.includes('.spec.') &&
    !f.includes('/node_modules/') &&
    !f.includes('/dist/')
  );

  const existingKeys = loadTranslationKeys();
  const allTCallKeys = new Set();
  const keyFiles = new Map(); // key -> [files]

  for (const file of sourceFiles) {
    const keys = extractTCallKeys(file);
    for (const key of keys) {
      allTCallKeys.add(key);
      if (!keyFiles.has(key)) {
        keyFiles.set(key, []);
      }
      keyFiles.get(key).push(path.relative(srcPath, file));
    }
  }

  // Find missing keys (filter out noise)
  const missingKeys = [];
  const noisePatterns = [/^[.\-\/\\\n]$/, /\$\{/, /@features/, /^T$/, /div/, /search:/, /status\$\./];
  const noiseKeys = ['-', '.', '/', '\\n', 'div', 'T', 'search:open'];

  for (const key of allTCallKeys) {
    if (!existingKeys.has(key) && !noiseKeys.includes(key)) {
      let isNoise = false;
      for (const pattern of noisePatterns) {
        if (pattern.test(key)) {
          isNoise = true;
          break;
        }
      }
      if (!isNoise) {
        missingKeys.push(key);
      }
    }
  }

  // Display results
  console.log(`📚 Translation Keys:`);
  console.log(`   ✅ Existing: ${existingKeys.size}`);
  console.log(`   ❌ Missing: ${missingKeys.length}\n`);

  if (missingKeys.length > 0) {
    console.log(`❌ Missing Translation Keys (${missingKeys.length}):\n`);
    for (const key of missingKeys.sort()) {
      const files = keyFiles.get(key) || [];
      console.log(`   🔴 ${key}`);
      console.log(`      Used in: ${files.slice(0, 2).join(', ')}\n`);
    }
  } else {
    console.log(`✅ All translation keys found!\n`);
  }

  // Save missing to file
  const outputPath = path.join(__dirname, 'translation-output', 'missing-keys.txt');
  if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }

  let output = '// Missing translation keys\n// Add these to src/core/translations/locales/en/\n\n';
  for (const key of missingKeys.sort()) {
    output += `// TODO: Add translation for "${key}"\n`;
    output += `"${key}": "TODO",\n\n`;
  }

  fs.writeFileSync(outputPath, output);

  console.log(`📄 Generated: ${outputPath}`);
  console.log('\n' + '='.repeat(70));
  console.log(`✅ Translation check complete!\n`);
}

main();
