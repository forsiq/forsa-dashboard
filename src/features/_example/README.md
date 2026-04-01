# _example Feature

This is a complete working example feature that demonstrates best practices for creating new features in the ZoneVast Template.

## Structure

```
_example/
├── pages/           # Page components
├── components/      # Reusable components
├── hooks/          # Custom React hooks
├── types/          # TypeScript definitions
├── api/            # API integration layer
├── routes.ts       # Route definitions
└── README.md       # This file
```

## Creating a New Feature

1. **Copy this directory as a template:**
   ```bash
   cp -r src/features/_example src/features/your-feature
   ```

2. **Update the routes in `routes.ts`:**
   ```ts
   export const exampleRoutes: RouteObject[] = [
     { path: '/your-feature', element: <YourFeaturePage /> }
   ];
   ```

3. **Add the feature to `zvs.config.json`:**
   ```json
   {
     "features": {
       "your-feature": { "enabled": true }
     }
   }
   ```

4. **Implement your feature logic:**
   - Create pages in `pages/`
   - Create components in `components/`
   - Add API calls in `api/`
   - Define types in `types/`

## Example Pages

- **ExampleListPage**: Data table with filters and pagination
- **ExampleDetailPage**: Detail view with related data
- **ExampleFormPage**: Create/edit form with validation
- **ExampleSettingsPage**: Settings page example

## Example Components

- **ExampleTable**: Reusable data table component
- **ExampleForm**: Form with validation example
- **ExampleCard**: Card component example
- **ExampleFilter**: Filter panel component

## Example Hooks

- **useExampleData**: Fetch data from API
- **useExampleCRUD**: Full CRUD operations

## API Integration

The `api/` directory shows how to integrate with backend services. All API calls use the configured base URL from `zvs.config.json`.
