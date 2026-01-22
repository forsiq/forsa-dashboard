
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  ChevronDown, 
  Search, 
  Bell, 
  Check, 
  Plus, 
  LogOut, 
  Settings 
} from 'lucide-react';
import { useLanguage } from '../../../amber-ui/contexts/LanguageContext';
import { useProjects } from '../../../contexts/ProjectContext';
import { AmberLogo } from '../../../amber-ui/components/AmberLogo';
import { cn } from '../../../lib/cn';
import { paths } from '../../../routes/paths';

export const PortalHeader = () => {
  const { t, dir } = useLanguage();
  const { projects, activeProject, selectProject } = useProjects();
  const navigate = useNavigate();
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProjectMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitch = (id: string) => {
    selectProject(id);
    setIsProjectMenuOpen(false);
    navigate('/portal'); // Redirect to portal home on switch
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-obsidian-panel/80 backdrop-blur-md border-b border-white/5 px-6 flex items-center justify-between">
      {/* Left: Brand & Project Switcher */}
      <div className="flex items-center gap-6">
        <Link to="/portal" className="flex items-center gap-3 group">
          <AmberLogo className="w-8 h-8 group-hover:scale-105 transition-transform" />
          <div className="hidden sm:block">
            <span className="text-lg font-black text-zinc-text uppercase italic tracking-tighter leading-none block">ZoneVast</span>
            <span className="text-[9px] font-bold text-brand/80 uppercase tracking-[0.4em] mt-1 block">Portal</span>
          </div>
        </Link>

        {/* Project Switcher */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
            className="flex items-center gap-3 px-3 py-1.5 bg-obsidian-outer border border-white/5 rounded-sm hover:border-brand/30 transition-all group"
          >
            <div className="p-1.5 bg-white/5 rounded-sm text-brand group-hover:bg-brand/10">
               <Briefcase className="w-4 h-4" />
            </div>
            <div className="text-left hidden md:block">
               <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">Current Project</p>
               <p className="text-xs font-bold text-zinc-text truncate max-w-[120px]">
                 {activeProject?.name || 'Select Project'}
               </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-muted group-hover:text-zinc-text transition-colors" />
          </button>

          {isProjectMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-obsidian-card border border-white/10 rounded-sm shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
               <div className="px-3 py-2 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                  <span className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">Active Projects</span>
                  <span className="text-[9px] font-bold bg-white/10 px-1.5 rounded text-zinc-text">{projects.length}</span>
               </div>
               <div className="max-h-[300px] overflow-y-auto p-1">
                  {projects.map(proj => (
                     <button 
                       key={proj.id}
                       onClick={() => handleSwitch(proj.id)}
                       className={cn(
                          "w-full flex items-center justify-between px-3 py-2.5 rounded-sm transition-colors group",
                          activeProject?.id === proj.id ? "bg-brand/5" : "hover:bg-white/5"
                       )}
                     >
                        <div className="text-left">
                           <p className={cn("text-xs font-bold uppercase tracking-tight", activeProject?.id === proj.id ? "text-brand" : "text-zinc-text")}>{proj.name}</p>
                           <p className="text-[9px] text-zinc-muted uppercase">{proj.plan}</p>
                        </div>
                        {activeProject?.id === proj.id && <Check className="w-3.5 h-3.5 text-brand" />}
                     </button>
                  ))}
               </div>
               <div className="border-t border-white/5 p-1">
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-black text-zinc-muted hover:text-brand hover:bg-white/5 uppercase tracking-widest transition-colors rounded-sm">
                     <Plus className="w-3.5 h-3.5" /> New Project
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
         <div className="relative hidden md:block group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted group-focus-within:text-brand transition-colors" />
            <input 
              type="text" 
              placeholder="Search portal..."
              className="h-9 w-64 bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all placeholder:text-zinc-muted/50"
            />
         </div>

         <button className="relative p-2 text-zinc-muted hover:text-zinc-text hover:bg-white/5 rounded-sm transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-brand rounded-full animate-pulse" />
         </button>

         <div className="h-6 w-px bg-white/10 mx-1" />

         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-obsidian-outer border border-white/10 flex items-center justify-center text-xs font-black text-zinc-text">
               AM
            </div>
            <Link to="/" title="Logout" className="text-zinc-muted hover:text-danger transition-colors">
               <LogOut className="w-4 h-4 rtl:rotate-180" />
            </Link>
         </div>
      </div>
    </header>
  );
};
