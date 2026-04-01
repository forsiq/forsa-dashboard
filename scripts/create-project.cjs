#!/usr/bin/env node
/**
 * create-project.cjs
 *
 * Create a new project based on the ZoneVast template.
 *
 * Usage:
 *   node scripts/create-project.cjs <project-name> [destination]
 *
 * Example:
 *   node scripts/create-project.cjs my-awesome-project
 *   node scripts/create-project.cjs my-awesome-project ../projects/
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, copyFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { resolve, dirname, join, basename } from 'path';
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

function error(message) {
  log(`ERROR: ${message}`, 'red');
  process.exit(1);
}

// Recursively copy directory
function copyDir(src, dest, exclude = []) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  const entries = readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    // Skip excluded files/directories
    if (exclude.includes(entry.name) || exclude.some(e => srcPath.includes(e))) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, exclude);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

// Parse arguments
const args = process.argv.slice(2);
const projectName = args[0];
const destination = args[1] || '.';

if (!projectName) {
  error('Project name is required.\nUsage: node create-project.cjs <project-name> [destination]');
}

// Validate project name
if (!/^[a-z0-9-]+$/.test(projectName)) {
  error('Project name must contain only lowercase letters, numbers, and hyphens.');
}

const templateRoot = resolve(__dirname, '..');
const projectDir = resolve(destination, projectName);

// Check if project directory already exists
if (existsSync(projectDir)) {
  error(`Directory "${projectDir}" already exists.`);
}

log('\n' + '='.repeat(60), 'blue');
log(`Creating project: ${projectName}`, 'cyan');
log('='.repeat(60), 'blue');

// Create project directory
log(`\n→ Creating directory: ${projectDir}`, 'cyan');
mkdirSync(projectDir, { recursive: true });

// Initialize git repository
log('→ Initializing git repository...', 'cyan');
execSync('git init', { cwd: projectDir, stdio: 'ignore' });
log('✓ Git repository initialized', 'green');

// Copy template files (excluding node_modules, dist, .git)
log('\n→ Copying template files...', 'cyan');
const excludePatterns = [
  'node_modules',
  'dist',
  '.git',
  'package-lock.json',
  'tsconfig.tsbuildinfo',
  'tsconfig.node.tsbuildinfo',
  '.backup',
];

// Copy all files
const entries = readdirSync(templateRoot, { withFileTypes: true });
for (const entry of entries) {
  const srcPath = join(templateRoot, entry.name);
  const destPath = join(projectDir, entry.name);

  if (excludePatterns.includes(entry.name)) {
    continue;
  }

  if (entry.isDirectory()) {
    copyDir(srcPath, destPath, excludePatterns);
  } else {
    copyFileSync(srcPath, destPath);
  }
}
log('✓ Template files copied', 'green');

// Update package.json
log('\n→ Updating package.json...', 'cyan');
const packageJsonPath = resolve(projectDir, 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
packageJson.name = projectName;
packageJson.description = `${projectName} - Based on ZoneVast Template`;
delete packageJson.scripts['template:init']; // Not needed in child projects
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
log('✓ package.json updated', 'green');

// Create custom directory
const customDir = resolve(projectDir, 'src', 'custom');
mkdirSync(customDir, { recursive: true });
mkdirSync(resolve(customDir, 'features'), { recursive: true });
mkdirSync(resolve(customDir, 'components'), { recursive: true });
writeFileSync(
  resolve(customDir, 'README.md'),
  `# Custom Features

This directory contains your custom overrides and features for **${projectName}**.

## Structure

- \`features/\` - Your custom feature modules
- \`components/\` - Your custom component overrides

## Adding Custom Features

1. Create a new feature in \`features/my-feature/\`
2. Add routes in \`features/my-feature/routes.tsx\`
3. Enable in \`zvs.config.json\`
`
);
log('✓ Created src/custom/ directory', 'green');

// Create initial README
log('\n→ Creating project README...', 'cyan');
writeFileSync(
  resolve(projectDir, 'README.md'),
  `# ${projectName}

Built with [ZoneVast Template](https://github.com/zonevast/zonevast-template).

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
\`\`\`

## Project Structure

- \`src/custom/\` - Your custom features and overrides
- \`src/features/\` - Template features (you can add more here)
- \`src/services/\` - Business logic services
- \`src/core/\` - Core components (from template, don't edit)

## Template Updates

This project is based on ZoneVast Template. To get updates:

\`\`\`bash
# Check for updates
npm run template:status

# Pull latest changes
npm run template:sync
\`\`\`

See [TEMPLATE_SYNC.md](TEMPLATE_SYNC.md) for more details.

## License

Copyright © ZoneVast
`
);
log('✓ README.md created', 'green');

// Create .env file
log('\n→ Creating .env file...', 'cyan');
writeFileSync(
  resolve(projectDir, '.env'),
  `# ${projectName} Environment Variables

VITE_API_BASE_URL=http://localhost:3000
VITE_APP_URL=http://localhost:4000
`
);
log('✓ .env created', 'green');

// Initial commit
log('\n→ Creating initial commit...', 'cyan');
try {
  execSync('git add .', { cwd: projectDir, stdio: 'ignore' });
  execSync('git commit -m "Initial commit from ZoneVast Template"', { cwd: projectDir, stdio: 'ignore' });
  log('✓ Initial commit created', 'green');
} catch (err) {
  log('⚠ Could not create initial commit (git config may be missing)', 'yellow');
}

// Success message
log('\n' + '='.repeat(60), 'blue');
log(`Project "${projectName}" created successfully!`, 'green');
log('='.repeat(60), 'blue');

log('\nNext steps:', 'cyan');
log(`  1. cd ${projectName}`, 'reset');
log('  2. npm install', 'reset');
log('  3. npm run dev', 'reset');
log('\nYour project is ready!', 'green');
log(`\nLocation: ${projectDir}`, 'dim');
log('\n' + '='.repeat(60) + '\n', 'blue');
