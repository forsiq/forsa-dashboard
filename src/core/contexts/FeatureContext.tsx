import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface FeatureConfig {
  enabled: boolean;
  override: boolean;
}

export interface FeatureConfigs {
  [key: string]: FeatureConfig;
}

export interface AppConfig {
  features: FeatureConfigs;
  theme: {
    defaultTheme: 'light' | 'dark';
    allowToggle: boolean;
  };
  language: {
    defaultLanguage: 'en' | 'ar' | 'ku';
    supportedLanguages: string[];
  };
  api: {
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
}

const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

interface FeatureProviderProps {
  children: ReactNode;
  configPath?: string;
}

export const FeatureProvider: React.FC<FeatureProviderProps> = ({
  children,
  configPath = '/zvs.config.json'
}) => {
  const [config, setConfig] = useState<AppConfig>({
    features: {},
    theme: {
      defaultTheme: 'dark',
      allowToggle: true
    },
    language: {
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'ar', 'ku']
    },
    api: {
      baseUrl: 'http://localhost:3000',
      timeout: 30000
    }
  });

  const loadConfig = async () => {
    try {
      const response = await fetch(configPath);
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      console.warn('Failed to load feature config, using defaults:', error);
    }
  };

  useEffect(() => {
    loadConfig();
  }, [configPath]);

  const enabledFeatures = Object.entries(config.features)
    .filter(([_, cfg]) => cfg.enabled)
    .map(([name]) => name);

  const isFeatureEnabled = (featureName: string): boolean => {
    return config.features[featureName]?.enabled ?? false;
  };

  const hasCustomOverride = (featureName: string): boolean => {
    return config.features[featureName]?.override ?? false;
  };

  return (
    <FeatureContext.Provider
      value={{
        config,
        enabledFeatures,
        isFeatureEnabled,
        hasCustomOverride,
        reloadConfig: loadConfig
      }}
    >
      {children}
    </FeatureContext.Provider>
  );
};

export const useFeatureConfig = () => {
  const context = useContext(FeatureContext);
  if (context === undefined) {
    throw new Error('useFeatureConfig must be used within a FeatureProvider');
  }
  return context;
};
