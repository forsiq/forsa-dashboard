'use client';

import React from 'react';
import { PortalPage } from '@core/pages/PortalPage';
import { ChangelogSection } from '@features/changelog/components/ChangelogSection';

export const ForsaPortalPage: React.FC = () => {
  return (
    <div>
      <PortalPage />
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="border-t border-white/5 pt-12">
          <ChangelogSection />
        </div>
      </div>
    </div>
  );
};
