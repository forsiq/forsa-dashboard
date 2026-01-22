
import React, { useState, useEffect } from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { AmberSlideOver } from '../../../amber-ui/components/AmberSlideOver';
import { AmberInput } from '../../../amber-ui/components/AmberInput';
import { AmberDropdown } from '../../../amber-ui/components/AmberDropdown';
import { useProjects, Project } from '../../../contexts/ProjectContext';
import { 
  Briefcase, 
  Plus, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  CreditCard, 
  MoreVertical,
  Settings,
  LayoutGrid
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../../../lib/cn';

export const WorkspaceProjects = () => {
  const { projects, selectProject, createProject, activeProjectId } = useProjects();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // New Project State
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    plan: 'Starter' as Project['plan'],
    status: 'Active' as Project['status']
  });

  // Check for navigation state to auto-open create modal
  useEffect(() => {
    if (location.state && (location.state as any).openCreate) {
        setIsCreateOpen(true);
        // Clear state so it doesn't reopen on refresh if we wanted to be strict, 
        // but replacing history is cleaner.
        window.history.replaceState({}, document.title);
    }
  }, [location]);

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    const newId = `proj_${Date.now()}`;
    
    createProject({
      id: newId,
      name: newProject.name,
      description: newProject.description,
      plan: newProject.plan,
      status: newProject.status,
      billing: {
        amount: newProject.plan === 'Enterprise' ? '$2,499/mo' : newProject.plan === 'Pro' ? '$299/mo' : '$49/mo',
        nextDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        method: ' Invoice'
      }
    });
    
    setIsCreateOpen(false);
    setNewProject({ name: '', description: '', plan: 'Starter', status: 'Active' });
    
    // Auto-select and enter the new project
    selectProject(newId);
    navigate('/portal');
  };

  const handleSwitch = (id: string) => {
    selectProject(id);
    navigate('/portal');
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Workspace Directory</h1>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Manage your organization's project environments</p>
        </div>
        <AmberButton size="sm" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" /> Create Workspace
        </AmberButton>
      </div>

      {/* Filter */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
        <input 
          type="text" 
          placeholder="Search workspaces..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 bg-obsidian-panel border border-white/5 rounded-sm pl-10 pr-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((proj) => {
          const isActive = activeProjectId === proj.id;
          return (
            <AmberCard 
              key={proj.id} 
              className={cn(
                "p-6 flex flex-col h-full hover:border-brand/30 transition-all group relative overflow-hidden",
                isActive ? "border-brand/40 bg-brand/[0.02]" : "border-white/5"
              )}
            >
              {isActive && (
                <div className="absolute top-0 right-0 p-1 bg-brand text-obsidian-outer rounded-bl-lg">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-obsidian-outer border border-white/5 rounded-sm group-hover:text-brand transition-colors">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                   <span className={cn(
                     "px-2 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest border",
                     proj.plan === 'Enterprise' ? "bg-brand/10 text-brand border-brand/20" : "bg-white/5 text-zinc-muted border-white/10"
                   )}>
                     {proj.plan}
                   </span>
                   <button className="p-1 text-zinc-muted hover:text-zinc-text transition-colors">
                      <MoreVertical className="w-4 h-4" />
                   </button>
                </div>
              </div>

              <h3 className="text-lg font-black text-zinc-text uppercase tracking-tight italic mb-2 group-hover:text-brand transition-colors">
                {proj.name}
              </h3>
              <p className="text-xs font-medium text-zinc-muted mb-6 leading-relaxed line-clamp-2 flex-1">
                {proj.description}
              </p>

              <div className="space-y-4 pt-4 border-t border-white/5">
                 <div className="flex items-center justify-between text-[10px] font-bold text-zinc-muted uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> {proj.billing.amount}</span>
                    <span className={cn("flex items-center gap-1.5", proj.status === 'Active' ? "text-success" : "text-zinc-muted")}>
                       <div className={cn("w-1.5 h-1.5 rounded-full", proj.status === 'Active' ? "bg-success animate-pulse" : "bg-zinc-muted")} />
                       {proj.status}
                    </span>
                 </div>
                 
                 <div className="flex gap-2">
                    {isActive ? (
                       <AmberButton className="w-full bg-success hover:bg-success/90 text-white border-none cursor-default">
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Active Workspace
                       </AmberButton>
                    ) : (
                       <AmberButton onClick={() => handleSwitch(proj.id)} className="w-full">
                          Switch to Workspace <ArrowRight className="w-4 h-4 ml-2" />
                       </AmberButton>
                    )}
                    <button 
                      onClick={() => { selectProject(proj.id); navigate('/project/configuration'); }}
                      className="p-2.5 bg-obsidian-outer border border-white/5 rounded-sm text-zinc-muted hover:text-zinc-text hover:border-white/10 transition-all"
                      title="Settings"
                    >
                       <Settings className="w-4 h-4" />
                    </button>
                 </div>
              </div>
            </AmberCard>
          );
        })}
        
        {/* Empty State / Add New Card */}
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="min-h-[300px] rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 text-zinc-muted hover:text-brand hover:border-brand/30 hover:bg-white/[0.02] transition-all group"
        >
           <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8" />
           </div>
           <div className="text-center">
              <h3 className="text-sm font-black uppercase tracking-widest">Initialize New Workspace</h3>
              <p className="text-[10px] font-bold opacity-60 mt-1 uppercase tracking-wider">Create a fresh project container</p>
           </div>
        </button>
      </div>

      {/* Create Modal */}
      <AmberSlideOver
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Workspace"
        description="Initialize a new secure project container."
        footer={
          <>
            <AmberButton variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</AmberButton>
            <AmberButton onClick={handleCreate}>Initialize Workspace</AmberButton>
          </>
        }
      >
        <div className="space-y-6">
           <AmberInput 
              label="Workspace Name"
              placeholder="e.g. Q4 Marketing Campaign"
              value={newProject.name}
              onChange={(e) => setNewProject({...newProject, name: e.target.value})}
              autoFocus
           />
           
           <div>
              <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1.5 block px-1">Subscription Plan</label>
              <div className="grid grid-cols-3 gap-2">
                 {['Starter', 'Pro', 'Enterprise'].map((plan) => (
                    <button
                      key={plan}
                      onClick={() => setNewProject({...newProject, plan: plan as any})}
                      className={cn(
                        "py-3 text-[10px] font-black uppercase tracking-widest rounded-sm border transition-all",
                        newProject.plan === plan 
                          ? "bg-brand/10 border-brand/30 text-brand" 
                          : "bg-obsidian-outer border-white/5 text-zinc-muted hover:text-zinc-text"
                      )}
                    >
                       {plan}
                    </button>
                 ))}
              </div>
           </div>

           <AmberInput 
              label="Description"
              multiline
              rows={4}
              placeholder="Briefly describe the purpose of this workspace..."
              value={newProject.description}
              onChange={(e) => setNewProject({...newProject, description: e.target.value})}
           />

           <div className="p-4 bg-obsidian-outer/50 border border-white/5 rounded-sm">
              <h4 className="text-[10px] font-black text-zinc-text uppercase tracking-widest mb-2 flex items-center gap-2">
                <LayoutGrid className="w-3 h-3" /> Default Modules
              </h4>
              <p className="text-[9px] text-zinc-muted leading-relaxed">
                New workspaces come pre-configured with Inventory, Analytics, and basic Automation features enabled by default. You can customize these later in Project Settings.
              </p>
           </div>
        </div>
      </AmberSlideOver>
    </div>
  );
};
