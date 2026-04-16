import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface ProjectGuardProps {
  children: React.ReactNode;
  required?: boolean;
  fallback?: string;
}

/**
 * ProjectGuard - Protects routes that require a selected project
 * Redirects to project selection if no project is active
 */
export const ProjectGuard: React.FC<ProjectGuardProps> = ({
  children,
  required = false,
  fallback = '/projects'
}) => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [hasActiveProject, setHasActiveProject] = useState<boolean | null>(null);

  useEffect(() => {
    setIsClient(true);
    const activeProject = localStorage.getItem('active_project') !== null;
    setHasActiveProject(activeProject);
  }, []);

  useEffect(() => {
    if (isClient && required && hasActiveProject === false) {
      router.replace(fallback);
    }
  }, [isClient, required, hasActiveProject, router, fallback]);

  // Handle SSR or loading state
  if (!isClient || (required && hasActiveProject === null)) {
    return (
      <div className="flex items-center justify-center min-h-screen text-zinc-muted font-bold font-mono animate-pulse uppercase tracking-widest">
        VERIFYING PROJECT ACCESS...
      </div>
    );
  }

  // If project is required but not found, don't render children while redirecting
  if (required && !hasActiveProject) {
    return null;
  }

  return <>{children}</>;
};
