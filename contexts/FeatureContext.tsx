
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Features {
  enableInventory: boolean;
}

interface FeatureContextType {
  features: Features;
  toggleFeature: (key: keyof Features) => void;
}

const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

export const FeatureProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [features, setFeatures] = useState<Features>(() => {
    const saved = localStorage.getItem('app_features');
    return saved ? JSON.parse(saved) : { enableInventory: true };
  });

  useEffect(() => {
    localStorage.setItem('app_features', JSON.stringify(features));
  }, [features]);

  const toggleFeature = (key: keyof Features) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <FeatureContext.Provider value={{ features, toggleFeature }}>
      {children}
    </FeatureContext.Provider>
  );
};

export const useFeatures = () => {
  const context = useContext(FeatureContext);
  if (context === undefined) {
    throw new Error('useFeatures must be used within a FeatureProvider');
  }
  return context;
};
