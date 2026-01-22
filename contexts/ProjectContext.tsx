
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ProjectFeatures {
  enableInventory: boolean;
  enableAnalytics: boolean;
  enableAutomation: boolean;
  useProductWizard: boolean;
  [key: string]: boolean | undefined;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  plan: 'Enterprise' | 'Pro' | 'Starter';
  status: 'Active' | 'Suspended' | 'Archived';
  billing: {
    amount: string;
    nextDue: string;
    method: string;
  };
  features: ProjectFeatures;
}

interface ProjectContextType {
  projects: Project[];
  activeProjectId: string | null;
  activeProject: Project | null;
  selectProject: (id: string | null) => void;
  toggleProjectFeature: (projectId: string, feature: string) => void;
  createProject: (project: Omit<Project, 'id' | 'features'> & { id?: string }) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
}

const defaultProjects: Project[] = [
  {
    id: 'proj_alpha',
    name: 'Acme Global Retail',
    description: 'Main e-commerce operations for North America.',
    plan: 'Enterprise',
    status: 'Active',
    billing: { amount: '$2,499/mo', nextDue: 'Jun 1, 2025', method: 'Corp Invoice' },
    features: { enableInventory: true, enableAnalytics: true, enableAutomation: true, useProductWizard: true }
  },
  {
    id: 'proj_beta',
    name: 'Launchpad Marketing',
    description: 'Landing pages and lead generation microsites.',
    plan: 'Starter',
    status: 'Active',
    billing: { amount: '$49/mo', nextDue: 'Jun 15, 2025', method: 'Visa ••4242' },
    features: { enableInventory: false, enableAnalytics: true, enableAutomation: false, useProductWizard: false }
  },
  {
    id: 'proj_gamma',
    name: 'Internal Tools',
    description: 'Employee directory and legacy system connectors.',
    plan: 'Pro',
    status: 'Active',
    billing: { amount: '$299/mo', nextDue: 'May 30, 2025', method: 'Mastercard ••8821' },
    features: { enableInventory: true, enableAnalytics: false, enableAutomation: true, useProductWizard: true }
  }
];

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('zv_projects');
    return saved ? JSON.parse(saved) : defaultProjects;
  });

  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    return localStorage.getItem('zv_active_project_id');
  });

  useEffect(() => {
    localStorage.setItem('zv_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    if (activeProjectId) {
      localStorage.setItem('zv_active_project_id', activeProjectId);
    } else {
      localStorage.removeItem('zv_active_project_id');
    }
  }, [activeProjectId]);

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  const selectProject = (id: string | null) => {
    setActiveProjectId(id);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, ...updates };
      }
      return p;
    }));
  };

  const toggleProjectFeature = (projectId: string, feature: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const currentValue = p.features[feature] || false;
        return {
          ...p,
          features: {
            ...p.features,
            [feature]: !currentValue
          }
        };
      }
      return p;
    }));
  };

  const createProject = (data: Omit<Project, 'id' | 'features'> & { id?: string }) => {
    const newProject: Project = {
      ...data,
      id: data.id || `proj_${Date.now()}`,
      features: { enableInventory: true, enableAnalytics: true, enableAutomation: false, useProductWizard: true }
    };
    setProjects([...projects, newProject]);
  };

  return (
    <ProjectContext.Provider value={{ 
      projects, 
      activeProjectId, 
      activeProject, 
      selectProject, 
      toggleProjectFeature,
      createProject,
      updateProject
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

// Helper hook for backward compatibility and ease of use
export const useFeatures = () => {
  const { activeProject } = useProjects();
  return {
    features: activeProject?.features || { enableInventory: false, enableAnalytics: false, enableAutomation: false, useProductWizard: false },
    toggleFeature: (key: keyof ProjectFeatures) => {
      throw new Error("Use useProjects().toggleProjectFeature instead");
    }
  };
};
