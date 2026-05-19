'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useProject } from '@core/contexts/ProjectContext';

interface ProjectGuardProps {
  children: React.ReactNode;
}

export const ProjectGuard: React.FC<ProjectGuardProps> = ({ children }) => {
  const { project, isLoading } = useProject();
  const router = useRouter();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!project) {
        void router.replace('/login');
        return;
      }
      setShowLoading(false);
    }

    const timeout = setTimeout(() => {
      if (isLoading) {
        setShowLoading(false);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [project, isLoading, router]);

  if (isLoading && showLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-obsidian-outer">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-muted text-sm font-medium">Loading project...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return <>{children}</>;
};
