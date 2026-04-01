# ZoneVast Template - Project Structure

```
zonevast-template/
├── src/
│   ├── core/              # 🔒 READ-ONLY - Foundation layer
│   │   ├── ui/            # Base UI components (AmberButton, AmberInput, etc.)
│   │   ├── contexts/      # Global providers (Language, Theme, Auth, Navigation)
│   │   ├── layout/        # Fixed layouts (Sidebar, Topbar, DashboardLayout)
│   │   ├── pages/         # Core pages (Portal, About)
│   │   ├── lib/           # Utilities and helpers
│   │   ├── styles/        # Theme CSS
│   │   └── translations/  # i18n translations (en, ar, ku)
│   │
│   ├── config/            # ⚙️  CONFIGURATION - Developer writable
│   │   ├── services.ts    # Service registry (internal/external services)
│   │   └── navigation.ts  # Sidebar menu configuration
│   │
│   ├── services/          # 📦 READY-MADE SERVICES - Use as-is or customize
│   │   ├── categories/    # Category management
│   │   ├── customers/     # Customer management
│   │   ├── inventory/     # Inventory management
│   │   ├── orders/        # Order management
│   │   └── reports/       # Reports and analytics
│   │
│   └── features/          # 🛠️  WORKSPACE - Build NEW features here
│       ├── auth/          # Authentication (login, register)
│       ├── settings/      # App settings (theme, language, profile)
│       ├── dashboard/     # Main dashboard
│       └── _example/      # Example feature template
│
├── zvs.config.json        # Feature enable/disable configuration
└── public/                # Static assets
```

---

## Layers Explained

### 🔒 Core (`src/core/`) - DO NOT MODIFY

**Purpose**: Foundation code that developers should NEVER modify.

**Contains**:
- All Amber UI components (Button, Input, Card, Dropdown, etc.)
- Layout components (Sidebar, Topbar, DashboardLayout, AuthLayout)
- Context providers (Language, Theme, Auth, Navigation, Feature)
- Core pages (Portal hub, About page)
- Router utilities and guards
- Core translations

**Rule**: If you need to change something here, consider if it should be configurable instead.

---

### ⚙️ Config (`src/config/`) - MODIFY HERE

**Purpose**: Single source of truth for all configurable aspects.

**Files**:
- **services.ts** - Define all services (internal/external)
  ```typescript
  export const services: Service[] = [
    {
      id: 'my-service',
      name: 'My Service',
      type: 'internal',  // or 'external'
      route: '/my-service',  // for internal
      url: 'https://...',    // for external
      enabled: true,
    },
  ];
  ```

- **navigation.ts** - Define sidebar menu
  ```typescript
  export const menuSections: MenuSection[] = [
    {
      title: 'sidebar.my_section',
      items: [
        {
          path: '/my-page',
          label: 'nav.my_page',
          icon: 'SomeIcon',
          serviceId: 'my-service',
        },
      ],
    },
  ];
  ```

---

### 📦 Services (`src/services/`) - READY-MADE MODULES

**Purpose**: Pre-built business services you can use as-is or customize.

**Available Services**:
- `categories/` - Category management (CRUD)
- `customers/` - Customer management
- `inventory/` - Product/Inventory management
- `orders/` - Order processing
- `reports/` - Reports and analytics

**Service Structure**:
```
services/[service-name]/
├── pages/       # Service pages
├── components/  # Service-specific components
├── hooks/       # Custom hooks
├── api/         # API integration
├── types/       # TypeScript definitions
└── routes.tsx   # Route definitions
```

**Usage**:
1. Service is already integrated and working
2. Customize by editing files in the service directory
3. Enable/disable via `config/services.ts`
4. Add menu items via `config/navigation.ts`

---

### 🛠️ Features (`src/features/`) - YOUR WORKSPACE

**Purpose**: Where YOU build NEW features and custom functionality.

**Contains**:
- `auth/` - Authentication system (login, register, OTP)
- `settings/` - App-wide settings (theme, language, profile)
- `dashboard/` - Main dashboard with stats and activity
- `_example/` - Template for creating new features

**When to add here**:
- Building a NEW feature not in services
- Creating custom integrations
- Adding business logic specific to your project

---

## How to Add Things

### Add a New Internal Service

```bash
# 1. Create service directory
mkdir -p src/services/my-service/{pages,components,hooks,api,types}

# 2. Create routes.tsx
export const routes = [
  { path: '/my-service', element: <MyServiceListPage /> },
];

# 3. Register in config/services.ts
{ id: 'my-service', name: 'My Service', type: 'internal', route: '/my-service', enabled: true }

# 4. Add to menu in config/navigation.ts
{ path: '/my-service', label: 'My Service', icon: 'SomeIcon', serviceId: 'my-service' }
```

### Add an External Service

```typescript
// Just add to config/services.ts
{
  id: 'external-app',
  name: 'External App',
  type: 'external',
  url: 'https://external-app.example.com',
  enabled: true,
}
```

### Add a New Feature

```bash
# Copy the example template
cp -r src/features/_example src/features/my-feature

# Add your implementation
# Update routes, pages, components as needed
```

---

## Portal vs Services

- **Portal** (`/portal`) = A hub page that displays all available services as cards
- **Services** = Actual business modules (internal or external)

The Portal page lives in `src/core/pages/PortalPage.tsx` and reads from `config/services.ts` to display available services.

---

## Summary

| Layer | Who Modifies | Purpose |
|-------|--------------|---------|
| **Core** | No one (foundation) | UI components, layouts, base functionality |
| **Config** | Developers | Enable services, configure navigation |
| **Services** | Developers (optional) | Pre-built modules to use or customize |
| **Features** | Developers | Workspace for building NEW things |
