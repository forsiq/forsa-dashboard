# ZoneVast Template Sync Guide

This document explains how to work with the ZoneVast template system using Git subtree.

## Architecture Overview

```
my-project/                    # Your project
├── template/                  # 🔒 Subtree (from upstream - DON'T EDIT)
│   ├── src/core/              # Core UI, contexts, layouts
│   ├── src/features/_core/    # Core routing and guards
│   └── template.config.json   # Template version
│
├── src/                       # 🛠️ Your code (EDIT HERE)
│   ├── custom/                # Your custom overrides
│   ├── features/              # Your features
│   └── services/              # Your services
│
├── zvs.config.json            # Your feature config
└── package.json               # Your dependencies
```

## Creating a New Project

### Option 1: Using the create-project script

```bash
cd zonevast-template
node scripts/create-project.cjs my-new-project
cd my-new-project
npm install
npm run dev
```

### Option 2: Manual setup

```bash
# 1. Create your project directory
mkdir my-new-project
cd my-new-project

# 2. Initialize git
git init

# 3. Add the template subtree
npm run template:init git@github.com:zonevast/zonevast-template.git

# 4. Copy template files to root
cp -r/template/zvs.config.json.template ./zvs.config.json
cp -r/template/package.json.template ./package.json

# 5. Install and run
npm install
npm run dev
```

## Syncing Template Updates

### Check for updates

```bash
npm run template:status
```

This shows:
- Current template version
- Latest available version
- Pending updates

### Pull latest changes

```bash
npm run template:sync
```

This will:
1. Fetch from the upstream repository
2. Merge changes into your `template/` directory
3. Report any conflicts

### Check version

```bash
npm run template:version
```

## What NOT to Edit

**Never edit files in `template/` directory.** These will be overwritten on next sync.

| Path | Editable? |
|------|-----------|
| `template/src/core/` | ❌ NO |
| `template/src/features/_core/` | ❌ NO |
| `template/src/config/` | ❌ NO (copy to src/) |
| `src/features/` | ✅ YES |
| `src/services/` | ✅ YES |
| `src/custom/` | ✅ YES |

## Overriding Template Components

If you need to customize a template component:

### Method 1: Copy and Modify

1. Copy the component from `template/` to your project:
   ```bash
   cp template/src/core/components/MyComponent.tsx src/custom/components/
   ```

2. Import your version instead of the template version

### Method 2: Feature Override

1. Create override in `src/custom/`
2. Enable via `zvs.config.json`:
   ```json
   {
     "features": {
       "my-feature": { "enabled": true, "override": true }
     }
   }
   ```

## Handling Merge Conflicts

If a sync results in conflicts:

```bash
npm run template:sync
# CONFLICT detected
```

### Resolution Steps

1. **Review conflicts:**
   ```bash
   git status
   ```

2. **For template files** - Accept upstream (your changes shouldn't be here):
   ```bash
   git checkout --theirs template/src/core/SomeFile.tsx
   git add template/src/core/SomeFile.tsx
   ```

3. **For your custom files** - Keep yours:
   ```bash
   git checkout --ours src/custom/MyFile.tsx
   git add src/custom/MyFile.tsx
   ```

4. **Complete the merge:**
   ```bash
   git commit
   ```

### Best Practices

- **Keep custom code separate** - Always edit in `src/`, not `template/`
- **Commit before syncing** - Ensure your work is safe
- **Test after sync** - Run `npm run dev` to verify

## Version Compatibility

The template tracks version compatibility:

```json
{
  "template": {
    "version": "1.0.0",
    "minCompatibleProject": "1.0.0"
  }
}
```

- **Breaking changes** - Bump major version (2.0.0)
- **New features** - Bump minor version (1.1.0)
- **Bug fixes** - Bump patch version (1.0.1)

## Removing the Template

To stop using the template and make your project independent:

```bash
# 1. Merge template into your codebase
git subtree push --prefix=template origin template-branch

# 2. Copy files you want to keep
cp -r template/src/* src/

# 3. Remove subtree
git rm -r template
git commit -m "Remove template subtree"

# 4. Remove remote
git remote remove zonevast-template
```

## Troubleshooting

### "Not a git repository"

```bash
git init
```

### "Remote not found"

```bash
npm run template:init git@github.com:zonevast/zonevast-template.git
```

### "Subtree pull failed"

1. Ensure you have no uncommitted changes
2. Check remote URL is correct
3. Try fetching first: `git fetch zonevast-template`

### Build errors after sync

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run template:status` | Check sync status |
| `npm run template:version` | Show template version |
| `npm run template:sync` | Pull latest changes |
| `npm run template:upgrade` | Sync + reinstall |
