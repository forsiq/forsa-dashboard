import React from 'react';
import { Navigate } from 'react-router-dom';

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
  // TODO: Implement actual project selection check
  const hasActiveProject = localStorage.getItem('active_project') !== null;

  if (required && !hasActiveProject) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};
