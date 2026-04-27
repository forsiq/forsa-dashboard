
export interface ChangelogEntry {
  version: string;
  title: string;
  date: string;
  hash: string;
  author: string;
  type: 'Major' | 'Minor' | 'Patch';
  fileName: string;
  content: string;
}

export const changelogData: ChangelogEntry[] = [
  {
    version: 'v1.2.0',
    title: 'Modernization & Unified Design',
    date: '2026-03-30',
    hash: '8f2d9a1',
    author: 'ZoneVast Core',
    type: 'Major',
    fileName: 'release_v1.2.0.md',
    content: `# Modernization Release
## Key Changes
- Redesigned About page with interactive version history.
- Improved sidebar with better translations and font sizes.
- Enhanced table components with selection and expansion logic.
- Standardized project patterns with Auction & Product suites.

## Improvements
- Increased accessibility through better font scaling.
- Unified glassmorphic design across all core pages.
- Full RTL support for Arabic and Kurdish languages.
- Optimized bundle size and performance.`
  },
  {
    version: 'v1.1.5',
    title: 'Core Architecture Refactor',
    date: '2026-02-15',
    hash: 'a3e4f1b',
    author: 'System Architect',
    type: 'Minor',
    fileName: 'build_482.md',
    content: `# Build 482 - Core Refactor
## Performance
- Implemented persistent context for rapid node synchronization.
- Optimized GraphQL query batching.
- Reduced initial load time by 40%.

## Bug Fixes
- Resolved session timeout issue on hybrid mobile nodes.
- Fixed theme persistence across application switches.`
  },
  {
    version: 'v1.0.0',
    title: 'Initial Project Seed',
    date: '2025-06-01',
    hash: 'f5c8e2d',
    author: 'Initial Commit',
    type: 'Patch',
    fileName: 'genesis.md',
    content: `# Genesis Build
## Initial Features
- Project skeleton with Vite and React.
- Amber UI components integration.
- Fundamental navigation and state management.
- Multi-language support foundation.`
  }
];
