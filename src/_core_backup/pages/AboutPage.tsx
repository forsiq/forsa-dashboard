import React, { useState, useMemo, useEffect } from 'react';
import { AmberCard as Card } from '../components/AmberCard';
import {
    ArrowLeft,
    FolderOpen,
    FileText,
    User,
    Hash,
    ChevronRight,
    Terminal,
    File,
    Layout,
    Globe,
    Cpu,
    Shield
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { AmberLogo } from '../components/AmberLogo';
import Link from 'next/link';
import { changelogData, ChangelogEntry } from '../data/changelog';
import { cn } from '../lib/utils/cn';

export const AboutPage: React.FC = () => {
    const { t, dir } = useLanguage();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const sortedVersions = useMemo(() => {
        return [...changelogData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, []);

    const latestVersion = sortedVersions[0];
    const [selectedFile, setSelectedFile] = useState<ChangelogEntry | null>(latestVersion);

    if (!isClient) return null;

    return (
        <div className="max-w-5xl mx-auto space-y-12 py-10 animate-in fade-in duration-700 px-4 relative" dir={dir}>

            {/* Return Navigation */}
            <div className={cn("absolute top-4 z-20", dir === 'rtl' ? 'right-4' : 'left-4')}>
                <Link href="/" className="flex items-center gap-2 text-[10px] font-black text-zinc-muted hover:text-zinc-text uppercase tracking-widest transition-colors bg-obsidian-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border hover:border-brand/20">
                    <ArrowLeft className={cn("w-3 h-3", dir === 'rtl' && 'rotate-180')} /> {t('about.return_home')}
                </Link>
            </div>

            {/* Brand Hero */}
            <div className="text-center space-y-8 pt-8">
                <div className="flex justify-center relative">
                    <div className="absolute inset-0 bg-brand/10 blur-[60px] rounded-full scale-150 animate-pulse pointer-events-none" />
                    <div className="p-6 bg-obsidian-panel border border-brand/20 rounded-3xl shadow-2xl relative z-10 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent pointer-events-none" />
                        <AmberLogo className="w-24 h-24 text-brand" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-5xl font-black text-zinc-text uppercase tracking-tighter leading-none">
                        ZoneVast <span className="text-brand">Template</span>
                    </h1>
                    <p className="text-sm text-zinc-muted font-bold uppercase tracking-[0.4em] opacity-80">
                        {t('about.hero.subtitle')}
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-black text-zinc-text uppercase tracking-widest">
                        <span>{t('about.hero.latest_build')}:</span>
                        <span className="text-brand font-mono">{latestVersion?.version}</span>
                    </div>
                </div>
            </div>

            {/* Core Directive */}
            <Card className="p-10 border-brand/10 bg-gradient-to-br from-obsidian-panel to-obsidian-card text-center relative overflow-hidden" glass>
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-[80px] rounded-full pointer-events-none" />
                <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                    <h3 className="text-brand uppercase tracking-[0.4em] text-[10px] font-black">
                        {t('about.directive.title')}
                    </h3>
                    <p className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
                        {t('about.directive.desc')}
                    </p>
                </div>
            </Card>

            {/* System Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { icon: Layout, title: t('about.features.core_systems'), desc: t('about.features.core_systems_desc') },
                    { icon: Globe, title: t('about.features.unified_data'), desc: t('about.features.unified_data_desc') },
                    { icon: Cpu, title: t('about.features.ai_insights'), desc: t('about.features.ai_insights_desc') },
                    { icon: Shield, title: t('about.features.secure_edge'), desc: t('about.features.secure_edge_desc') },
                ].map((feat, i) => (
                    <Card key={i} className="p-6 text-center hover:border-brand/20 transition-all group relative overflow-hidden" glass>
                        <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700">
                             <feat.icon className="w-24 h-24" />
                        </div>
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-obsidian-outer border border-border rounded-xl group-hover:bg-brand/10 group-hover:text-brand transition-colors text-zinc-muted shadow-inner">
                                <feat.icon className="w-5 h-5" />
                            </div>
                        </div>
                        <h4 className="text-xs font-black text-zinc-text uppercase tracking-widest mb-1 leading-tight">{feat.title}</h4>
                        <p className="text-[10px] font-bold text-zinc-muted uppercase leading-relaxed">{feat.desc}</p>
                    </Card>
                ))}
            </div>

            {/* VERSION FOLDER VIEW */}
            <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2 px-2">
                    <div className="p-1.5 bg-brand/10 rounded-lg">
                        <FolderOpen className="w-4 h-4 text-brand" />
                    </div>
                    <h3 className="text-xs font-black text-zinc-text uppercase tracking-[0.4em]">{t('about.history.title')}</h3>
                </div>

                <Card noPadding className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden shadow-2xl h-[600px] border-white/5 bg-obsidian-panel" glass>

                    {/* File Explorer (Left Pane) */}
                    <div className={cn("lg:col-span-4 bg-obsidian-outer/30 flex flex-col h-full", dir === 'rtl' ? 'border-l border-white/5' : 'border-r border-white/5')}>
                        {/* Folder Header */}
                        <div className="p-4 border-b border-white/5 flex items-center gap-2 text-zinc-muted bg-white/[0.02] shrink-0">
                            <Terminal className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-mono tracking-tight">~/zonevast/template/changelog/</span>
                        </div>

                        {/* File List */}
                        <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
                            {sortedVersions.map((file) => (
                                <button
                                    key={file.version}
                                    onClick={() => setSelectedFile(file)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 transition-all text-left group hover:bg-white/[0.03]",
                                        selectedFile?.version === file.version
                                            ? "bg-brand/5 " + (dir === 'rtl' ? "border-r-2 border-r-brand" : "border-l-2 border-l-brand")
                                            : (dir === 'rtl' ? "border-r-2 border-r-transparent" : "border-l-2 border-l-transparent text-zinc-muted")
                                    )}
                                >
                                    <FileText className={cn(
                                        "w-4 h-4 transition-colors shrink-0",
                                        selectedFile?.version === file.version ? "text-brand" : "text-zinc-muted/60 group-hover:text-zinc-text"
                                    )} />
                                    <div className="flex-1 min-w-0">
                                        <p className={cn(
                                            "text-[11px] font-bold truncate font-mono tracking-tighter",
                                            selectedFile?.version === file.version ? "text-brand" : "text-zinc-muted group-hover:text-zinc-text"
                                        )}>
                                            {file.fileName}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-zinc-muted/50 font-bold">{file.date}</span>
                                            <span className={cn(
                                                "text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-tighter",
                                                file.type === 'Major' ? 'bg-brand/20 text-brand' : 'bg-white/5 text-zinc-muted/40'
                                            )}>
                                                {file.type}
                                            </span>
                                        </div>
                                    </div>
                                    {selectedFile?.version === file.version && (
                                        <ChevronRight className={cn("w-3 h-3 text-brand shrink-0", dir === 'rtl' && 'rotate-180')} />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Folder Status Bar */}
                        <div className="p-3 border-t border-white/5 text-[10px] font-mono text-zinc-muted/40 text-center uppercase tracking-widest shrink-0">
                            {sortedVersions.length} {t('about.history.objects_found')}
                        </div>
                    </div>

                    {/* Preview Pane (Right Pane) */}
                    <div className="lg:col-span-8 bg-obsidian-panel/40 flex flex-col h-full relative overflow-hidden">
                        {selectedFile ? (
                            <>
                                {/* File Header */}
                                <div className="h-12 border-b border-white/5 flex items-center justify-between px-6 bg-white/[0.01] shrink-0">
                                    <div className="flex items-center gap-3">
                                        <File className="w-3.5 h-3.5 text-zinc-muted/40" />
                                        <span className="text-xs font-bold text-zinc-text uppercase tracking-tight">{selectedFile.title}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-muted/40">
                                        <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> {selectedFile.hash}</span>
                                        <span className="flex items-center gap-1 hidden sm:flex"><User className="w-3 h-3" /> {selectedFile.author}</span>
                                    </div>
                                </div>

                                {/* File Content (Markdown Render) */}
                                <div className="flex-1 p-8 overflow-y-auto bg-obsidian-outer/[0.15] custom-scrollbar">
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        <div className="whitespace-pre-wrap font-sans text-zinc-secondary leading-relaxed">
                                            {selectedFile.content.split('\n').map((line, i) => {
                                                if (line.startsWith('# ')) {
                                                    return <h1 key={i} className="text-2xl font-black text-white uppercase tracking-tight mb-6 pb-2 border-b border-white/10">{line.replace('# ', '')}</h1>;
                                                }
                                                if (line.startsWith('## ')) {
                                                    return <h2 key={i} className="text-lg font-bold text-brand mt-8 mb-3">{line.replace('## ', '')}</h2>;
                                                }
                                                if (line.startsWith('- ')) {
                                                    return (
                                                        <div key={i} className="flex gap-3 mb-2 ml-1">
                                                            <span className="text-brand mt-1.5">•</span>
                                                            <span className="text-zinc-muted font-medium">{line.replace('- ', '')}</span>
                                                        </div>
                                                    );
                                                }
                                                if (line.trim() === '') {
                                                    return <br key={i} />;
                                                }
                                                return <p key={i} className="mb-2 text-zinc-muted/80">{line}</p>;
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-3 border-t border-white/5 bg-white/[0.01] flex justify-between items-center text-[10px] font-mono text-zinc-muted/30 shrink-0">
                                    <span>{t('about.history.utf8')}</span>
                                    <span>{t('about.history.markdown')}</span>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-zinc-muted gap-4 opacity-50">
                                <FolderOpen className="w-16 h-16 stroke-1" />
                                <p className="text-xs uppercase tracking-widest">{t('about.history.select_file')}</p>
                            </div>
                        )}
                    </div>
                </Card>
            </section>

            {/* Footer */}
            <div className="pt-12 border-t border-white/5 text-center">
                <p className="text-[10px] text-zinc-muted/20 font-bold uppercase tracking-[1em]">
                    ZoneVast Template © 2026
                </p>
            </div>
        </div>
    );
};
