
import React from 'react';
import { AppRouter } from './routes/AppRoutes';
import { LanguageProvider } from './amber-ui/contexts/LanguageContext';
import { ThemeProvider } from './amber-ui/contexts/ThemeContext';
import { NavigationProvider } from './amber-ui/contexts/NavigationContext';
import { ProjectProvider } from './contexts/ProjectContext';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <NavigationProvider>
          <ProjectProvider>
            <AppRouter />
          </ProjectProvider>
        </NavigationProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
