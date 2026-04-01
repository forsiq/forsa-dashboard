# ZoneVast Template Project

A feature-based architecture template for rapid development of ZoneVast applications.

**🚀 This is the upstream template repository.** Projects based on this template can sync updates using Git subtree.

## Template Workflow

### For Template Users (Creating Projects)

**Create a new project:**
```bash
node scripts/create-project.cjs my-project
cd my-project
npm install
npm run dev
```

**Sync template updates in your project:**
```bash
npm run template:status    # Check for updates
npm run template:sync      # Pull latest changes
```

See [TEMPLATE_SYNC.md](TEMPLATE_SYNC.md) for complete documentation.

### For Template Maintainers

**Release a new version:**
```bash
# 1. Update version in template.config.json
# 2. Update version in zvs.config.json
# 3. Commit changes
git add .
git commit -m "chore: bump version to 1.1.0"

# 4. Tag and push
git tag v1.1.0
git push origin main
git push origin v1.1.0
```

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (port 4000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
zonevast-template/
├── zvs.config.json         # Feature toggle configuration
├── src/
│   ├── core/               # THE ENGINE (never modify)
│   │   ├── components/     # Base UI components
│   │   ├── contexts/       # Global contexts (Language, Theme, etc.)
│   │   ├── layout/         # Dashboard layout components
│   │   ├── lib/            # Utilities and helpers
│   │   ├── styles/         # Theme CSS
│   │   └── translations/   # Language files
│   │
│   ├── features/           # THE DOMAINS (add/delete freely)
│   │   ├── _core/          # Core routing and error pages
│   │   ├── auth/           # Authentication (login, register, OTP)
│   │   ├── dashboard/      # Dashboard home
│   │   ├── settings/       # Settings pages
│   │   └── _example/       # Full working example
│   │
│   └── custom/             # THE OVERWRITE ZONE
│       └── features/       # Override any feature component
│
└── package.json
```

## Features

### Pre-packaged Features

| Feature | Description | Status |
|---------|-------------|--------|
| **_core** | Routing, error pages, guards | Always enabled |
| **auth** | Login, register, OTP | Enable/disable |
| **dashboard** | Dashboard home with stats | Enable/disable |
| **settings** | Profile, preferences, language | Enable/disable |
| **_example** | Complete CRUD example | Enable/disable |

### Enable/Disable Features

Edit `zvs.config.json`:

```json
{
  "features": {
    "auth": { "enabled": true, "override": false },
    "dashboard": { "enabled": true },
    "_example": { "enabled": false }
  }
}
```

## Creating a New Feature

1. **Copy the _example feature:**
   ```bash
   cp -r src/features/_example src/features/my-feature
   ```

2. **Update the routes in `src/features/my-feature/routes.ts`**

3. **Enable the feature in `zvs.config.json`**

4. **Build your feature:**
   - Pages in `pages/`
   - Components in `components/`
   - API calls in `api/`
   - Types in `types/`

## Custom Overrides

Override any component without modifying the original:

1. **Create the custom component:**
   ```
   src/custom/features/auth/components/LoginForm.tsx
   ```

2. **Enable override in config:**
   ```json
   { "auth": { "enabled": true, "override": true } }
   ```

The app will use your custom component instead of the default.

## Available Scripts

### Development
| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 4000 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

### Template Sync (for child projects)
| Command | Description |
|---------|-------------|
| `npm run template:status` | Check sync status and pending updates |
| `npm run template:version` | Show current and latest template version |
| `npm run template:sync` | Pull latest template changes |
| `npm run template:upgrade` | Sync + reinstall dependencies |

### Project Creation
| Command | Description |
|---------|-------------|
| `node scripts/create-project.cjs <name>` | Create new project from template |

## Configuration

### zvs.config.json

```json
{
  "features": {
    "feature-name": {
      "enabled": true,
      "override": false
    }
  },
  "theme": {
    "defaultTheme": "dark",
    "allowToggle": true
  },
  "language": {
    "defaultLanguage": "en",
    "supportedLanguages": ["en", "ar", "ku"]
  },
  "api": {
    "baseUrl": "http://localhost:3000",
    "timeout": 30000
  }
}
```

### Environment Variables

No `.env` file required by default. All configuration is in `zvs.config.json`.

## Tech Stack

| Technology | Version |
|------------|---------|
| React | 18.3.1 |
| Vite | 6.2.0 |
| TypeScript | 5.8.2 |
| React Router | 7.1.5 |
| Tailwind CSS | 3.4.0 |
| Zustand | 4.5.7 |
| TanStack Query | 5.90.2 |

## License

Copyright © ZoneVast
