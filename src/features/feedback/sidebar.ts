import type { MenuSection } from '@config/navigation';

export const feedbackSidebarSections: MenuSection[] = [
  {
    title: 'sidebar.feedback_title',
    items: [
      {
        path: '/feedback/overview',
        label: 'sidebar.feedback_overview',
        icon: 'BarChart3',
      },
      {
        path: '/feedback/reviews',
        label: 'sidebar.feedback_reviews',
        icon: 'Star',
      },
      {
        path: '/feedback/posts',
        label: 'sidebar.feedback_posts',
        icon: 'MessageSquare',
      },
      {
        path: '/feedback/roadmap',
        label: 'sidebar.feedback_roadmap',
        icon: 'Map',
      },
      {
        path: '/feedback/changelog',
        label: 'sidebar.feedback_changelog',
        icon: 'FileText',
      },
    ],
  },
];
