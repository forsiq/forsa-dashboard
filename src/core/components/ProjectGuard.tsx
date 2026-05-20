'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { useProject } from '@core/contexts/ProjectContext';

interface ProjectGuardProps {
  children: React.ReactNode;
}

/**
 * ProjectGuard ensures a project is available before rendering protected content.
 *
 * If no project is found but the user has a valid auth cookie, we don't redirect
 * to login — the AuthGuard handles that. Only redirect when truly unauthenticated
 * (no access cookie AND no project).
 */
export const ProjectGuard: React.FC<ProjectGuardProps> = ({ children }) => {
  const { project, isLoading } = useProject();
  const router = useRouter();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!project) {
        // Check if user is authenticated (has access cookie).
        // If authenticated but project is null, it might be a transient state
        // — don't redirect. AuthGuard will handle missing tokens.
        const hasAccessToken = !!Cookies.get('access');
        if (!hasAccessToken) {
          void router.replace('/login');
          return;
        }
        // Authenticated but no project — keep loading, ProjectProvider
        // will re-try when config loads.
      } else {
        setShowLoading(false);
      }
    }

    const timeout = setTimeout(() => {
      if (isLoading || !project) {
        setShowLoading(false);
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [project, isLoading, router]);

  if ((isLoading || !project) && showLoading) {
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
