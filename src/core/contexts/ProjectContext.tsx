import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
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
  fetchProjectByUsername: (username: string) => Promise<ProjectInfo | null>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const PROJECT_STORAGE_KEY = 'zv_project';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://test.zonevast.com';

/**
 * Fetch with timeout helper
 * Handles slow API responses by setting a maximum wait time
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const { getProjectUsername, config } = useFeatureConfig();
  const [project, setProjectState] = useState<ProjectInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Perform one-time cleanup of legacy project IDs and auto-load
  useEffect(() => {
    const projectUsername = getProjectUsername();
    
    // Cleanup: If localStorage has a "local-" prefixed ID, clear it to force use of config/ID 11
    const stored = localStorage.getItem(PROJECT_STORAGE_KEY);
    if (stored) {
      try {
        const cachedProject: ProjectInfo = JSON.parse(stored);
        if (cachedProject.id?.startsWith('local-')) {
          console.log('[ProjectContext] 🧹 Cleaning up legacy local project ID');
          localStorage.removeItem(PROJECT_STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(PROJECT_STORAGE_KEY);
      }
    }

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
      // Try to fetch project info from API with 30s timeout for slow responses
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/api/v1/projects/by-username/${username.trim()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Project': config.project?.id || '11',
            'X-Project-ID': config.project?.id || '11'
          }
        },
        30000 // 30 second timeout
      );

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
        isAuthenticated,
        fetchProjectByUsername
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
  // Check localStorage for cached project info first
  const stored = localStorage.getItem(PROJECT_STORAGE_KEY);
  if (stored) {
    try {
      const project: ProjectInfo = JSON.parse(stored);
      return project.id;
    } catch {
      // Ignore
    }
  }

  // Fallback to cookie check (matching base project pattern)
  const currentProjectStr = Cookies.get('currentProject');
  if (currentProjectStr) {
      try {
          const project = JSON.parse(currentProjectStr);
          return String(project.id);
      } catch (e) {
          // Ignore
      }
  }

  return '11'; // Final fallback matching base project
};

/**
 * Get all project headers for API requests
 */
export const getProjectHeaders = (): Record<string, string> => {
    const projectId = getProjectIdHeader();
    return {
        'X-Project': projectId,
        'X-Project-ID': projectId
    };
};
