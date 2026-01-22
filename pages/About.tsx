
import React, { useState, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { 
  ArrowLeft,
  FolderOpen,
  FileText,
  User,
  Hash,
  ChevronRight,
  Terminal,
  File,
  Zap,
  ShieldCheck,
  Globe,
  Database
} from 'lucide-react';
import { useLanguage } from '../amber-ui/contexts/LanguageContext';
import { Logo } from '../components/Logo';
import { Link } from 'react-router-dom';
import { changelogData, ChangelogEntry } from '../data/changelog';
import { cn } from '../lib/cn';

export const About: React.FC = () => {
  const { t } = useLanguage();
  
  // 1. Automatically read and sort the "folder" (data source)
  // Sorting descending by date to find the last (latest) version
  const sortedVersions = useMemo(() => {
    return [...changelogData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, []);

  const latestVersion = sortedVersions[0];
  const [selectedFile, setSelectedFile] = useState<ChangelogEntry | null>(latestVersion);

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-10 animate-fade-up px-4 relative">
      
      {/* Return Navigation */}
      <div className="absolute top-4 left-4 z-20">
        <Link to="/" className="flex items-center gap-2 text-[10px] font-black text-zinc-muted hover:text-zinc-text uppercase tracking-widest transition-colors bg-obsidian-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/5 hover:border-brand/20">
          <ArrowLeft className="w-3 h-3" /> Return Home
        </Link>
      </div>

      {/* Brand Hero */}
      <div className="text-center space-y-8 pt-8">
        <div className="flex justify-center relative">
          <div className="absolute inset-0 bg-brand/20 blur-[60px] rounded-full scale-150 animate-pulse pointer-events-none" />
          <div className="p-6 bg-obsidian-panel border border-brand/20 rounded-3xl shadow-2xl relative z-10">
            <Logo className="w-24 h-24" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl font-black text-zinc-text uppercase tracking-tighter italic leading-none">
            ZoneVast <span className="text-brand">Enterprise</span>
          </h1>
          <p className="text-xs text-zinc-muted font-bold uppercase tracking-[0.4em] opacity-80">
            Distributed Service Orchestration Platform
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-zinc-text uppercase tracking-widest">
            <span>Latest Build:</span>
            <span className="text-brand">{latestVersion?.version}</span>
          </div>
        </div>
      </div>

      {/* Core Directive */}
      <Card className="p-10 border-brand/10 bg-gradient-to-br from-obsidian-panel to-obsidian-outer text-center relative overflow-hidden" glass>
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <h3 className="text-brand uppercase tracking-[0.4em] text-[10px] font-black">
            Core Directive
          </h3>
          <p className="text-2xl md:text-3xl font-black text-zinc-text leading-tight italic tracking-tight">
            "To provide a globally distributed orchestration layer for enterprise metadata, ensuring zero-conflict synchronization across all business nodes."
          </p>
        </div>
      </Card>

      {/* System Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Globe, title: 'Global Mesh', desc: '14 Regions, <14ms Latency' },
          { icon: ShieldCheck, title: 'Obsidian Auth', desc: 'AES-256 Encryption Standard' },
          { icon: Zap, title: 'Neural Sync', desc: 'Predictive Edge Caching' },
          { icon: Database, title: 'Ledger Integrity', desc: 'Immutable Audit Trails' },
        ].map((feat, i) => (
          <Card key={i} className="p-6 text-center hover:border-brand/20 transition-all group" glass>
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-obsidian-outer border border-white/5 rounded-full group-hover:bg-brand/10 group-hover:text-brand transition-colors text-zinc-muted">
                <feat.icon className="w-5 h-5" />
              </div>
            </div>
            <h4 className="text-xs font-black text-zinc-text uppercase tracking-widest mb-1">{feat.title}</h4>
            <p className="text-[10px] font-bold text-zinc-muted uppercase">{feat.desc}</p>
          </Card>
        ))}
      </div>

      {/* VERSION FOLDER VIEW */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-2 px-2">
          <FolderOpen className="w-5 h-5 text-brand" />
          <h3 className="text-xs font-black text-zinc-text uppercase tracking-[0.4em] italic">System Version History</h3>
        </div>

        <Card noPadding className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden shadow-2xl h-[600px]">
          
          {/* File Explorer (Left Pane) */}
          <div className="lg:col-span-4 border-r border-white/5 bg-obsidian-outer/50 flex flex-col h-full">
            {/* Folder Header */}
            <div className="p-4 border-b border-white/5 flex items-center gap-2 text-zinc-muted bg-white/[0.02] shrink-0">
              <Terminal className="w-4 h-4" />
              <span className="text-[10px] font-mono">~/zonevast/changelog/</span>
            </div>
            
            {/* File List */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {sortedVersions.map((file) => (
                <button
                  key={file.version}
                  onClick={() => setSelectedFile(file)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 border-b border-white/[0.02] transition-all text-left group hover:bg-white/[0.03]",
                    selectedFile?.version === file.version ? "bg-brand/5 border-l-2 border-l-brand" : "border-l-2 border-l-transparent"
                  )}
                >
                  <FileText className={cn(
                    "w-4 h-4 transition-colors shrink-0",
                    selectedFile?.version === file.version ? "text-brand" : "text-zinc-muted group-hover:text-zinc-text"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-[11px] font-bold truncate font-mono",
                      selectedFile?.version === file.version ? "text-brand" : "text-zinc-text"
                    )}>
                      {file.fileName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-zinc-muted">{file.date}</span>
                      <span className={cn(
                        "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter",
                        file.type === 'Major' ? 'bg-brand/20 text-brand' : 'bg-white/5 text-zinc-muted'
                      )}>
                        {file.type}
                      </span>
                    </div>
                  </div>
                  {selectedFile?.version === file.version && (
                    <ChevronRight className="w-3 h-3 text-brand shrink-0" />
                  )}
                </button>
              ))}
            </div>
            
            {/* Folder Status Bar */}
            <div className="p-2 border-t border-white/5 text-[9px] font-mono text-zinc-muted text-center uppercase shrink-0">
              {sortedVersions.length} Objects Found
            </div>
          </div>

          {/* Preview Pane (Right Pane) */}
          <div className="lg:col-span-8 bg-obsidian-panel flex flex-col h-full relative overflow-hidden">
            {selectedFile ? (
              <>
                {/* File Header */}
                <div className="h-12 border-b border-white/5 flex items-center justify-between px-6 bg-white/[0.02] shrink-0">
                  <div className="flex items-center gap-3">
                    <File className="w-4 h-4 text-zinc-muted" />
                    <span className="text-xs font-bold text-zinc-text">{selectedFile.title}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-muted">
                    <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> {selectedFile.hash}</span>
                    <span className="flex items-center gap-1 hidden sm:flex"><User className="w-3 h-3" /> {selectedFile.author}</span>
                  </div>
                </div>

                {/* File Content (Mock Markdown Render) */}
                <div className="flex-1 p-8 overflow-y-auto bg-obsidian-outer/20 custom-scrollbar">
                  <div className="prose prose-invert prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-zinc-secondary leading-relaxed">
                      {selectedFile.content.split('\n').map((line, i) => {
                        if (line.startsWith('# ')) {
                          return <h1 key={i} className="text-2xl font-black text-zinc-text uppercase tracking-tight mb-6 pb-2 border-b border-white/10">{line.replace('# ', '')}</h1>;
                        }
                        if (line.startsWith('## ')) {
                          return <h2 key={i} className="text-lg font-bold text-brand mt-8 mb-3">{line.replace('## ', '')}</h2>;
                        }
                        if (line.startsWith('- ')) {
                          return (
                            <div key={i} className="flex gap-3 mb-2 ml-1">
                              <span className="text-brand mt-1.5">•</span>
                              <span>{line.replace('- ', '')}</span>
                            </div>
                          );
                        }
                        if (line.trim() === '') {
                          return <br key={i} />;
                        }
                        return <p key={i} className="mb-2">{line}</p>;
                      })}
                    </pre>
                  </div>
                </div>
                
                <div className="px-6 py-3 border-t border-white/5 bg-white/[0.02] flex justify-between items-center text-[10px] font-mono text-zinc-muted shrink-0">
                   <span>UTF-8</span>
                   <span>Markdown</span>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-muted gap-4 opacity-50">
                <FolderOpen className="w-16 h-16 stroke-1" />
                <p className="text-xs uppercase tracking-widest">Select a file to view content</p>
              </div>
            )}
          </div>
        </Card>
      </section>

      {/* Footer */}
      <div className="pt-12 border-t border-white/5 text-center">
        <p className="text-[10px] text-zinc-muted font-bold uppercase tracking-[0.6em] opacity-30 italic">
          ZoneVast Enterprise Labs © 2025
        </p>
      </div>
    </div>
  );
};
