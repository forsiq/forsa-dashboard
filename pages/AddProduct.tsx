
import React from 'react';
import { AddProductWizard } from '../features/products/pages/AddProductWizard';
import { AddProductSingle } from '../features/products/pages/AddProductSingle';
import { useProjects } from '../contexts/ProjectContext';
import { Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { paths } from '../routes/paths';

export const AddProduct = () => {
  const { activeProject } = useProjects();
  
  // Default to wizard if setting is undefined
  const useWizard = activeProject?.features.useProductWizard !== false;

  return (
    <div className="space-y-6 relative">
       {/* Configuration Tip */}
       <div className="flex justify-end mb-2">
          <Link 
            to={paths.serviceSettings}
            className="flex items-center gap-2 text-[9px] font-bold text-zinc-muted hover:text-brand transition-colors uppercase tracking-widest"
            title="Configure Product Entry Mode"
          >
             <Settings2 className="w-3 h-3" /> Configure View
          </Link>
       </div>

       {useWizard ? <AddProductWizard /> : <AddProductSingle />}
    </div>
  );
};
