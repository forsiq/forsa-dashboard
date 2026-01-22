
import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Project } from '../types';
import { Plus, Search, Filter, Calendar, MoreVertical, Briefcase } from 'lucide-react';
import { useLanguage } from '../amber-ui/contexts/LanguageContext';
import { cn } from '../lib/cn';

const initialProjects: Project[] = [
  {
    id: '1',
    title: 'Website Redesign',
    description: 'Overhaul the corporate website with new branding guidelines and improved accessibility.',
    status: 'Active',
    progress: 75,
    dueDate: '2023-11-30',
    members: ['1', '2', '3'],
  },
  {
    id: '2',
    title: 'Mobile App Launch',
    description: 'Prepare marketing assets and store listings for the upcoming iOS and Android app launch.',
    status: 'On Hold',
    progress: 45,
    dueDate: '2023-12-15',
    members: ['4', '5'],
  },
  {
    id: '3',
    title: 'Database Migration',
    description: 'Migrate legacy customer data to the new cloud-based SQL infrastructure safely.',
    status: 'Completed',
    progress: 100,
    dueDate: '2023-10-01',
    members: ['2', '6'],
  },
  {
    id: '4',
    title: 'Q4 Marketing Campaign',
    description: 'Execute holiday season marketing strategy across social media and email channels.',
    status: 'Active',
    progress: 30,
    dueDate: '2023-12-25',
    members: ['1', '3', '5', '7'],
  },
  {
    id: '5',
    title: 'Internal Audit',
    description: 'Review security protocols and compliance standards for the engineering department.',
    status: 'Active',
    progress: 10,
    dueDate: '2024-01-20',
    members: ['8'],
  },
  {
    id: '6',
    title: 'Customer Portal',
    description: 'Develop a self-service portal for clients to manage their subscriptions.',
    status: 'On Hold',
    progress: 60,
    dueDate: '2024-02-15',
    members: ['2', '4'],
  }
];

export const Projects: React.FC = () => {
  const [filter, setFilter] = useState('All');
  const { t, dir } = useLanguage();

  const filteredProjects = filter === 'All' 
    ? initialProjects 
    : initialProjects.filter(p => p.status === filter);

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Briefcase className="w-5 h-5 text-brand" />
             <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">{t('proj.title')}</h1>
          </div>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] italic">{t('proj.subtitle')}</p>
        </div>
        <Button size="sm">
          <Plus className={cn("w-4 h-4", dir === 'rtl' ? "ml-2" : "mr-2")} />
          {t('proj.new')}
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="bg-obsidian-panel/40 border border-border p-4 flex flex-col sm:flex-row gap-4 items-center relative z-10" glass>
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
          <input 
            type="text" 
            placeholder={t('proj.search')}
            className="w-full bg-obsidian-outer border border-border rounded-sm pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2.5 text-xs font-medium text-zinc-text outline-none focus:border-brand/30 transition-all placeholder:text-zinc-muted/60"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto px-4 py-2 bg-obsidian-outer border border-border rounded-sm">
          <Filter className="w-4 h-4 text-zinc-muted" />
          <select 
            className="bg-transparent text-xs font-bold text-zinc-text outline-none cursor-pointer uppercase tracking-wide w-full"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">{t('proj.filter')}</option>
            <option value="Active">{t('proj.status.active')}</option>
            <option value="Completed">{t('proj.status.completed')}</option>
            <option value="On Hold">{t('proj.status.on_hold')}</option>
          </select>
        </div>
      </Card>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="flex flex-col h-full hover:border-brand/30 transition-all group duration-300">
            <div className="flex justify-between items-start mb-6">
              <span className={cn(
                "px-2.5 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest border",
                project.status === 'Active' ? 'bg-success/5 text-success border-success/20' :
                project.status === 'Completed' ? 'bg-info/5 text-info border-info/20' :
                'bg-warning/5 text-warning border-warning/20'
              )}>
                {project.status === 'Active' ? t('proj.status.active') : 
                 project.status === 'Completed' ? t('proj.status.completed') : 
                 t('proj.status.on_hold')}
              </span>
              <button className="text-zinc-muted hover:text-zinc-text transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            
            <h3 className="text-lg font-black text-zinc-text mb-2 group-hover:text-brand transition-colors uppercase italic tracking-tight">
              {project.title}
            </h3>
            <p className="text-xs font-medium text-zinc-muted leading-relaxed mb-8 flex-1">
              {project.description}
            </p>

            <div className="mt-auto space-y-5">
              <div>
                <div className="flex justify-between text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-2">
                  <span>{t('proj.progress')}</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-obsidian-outer rounded-full h-1.5 overflow-hidden border border-border" dir="ltr">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      project.progress === 100 ? 'bg-success shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-brand shadow-[0_0_8px_rgba(245,196,81,0.4)]'
                    )}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex -space-x-2 rtl:space-x-reverse">
                  {project.members.map((m, i) => (
                    <div 
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-obsidian-panel bg-obsidian-outer flex items-center justify-center text-[9px] font-black text-zinc-secondary shadow-sm"
                    >
                      {String.fromCharCode(65 + parseInt(m))}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-obsidian-panel bg-obsidian-outer flex items-center justify-center text-[9px] font-bold text-zinc-muted">
                    +
                  </div>
                </div>
                <div className="flex items-center text-[10px] font-bold text-zinc-muted uppercase tracking-tight">
                  <Calendar className="w-3.5 h-3.5 me-1.5 opacity-70" />
                  {project.dueDate}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
