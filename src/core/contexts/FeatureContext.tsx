import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface FeatureConfig {
  enabled: boolean;
  override: boolean;
}

export interface FeatureConfigs {
  [key: string]: FeatureConfig;
}

export interface AppConfig {
  template?: {
    version: string;
    upstream: string;
    lastUpdate: string;
    autoSync: boolean;
  };
  project?: {
    username: string;
    id?: string;
    enabled: boolean;
  };
  features: FeatureConfigs;
  theme: {
    defaultTheme: 'light' | 'dark';
    allowToggle: boolean;
  };
  language: {
    defaultLanguage: 'en' | 'ar' | 'ku';
    supportedLanguages: string[];
  };
  api?: {
    baseUrl: string;
    timeout: number;
  };
}

interface FeatureContextType {
  config: AppConfig;
  enabledFeatures: string[];
  isFeatureEnabled: (featureName: string) => boolean;
  hasCustomOverride: (featureName: string) => boolean;
  reloadConfig: () => Promise<void>;
  getApiBaseUrl: () => string;
  getProjectUsername: () => string;
}

const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

interface FeatureProviderProps {
  children: ReactNode;
  configPath?: string;
}

const DEFAULT_CONFIG: AppConfig = {
  features: {},
  theme: {
    defaultTheme: 'dark',
    allowToggle: true
  },
  language: {
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'ar', 'ku']
  }
};

/**
 * Get API base URL from environment variable (highest priority)
 * Falls back to config file, then localhost
 */
export const getApiBaseUrl = (configBaseUrl?: string): string => {
  // Priority: 1) Env var, 2) Config, 3) Fallback
  const envUrl = process.env.VITE_API_BASE_URL;
  if (envUrl) return envUrl;
  if (configBaseUrl) return configBaseUrl;
  return 'http://localhost:3000';
};

/**
 * Get project username from environment variable (highest priority)
 * Falls back to config file, then empty string
 */
export const getProjectUsername = (configUsername?: string): string => {
  // Priority: 1) Env var, 2) Config, 3) Fallback
  const envUsername = process.env.VITE_PROJECT_USERNAME;
  if (envUsername) return envUsername;
  if (configUsername) return configUsername;
  return '';
};

export const FeatureProvider: React.FC<FeatureProviderProps> = ({
  children,
  configPath = '/zvs.config.json'
}) => {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);

  const loadConfig = async () => {
    try {
      const response = await fetch(configPath);
      if (response.ok) {
        const data: AppConfig = await response.json();

        // Merge with defaults - env vars take precedence for API URL
        const mergedConfig: AppConfig = {
          ...DEFAULT_CONFIG,
          ...data,
          api: {
            baseUrl: getApiBaseUrl(data.api?.baseUrl),
            timeout: data.api?.timeout || 30000
          }
        };

        setConfig(mergedConfig);
      }
    } catch (error) {
      console.warn('Failed to load feature config, using defaults:', error);
      // Use env var for API URL even if config fails
      setConfig({
        ...DEFAULT_CONFIG,
        api: {
          baseUrl: getApiBaseUrl(),
          timeout: 30000
        }
      });
    }
  };

  useEffect(() => {
    loadConfig();
  }, [configPath]);

  const enabledFeatures = Object.entries(config.features || {})
    .filter(([_, cfg]) => cfg.enabled)
    .map(([name]) => name);

  const isFeatureEnabled = (featureName: string): boolean => {
    return config.features?.[featureName]?.enabled ?? false;
  };

  const hasCustomOverride = (featureName: string): boolean => {
    return config.features?.[featureName]?.override ?? false;
  };

  return (
    <FeatureContext.Provider
      value={{
        config,
        enabledFeatures,
        isFeatureEnabled,
        hasCustomOverride,
        reloadConfig: loadConfig,
        getApiBaseUrl: () => getApiBaseUrl(config.api?.baseUrl),
        getProjectUsername: () => getProjectUsername(config.project?.username)
      }}
    >
      {children}
    </FeatureContext.Provider>
  );
};

export const useFeatureConfig = () => {
  const context = useContext(FeatureContext);
  if (context === undefined) {
    throw new Error('useFeatureConfig must be used within aFeatureProvider');
  }
  return context;
};
