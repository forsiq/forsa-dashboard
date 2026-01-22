
import React, { useState, useMemo, useEffect } from 'react';
import { AmberCard } from '../amber-ui/components/AmberCard';
import { AmberButton } from '../amber-ui/components/AmberButton';
import { AmberInput } from '../amber-ui/components/AmberInput';
import { AmberDropdown } from '../amber-ui/components/AmberDropdown';
import { AmberSlideOver } from '../amber-ui/components/AmberSlideOver';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  Archive, 
  Trash2, 
  Settings, 
  Edit,
  Users,
  LayoutGrid
} from 'lucide-react';
import { useLanguage } from '../amber-ui/contexts/LanguageContext';
import { cn } from '../lib/cn';

// Mock Data
const MOCK_PROJECTS = Array.from({ length: 18 }).map((_, i) => ({
  id: `PROJ-${100 + i}`,
  title: [
    'Website Redesign', 'Mobile App Launch', 'Q4 Marketing', 'Database Migration', 
    'Cloud Infrastructure', 'AI Model Training', 'Legacy System Audit', 'User Portal V2'
  ][i % 8] + (i > 7 ? ` ${Math.floor(i / 8) + 1}` : ''),
  description: 'Comprehensive overhaul of the core architecture to improve scalability and user experience across all touchpoints.',
  status: ['Active', 'Active', 'Pending', 'Active', 'Archived', 'Pending'][i % 6],
  dueDate: '2025-12-31',
  members: Array.from({ length: 2 + (i % 4) }).map((_, j) => ({
    id: `u${j}`,
    initials: ['AM', 'SC', 'JW', 'MG', 'RK'][j % 5],
    color: ['bg-brand', 'bg-info', 'bg-success', 'bg-warning', 'bg-danger'][j % 5]
  }))
}));

export const Projects = () => {
  const { t } = useLanguage();
  
  // -- State --
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  // Create Form State
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    status: 'Active',
    dueDate: ''
  });

  const itemsPerPage = 6;

  // -- Helpers --
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-success bg-success/10 border-success/20';
      case 'Pending': return 'text-warning bg-warning/10 border-warning/20';
      case 'Archived': return 'text-zinc-muted bg-white/5 border-white/10';
      default: return 'text-zinc-text bg-white/5';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <CheckCircle2 className="w-3 h-3" />;
      case 'Pending': return <Clock className="w-3 h-3" />;
      case 'Archived': return <Archive className="w-3 h-3" />;
      default: return null;
    }
  };

  // -- Filter & Pagination Logic --
  const filteredProjects = useMemo(() => {
    return MOCK_PROJECTS.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProjects, currentPage]);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  // -- Event Handlers --
  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 on filter change
  }, [searchQuery, statusFilter]);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    if (activeMenuId) window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [activeMenuId]);

  const handleMenuClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  return (
    <div className="space-y-8 animate-fade-up min-h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Briefcase className="w-5 h-5 text-brand" />
             <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">{t('proj.title')}</h1>
          </div>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] italic">{t('proj.subtitle')}</p>
        </div>
        <AmberButton size="sm" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" /> {t('proj.new')}
        </AmberButton>
      </div>

      {/* Filter Bar */}
      <div className="bg-obsidian-panel border border-white/10 rounded-sm p-4 flex flex-col lg:flex-row gap-4 items-end relative z-10">
        <div className="flex-1 w-full">
          <label className="block text-[10px] font-black text-zinc-muted uppercase tracking-widest mb-1.5 px-1">
            Search Projects
          </label>
          <div className="relative">
            <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
            <input 
              type="text" 
              placeholder={t('proj.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all placeholder:text-zinc-muted/60"
            />
          </div>
        </div>
        
        <AmberDropdown 
          label="Status Filter"
          options={[
            { label: 'All Projects', value: 'All' },
            { label: 'Active', value: 'Active' },
            { label: 'Pending', value: 'Pending' },
            { label: 'Archived', value: 'Archived' }
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
          className="w-full lg:w-48"
        />

        <button className="h-10 px-4 bg-obsidian-card border border-white/5 text-zinc-muted hover:text-zinc-text transition-all rounded-sm flex items-center justify-center hover:bg-white/5">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Projects Grid */}
      <div className="flex-1">
        {paginatedProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProjects.map((project) => (
              <AmberCard key={project.id} className="group relative flex flex-col h-full hover:border-brand/30 transition-all duration-300">
                {/* Card Header */}
                <div className="flex justify-between items-start mb-4">
                  <span className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest border",
                    getStatusColor(project.status)
                  )}>
                    {getStatusIcon(project.status)}
                    {project.status}
                  </span>
                  
                  {/* Action Menu Trigger */}
                  <div className="relative">
                    <button 
                      onClick={(e) => handleMenuClick(e, project.id)}
                      className="p-1.5 text-zinc-muted hover:text-zinc-text hover:bg-white/5 rounded-sm transition-all"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {/* Floating Action Menu */}
                    {activeMenuId === project.id && (
                      <div className="absolute right-0 top-full mt-1 w-32 bg-obsidian-card border border-white/10 rounded-sm shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
                        <button className="w-full text-left px-3 py-2 text-[10px] font-bold text-zinc-text hover:bg-white/5 uppercase tracking-wide flex items-center gap-2">
                          <Edit className="w-3 h-3" /> Edit
                        </button>
                        <button className="w-full text-left px-3 py-2 text-[10px] font-bold text-zinc-text hover:bg-white/5 uppercase tracking-wide flex items-center gap-2">
                          <Settings className="w-3 h-3" /> Settings
                        </button>
                        <div className="h-px bg-white/5 my-1" />
                        <button className="w-full text-left px-3 py-2 text-[10px] font-bold text-danger hover:bg-danger/10 uppercase tracking-wide flex items-center gap-2">
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <h3 className="text-lg font-black text-zinc-text mb-2 group-hover:text-brand transition-colors uppercase italic tracking-tight line-clamp-1">
                  {project.title}
                </h3>
                <p className="text-xs font-medium text-zinc-muted leading-relaxed mb-6 line-clamp-2">
                  {project.description}
                </p>

                {/* Card Footer */}
                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex -space-x-2 rtl:space-x-reverse">
                    {project.members.map((m, i) => (
                      <div 
                        key={i}
                        className={cn(
                          "w-7 h-7 rounded-full border-2 border-obsidian-panel flex items-center justify-center text-[8px] font-black text-obsidian-outer uppercase",
                          m.color
                        )}
                        title={`Member ${m.id}`}
                      >
                        {m.initials}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center text-[10px] font-bold text-zinc-muted uppercase tracking-tight">
                    <Calendar className="w-3 h-3 me-1.5 opacity-60" />
                    {project.dueDate}
                  </div>
                </div>
              </AmberCard>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-lg">
            <Briefcase className="w-12 h-12 text-zinc-muted/30 mb-4" />
            <p className="text-zinc-muted text-sm font-bold uppercase tracking-widest">No projects found</p>
            <p className="text-zinc-muted/50 text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {paginatedProjects.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-white/5 pt-6 gap-4">
          <p className="text-[10px] text-zinc-muted font-black uppercase tracking-[0.2em]">
            Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredProjects.length)} of {filteredProjects.length} Projects
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-[10px] font-black text-zinc-text bg-obsidian-card border border-white/5 rounded-sm hover:bg-obsidian-hover disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest transition-all"
            >
              Previous
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-[10px] font-black text-zinc-text bg-obsidian-card border border-white/5 rounded-sm hover:bg-obsidian-hover disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      <AmberSlideOver
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Project"
        description="Initialize a new strategic initiative."
        footer={
          <>
            <AmberButton variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</AmberButton>
            <AmberButton onClick={() => setIsCreateOpen(false)}>Initialize Project</AmberButton>
          </>
        }
      >
        <div className="space-y-6">
          <AmberInput 
            label="Project Name"
            placeholder="e.g. Q3 Marketing Campaign"
            value={newProject.title}
            onChange={(e) => setNewProject({...newProject, title: e.target.value})}
          />
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Description</label>
            <textarea 
              rows={4}
              placeholder="Briefly describe the project goals..."
              className="w-full bg-obsidian-outer border border-white/5 rounded-sm p-3 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all resize-none placeholder:text-zinc-muted/40"
              value={newProject.description}
              onChange={(e) => setNewProject({...newProject, description: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Initial Status</label>
                <AmberDropdown 
                  options={[
                    { label: 'Active', value: 'Active' },
                    { label: 'Pending', value: 'Pending' },
                    { label: 'On Hold', value: 'On Hold' }
                  ]}
                  value={newProject.status}
                  onChange={(val) => setNewProject({...newProject, status: val})}
                  className="w-full"
                />
             </div>
             <AmberInput 
                label="Target Due Date"
                type="date"
                value={newProject.dueDate}
                onChange={(e) => setNewProject({...newProject, dueDate: e.target.value})}
             />
          </div>
          <div className="p-4 bg-obsidian-outer/50 border border-white/5 rounded-sm">
             <h4 className="text-[10px] font-black text-zinc-text uppercase tracking-widest mb-2 flex items-center gap-2">
               <Users className="w-3 h-3" /> Team Assignment
             </h4>
             <p className="text-[9px] text-zinc-muted leading-relaxed">
               You can assign team members and configure roles after the project shell is created.
             </p>
          </div>
        </div>
      </AmberSlideOver>
    </div>
  );
};
