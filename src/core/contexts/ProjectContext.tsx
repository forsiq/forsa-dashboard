import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useFeatureConfig } from './FeatureContext';

export interface ProjectInfo {
  id: string;
  username: string;
  name: string;
  logo?: string;
  domain?: string;
}

interface ProjectContextType {
  project: ProjectInfo | null;
  isLoading: boolean;
  error: string | null;
  setProject: (project: ProjectInfo) => void;
  clearProject: () => void;
  isAuthenticated: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const PROJECT_STORAGE_KEY = 'zv_project';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const { getProjectUsername, config } = useFeatureConfig();
  const [project, setProjectState] = useState<ProjectInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-load project from config
  useEffect(() => {
    const loadProjectFromConfig = async () => {
      const projectUsername = getProjectUsername();

      // If project is disabled in config, skip
      if (config.project?.enabled === false) {
        console.log('Project feature is disabled');
        return;
      }

      // First check localStorage for cached project
      const stored = localStorage.getItem(PROJECT_STORAGE_KEY);
      if (stored) {
        try {
          const cachedProject: ProjectInfo = JSON.parse(stored);
          // If cached project matches config username, use it
          if (cachedProject.username === projectUsername) {
            setProjectState(cachedProject);
            return;
          }
        } catch {
          localStorage.removeItem(PROJECT_STORAGE_KEY);
        }
      }

      // If project username is configured, fetch project info
      if (projectUsername && projectUsername.trim()) {
        await fetchProjectByUsername(projectUsername);
      }
    };

    loadProjectFromConfig();
  }, [config, getProjectUsername]);

  const setProject = (projectInfo: ProjectInfo) => {
    setProjectState(projectInfo);
    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projectInfo));
    setError(null);
  };

  const clearProject = () => {
    setProjectState(null);
    localStorage.removeItem(PROJECT_STORAGE_KEY);
  };

  const fetchProjectByUsername = async (username: string): Promise<ProjectInfo | null> => {
    if (!username || username.trim().length === 0) {
      setError('Project username is required');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Try to fetch project info from API
      const response = await fetch(`${API_BASE_URL}/api/v1/projects/by-username/${username.trim()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        // If API fails, create a temporary project from username
        console.warn('Project API not available, using local project');

        const tempProject: ProjectInfo = {
          id: `local-${username}`,
          username: username.trim(),
          name: username.charAt(0).toUpperCase() + username.slice(1),
        };

        setProject(tempProject);
        setIsLoading(false);
        return tempProject;
      }

      const data = await response.json();

      const projectInfo: ProjectInfo = {
        id: data.id,
        username: data.username,
        name: data.name,
        logo: data.logo,
        domain: data.domain,
      };

      setProject(projectInfo);
      setIsLoading(false);
      return projectInfo;

    } catch (err) {
      // On network error, create local project
      console.warn('Network error, using local project:', err);

      const tempProject: ProjectInfo = {
        id: `local-${username}`,
        username: username.trim(),
        name: username.charAt(0).toUpperCase() + username.slice(1),
      };

      setProject(tempProject);
      setIsLoading(false);
      return tempProject;
    }
  };

  const isAuthenticated = project !== null;

  return (
    <ProjectContext.Provider
      value={{
        project,
        isLoading,
        error,
        setProject,
        clearProject,
        isAuthenticated
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

/**
 * Get X-Project-ID header value for API requests
 */
export const getProjectIdHeader = (): string => {
  const stored = localStorage.getItem(PROJECT_STORAGE_KEY);
  if (stored) {
    try {
      const project: ProjectInfo = JSON.parse(stored);
      return project.id;
    } catch {
      // Ignore
    }
  }
  return '11'; // Default fallback
};
