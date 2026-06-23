/**
 * Dashboard topbar module — sidebar menu sections only (no runtime API here).
 */

import type { MenuSection } from '@config/navigation';

export const sidebarSections: MenuSection[] = [
  {
    title: 'sidebar.operations',
    items: [
      { path: '/dashboard', label: 'sidebar.dashboard', icon: 'Activity' },
      { path: '/live-monitor', label: 'sidebar.live_monitor', icon: 'Radio' },
      { path: '/moderation', label: 'sidebar.moderation', icon: 'Shield' },
    ],
  },
  {
    title: 'sidebar.administration',
    items: [
      { path: '/merchants', label: 'sidebar.merchants', icon: 'Store' },
      { path: '/merchant-applications', label: 'sidebar.merchant_applications', icon: 'UserPlus' },
      { path: '/settlements', label: 'sidebar.settlements', icon: 'Landmark' },
      { path: '/users', label: 'sidebar.users', icon: 'UserCog' },
      { path: '/settings', label: 'sidebar.settings', icon: 'Settings' },
    ],
  },
  {
    title: 'sidebar.feedback_title',
    items: [
      { path: '/feedback/overview', label: 'sidebar.feedback_overview', icon: 'BarChart3' },
      { path: '/feedback/reviews', label: 'sidebar.feedback_reviews', icon: 'Star' },
      { path: '/feedback/posts', label: 'sidebar.feedback_posts', icon: 'MessageSquare' },
      { path: '/feedback/roadmap', label: 'sidebar.feedback_roadmap', icon: 'Map' },
      { path: '/feedback/changelog', label: 'sidebar.feedback_changelog', icon: 'FileText' },
    ],
  },
];
