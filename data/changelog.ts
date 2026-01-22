
export interface ChangelogEntry {
  fileName: string;
  version: string;
  date: string;
  title: string;
  type: 'Major' | 'Minor' | 'Patch';
  hash: string;
  author: string;
  content: string; // Simulating Markdown content
}

export const changelogData: ChangelogEntry[] = [
  { 
    fileName: 'v4.12.8.md',
    version: 'v4.12.8', 
    date: '2025-05-18', 
    title: 'Global Latency Optimization', 
    type: 'Patch', 
    hash: '8f2a...991',
    author: 'Alex Morgan',
    content: `# Global Latency Optimization

## Performance Tuning
- Reduced TTB (Time to First Byte) by 14% in AP-South region.
- Optimized data synchronization protocols for edge nodes.
- Enhanced compression for faster report generation.

## Network
- Adjusted TCP window scaling for satellite uplinks.
- Fixed jitter issues in high-latency zones.`
  },
  { 
    fileName: 'v4.12.5.md',
    version: 'v4.12.5', 
    date: '2025-05-12', 
    title: 'Vault Security Integration', 
    type: 'Minor',
    hash: '3c1b...442',
    author: 'Sarah Chen',
    content: `# Vault Security Integration

## Security Protocols
- Introduced advanced encryption wrapping for sensitive fields (AES-256).
- Added automated rotation policy for service tokens.

## UI Updates
- Added visibility toggle for encrypted data views.
- Updated audit log schema to include vault access events.`
  },
  { 
    fileName: 'v4.11.0.md',
    version: 'v4.11.0', 
    date: '2025-04-28', 
    title: 'Obsidian Interface Update', 
    type: 'Major',
    hash: '1a9d...228',
    author: 'Design Team',
    content: `# Obsidian Interface Update

## Visual Overhaul
- Complete visual overhaul to "Obsidian" high-contrast theme.
- Standardized card components and typography for better readability.

## Navigation
- Implemented new responsive Sidebar navigation.
- Added "Command Center" global search modal (Cmd+K).`
  },
  { 
    fileName: 'v4.10.2.md',
    version: 'v4.10.2', 
    date: '2025-04-15', 
    title: 'Reporting Engine V2', 
    type: 'Minor',
    hash: '7b2c...119',
    author: 'Data Ops',
    content: `# Reporting Engine V2

## Analytics
- Added real-time velocity tracking for SKU movement.
- Interactive charts for regional performance metrics.

## Exports
- New export formats: PDF, CSV, and JSON.
- Asynchronous report generation for large datasets.`
  },
  { 
    fileName: 'v4.09.5.md',
    version: 'v4.09.5', 
    date: '2025-03-30', 
    title: 'Inventory Sync Stabilizer', 
    type: 'Patch', 
    hash: '9x1d...882',
    author: 'Core Eng',
    content: `# Inventory Sync Stabilizer

## Bug Fixes
- Fixed race condition in multi-region stock updates.
- Improved webhook delivery reliability.

## Features
- Added manual override for stock adjustments in Admin console.`
  },
  { 
    fileName: 'v4.08.0.md',
    version: 'v4.08.0', 
    date: '2025-03-10', 
    title: 'User Roles & Permissions', 
    type: 'Major',
    hash: '2f4a...663',
    author: 'Security Team',
    content: `# User Roles & Permissions

## RBAC
- Granular permission controls for all modules.
- Role-based access control (RBAC) implementation.

## Compliance
- Audit logs for permission changes.
- Session timeout enforcement configurability.`
  },
  { 
    fileName: 'v4.05.1.md',
    version: 'v4.05.1', 
    date: '2025-02-22', 
    title: 'Search Performance Boost', 
    type: 'Patch', 
    hash: '5e8b...112',
    author: 'Search Team',
    content: `# Search Performance Boost

## Indexing
- Indexed 100k+ additional SKU attributes.
- Sub-50ms search query response time.

## Query Engine
- Fuzzy matching for better result accuracy.
- Added weight bias for "Recent" items.`
  },
  { 
    fileName: 'v4.00.0.md',
    version: 'v4.00.0', 
    date: '2025-01-01', 
    title: 'Platform Genesis', 
    type: 'Major',
    hash: '0x00...001',
    author: 'Founding Team',
    content: `# Platform Genesis

## Initial Release
- Initial release of ZoneVast Enterprise.
- Core catalog and inventory management modules.
- Basic reporting and user management.`
  }
];
