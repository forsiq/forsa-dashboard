
import React, { useState, useMemo } from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { AmberSlideOver } from '../../../amber-ui/components/AmberSlideOver';
import { AmberInput } from '../../../amber-ui/components/AmberInput';
import { AmberDropdown } from '../../../amber-ui/components/AmberDropdown';
import { 
  Megaphone, 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  MessageSquare, 
  Bell, 
  Play, 
  Pause, 
  MoreVertical, 
  Trash2, 
  Copy, 
  Download, 
  CheckCircle2, 
  Clock, 
  Users, 
  Calendar,
  Send,
  Eye,
  ChevronRight,
  ChevronLeft,
  Check
} from 'lucide-react';
import { cn } from '../../../lib/cn';

// --- Types ---
type CampaignType = 'Email' | 'SMS' | 'Push';
type CampaignStatus = 'Draft' | 'Scheduled' | 'Active' | 'Completed' | 'Paused';

interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  audienceSize: number;
  sentDate: string | null;
  openRate: number; // Percentage
  clickRate: number; // Percentage
  subject?: string;
  content: string;
  segment: string;
}

// --- Mock Data ---
const MOCK_CAMPAIGNS: Campaign[] = [
  { id: 'CMP-1001', name: 'Summer Sale Kickoff', type: 'Email', status: 'Completed', audienceSize: 12500, sentDate: '2025-05-15', openRate: 24.5, clickRate: 4.2, subject: 'Summer Savings Start Now! ☀️', content: '...', segment: 'All Users' },
  { id: 'CMP-1002', name: 'Cart Abandonment Recovery', type: 'Email', status: 'Active', audienceSize: 450, sentDate: 'Recurring', openRate: 45.2, clickRate: 12.8, subject: 'Did you forget something?', content: '...', segment: 'Abandoned Cart' },
  { id: 'CMP-1003', name: 'Flash Sale Alert', type: 'SMS', status: 'Scheduled', audienceSize: 5000, sentDate: '2025-05-25', openRate: 0, clickRate: 0, content: 'Flash Sale! 50% off for next 2 hours. Code: FLASH50', segment: 'SMS Subscribers' },
  { id: 'CMP-1004', name: 'New Feature Announcement', type: 'Push', status: 'Draft', audienceSize: 22000, sentDate: null, openRate: 0, clickRate: 0, content: 'Check out the new dark mode!', segment: 'Active Users' },
  { id: 'CMP-1005', name: 'Weekly Newsletter', type: 'Email', status: 'Paused', audienceSize: 15000, sentDate: null, openRate: 18.5, clickRate: 2.1, subject: 'Weekly Digest', content: '...', segment: 'Newsletter List' },
];

const SEGMENTS = [
  { label: 'All Users', value: 'All Users', count: 25400 },
  { label: 'VIP Customers', value: 'VIP', count: 1200 },
  { label: 'New Signups (30d)', value: 'New Users', count: 850 },
  { label: 'Inactive (90d)', value: 'Inactive', count: 5400 },
  { label: 'SMS Subscribers', value: 'SMS Subscribers', count: 5000 },
];

export const Campaigns = () => {
  // --- State ---
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Campaign>>({
    name: '',
    type: 'Email',
    status: 'Draft',
    segment: '',
    subject: '',
    content: '',
    sentDate: '' // used for schedule date
  });

  // --- Handlers ---

  const handleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredCampaigns.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredCampaigns.map(c => c.id)));
  };

  const handleBulkAction = (action: string) => {
    if (action === 'Delete') {
       if (confirm(`Delete ${selectedIds.size} campaigns?`)) {
          setCampaigns(prev => prev.filter(c => !selectedIds.has(c.id)));
          setSelectedIds(new Set());
       }
    } else {
       alert(`${action} action triggered for ${selectedIds.size} items`);
       setSelectedIds(new Set());
    }
  };

  const handleSaveCampaign = () => {
    const newCampaign: Campaign = {
       id: `CMP-${Math.floor(Date.now() / 1000)}`,
       name: formData.name || 'Untitled Campaign',
       type: (formData.type as CampaignType) || 'Email',
       status: formData.sentDate ? 'Scheduled' : 'Draft',
       audienceSize: SEGMENTS.find(s => s.value === formData.segment)?.count || 0,
       sentDate: formData.sentDate || null,
       openRate: 0,
       clickRate: 0,
       subject: formData.subject,
       content: formData.content || '',
       segment: formData.segment || 'All Users'
    };
    setCampaigns([newCampaign, ...campaigns]);
    setIsWizardOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', type: 'Email', status: 'Draft', segment: '', subject: '', content: '', sentDate: '' });
    setWizardStep(1);
  };

  // --- Filter Logic ---
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = typeFilter === 'All' || c.type === typeFilter;
      const matchStatus = statusFilter === 'All' || c.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [campaigns, searchQuery, typeFilter, statusFilter]);

  // --- Render Helpers ---
  const getTypeIcon = (type: CampaignType) => {
     switch(type) {
        case 'Email': return <Mail className="w-4 h-4" />;
        case 'SMS': return <MessageSquare className="w-4 h-4" />;
        case 'Push': return <Bell className="w-4 h-4" />;
     }
  };

  const getStatusColor = (status: CampaignStatus) => {
     switch(status) {
        case 'Active': return 'text-brand bg-brand/10 border-brand/20';
        case 'Completed': return 'text-success bg-success/10 border-success/20';
        case 'Scheduled': return 'text-info bg-info/10 border-info/20';
        case 'Paused': return 'text-warning bg-warning/10 border-warning/20';
        default: return 'text-zinc-muted bg-white/5 border-white/10';
     }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-6 animate-fade-up">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Megaphone className="w-5 h-5 text-brand" />
             <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Campaigns</h1>
          </div>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Multi-channel marketing automation</p>
        </div>
        <div className="flex gap-2">
          <AmberButton variant="ghost" size="sm">
             <Download className="w-3.5 h-3.5 mr-2" /> Export
          </AmberButton>
          <AmberButton size="sm" onClick={() => { resetForm(); setIsWizardOpen(true); }}>
             <Plus className="w-3.5 h-3.5 mr-2" /> Create Campaign
          </AmberButton>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-obsidian-panel border border-white/5 rounded-sm p-4 flex flex-col xl:flex-row gap-4 items-end shrink-0 relative z-20">
         <div className="flex-1 w-full">
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
               <input 
                 type="text" 
                 placeholder="Search campaigns..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30"
               />
            </div>
         </div>
         <AmberDropdown 
            label="Type"
            options={['All', 'Email', 'SMS', 'Push'].map(t => ({label: t, value: t}))}
            value={typeFilter}
            onChange={setTypeFilter}
            className="w-full xl:w-40"
         />
         <AmberDropdown 
            label="Status"
            options={['All', 'Draft', 'Scheduled', 'Active', 'Paused', 'Completed'].map(s => ({label: s, value: s}))}
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-full xl:w-40"
         />
         <button className="h-10 px-4 bg-obsidian-card border border-white/5 text-zinc-muted hover:text-zinc-text transition-all rounded-sm flex items-center justify-center hover:bg-white/5">
            <Filter className="w-4 h-4" />
         </button>
      </div>

      {/* Bulk Actions */}
      <div className={cn(
         "fixed bottom-6 left-1/2 -translate-x-1/2 bg-obsidian-card border border-white/10 shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 z-40 transition-all duration-300",
         selectedIds.size > 0 ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
      )}>
         <span className="text-[10px] font-black text-zinc-text uppercase tracking-widest border-r border-white/10 pr-6">
            {selectedIds.size} Selected
         </span>
         <div className="flex items-center gap-2">
            <button onClick={() => handleBulkAction('Pause')} className="p-2 text-zinc-muted hover:text-warning transition-colors rounded-full hover:bg-white/5" title="Pause">
               <Pause className="w-4 h-4" />
            </button>
            <button onClick={() => handleBulkAction('Resume')} className="p-2 text-zinc-muted hover:text-success transition-colors rounded-full hover:bg-white/5" title="Resume">
               <Play className="w-4 h-4" />
            </button>
            <button onClick={() => handleBulkAction('Delete')} className="p-2 text-zinc-muted hover:text-danger transition-colors rounded-full hover:bg-white/5" title="Delete">
               <Trash2 className="w-4 h-4" />
            </button>
         </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden bg-obsidian-panel border border-white/5 rounded-sm flex flex-col shadow-xl">
         <div className="overflow-x-auto flex-1">
            <table className="w-full text-left min-w-[1000px]">
               <thead className="bg-obsidian-outer/50 border-b border-white/5 text-[9px] font-black text-zinc-muted uppercase tracking-widest sticky top-0 z-10">
                  <tr>
                     <th className="w-12 px-6 py-4 text-center">
                        <button onClick={handleSelectAll} className="hover:text-brand transition-colors">
                           {selectedIds.size > 0 && selectedIds.size === filteredCampaigns.length ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 border border-zinc-muted rounded-sm" />}
                        </button>
                     </th>
                     <th className="px-6 py-4">Campaign Name</th>
                     <th className="px-6 py-4">Type</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4 text-center">Audience</th>
                     <th className="px-6 py-4">Sent Date</th>
                     <th className="px-6 py-4 text-center">Performance</th>
                     <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/[0.03]">
                  {filteredCampaigns.map(campaign => (
                     <tr key={campaign.id} className={cn("hover:bg-white/[0.02] transition-colors group", selectedIds.has(campaign.id) && "bg-brand/[0.03]")}>
                        <td className="px-6 py-4 text-center">
                           <button onClick={() => handleSelect(campaign.id)}>
                              {selectedIds.has(campaign.id) ? <CheckCircle2 className="w-4 h-4 text-brand" /> : <div className="w-4 h-4 border border-white/20 rounded-sm" />}
                           </button>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col">
                              <span 
                                className="text-xs font-bold text-zinc-text group-hover:text-brand transition-colors cursor-pointer"
                                onClick={() => { setSelectedCampaign(campaign); setIsDetailOpen(true); }}
                              >
                                 {campaign.name}
                              </span>
                              <span className="text-[9px] font-mono text-zinc-muted">{campaign.id}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2 text-zinc-secondary text-[10px] font-bold">
                              {getTypeIcon(campaign.type)}
                              {campaign.type}
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-sm border uppercase tracking-widest", getStatusColor(campaign.status))}>
                              {campaign.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className="text-xs font-bold text-zinc-text">{campaign.audienceSize.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 text-[10px] text-zinc-muted font-bold">
                           {campaign.sentDate || 'Not sent'}
                        </td>
                        <td className="px-6 py-4">
                           {campaign.status !== 'Draft' && campaign.status !== 'Scheduled' ? (
                              <div className="flex flex-col gap-1 w-24 mx-auto">
                                 <div className="flex justify-between text-[8px] font-black text-zinc-muted uppercase">
                                    <span>Open</span>
                                    <span>{campaign.openRate}%</span>
                                 </div>
                                 <div className="h-1 bg-obsidian-outer rounded-full overflow-hidden">
                                    <div className="h-full bg-brand" style={{ width: `${campaign.openRate}%` }} />
                                 </div>
                                 <div className="flex justify-between text-[8px] font-black text-zinc-muted uppercase mt-0.5">
                                    <span>Click</span>
                                    <span>{campaign.clickRate}%</span>
                                 </div>
                                 <div className="h-1 bg-obsidian-outer rounded-full overflow-hidden">
                                    <div className="h-full bg-info" style={{ width: `${campaign.clickRate}%` }} />
                                 </div>
                              </div>
                           ) : (
                              <div className="text-center text-[9px] text-zinc-muted italic">No data yet</div>
                           )}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setSelectedCampaign(campaign); setIsDetailOpen(true); }} className="p-1.5 hover:bg-white/5 rounded-sm text-zinc-muted hover:text-zinc-text"><Eye className="w-3.5 h-3.5" /></button>
                              <button className="p-1.5 hover:bg-white/5 rounded-sm text-zinc-muted hover:text-brand"><Copy className="w-3.5 h-3.5" /></button>
                              <button className="p-1.5 hover:bg-white/5 rounded-sm text-zinc-muted hover:text-zinc-text"><MoreVertical className="w-3.5 h-3.5" /></button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Campaign Wizard SlideOver */}
      <AmberSlideOver
         isOpen={isWizardOpen}
         onClose={() => setIsWizardOpen(false)}
         title="Create Campaign"
         description={`Step ${wizardStep} of 4: ${wizardStep === 1 ? 'Details' : wizardStep === 2 ? 'Audience' : wizardStep === 3 ? 'Content' : 'Review'}`}
         footer={
            <div className="flex justify-between w-full">
               {wizardStep > 1 ? (
                  <AmberButton variant="ghost" onClick={() => setWizardStep(c => c - 1)}><ChevronLeft className="w-3.5 h-3.5 mr-2" /> Back</AmberButton>
               ) : (
                  <AmberButton variant="ghost" onClick={() => setIsWizardOpen(false)}>Cancel</AmberButton>
               )}
               
               {wizardStep < 4 ? (
                  <AmberButton onClick={() => setWizardStep(c => c + 1)}>Next <ChevronRight className="w-3.5 h-3.5 ml-2" /></AmberButton>
               ) : (
                  <AmberButton onClick={handleSaveCampaign} className="bg-success text-white hover:bg-success/90 border-transparent">Launch Campaign <Send className="w-3.5 h-3.5 ml-2" /></AmberButton>
               )}
            </div>
         }
      >
         <div className="space-y-6">
            {/* Step 1: Info */}
            {wizardStep === 1 && (
               <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <AmberInput 
                     label="Campaign Name"
                     placeholder="e.g. Summer Promo 2025"
                     value={formData.name}
                     onChange={(e) => setFormData({...formData, name: e.target.value})}
                     autoFocus
                  />
                  <div>
                     <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Channel Type</label>
                     <div className="grid grid-cols-3 gap-3">
                        {['Email', 'SMS', 'Push'].map((t) => (
                           <button
                              key={t}
                              onClick={() => setFormData({...formData, type: t as CampaignType})}
                              className={cn(
                                 "flex flex-col items-center justify-center gap-2 p-4 rounded-sm border transition-all",
                                 formData.type === t ? "bg-brand/10 border-brand/30 text-brand" : "bg-obsidian-outer border-white/5 text-zinc-muted hover:text-zinc-text"
                              )}
                           >
                              {getTypeIcon(t as CampaignType)}
                              <span className="text-[10px] font-bold uppercase tracking-widest">{t}</span>
                           </button>
                        ))}
                     </div>
                  </div>
                  <AmberInput 
                     label="Description (Internal)"
                     multiline
                     rows={3}
                     placeholder="Goals, target ROI, etc."
                  />
               </div>
            )}

            {/* Step 2: Audience */}
            {wizardStep === 2 && (
               <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div>
                     <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Target Segment</label>
                     <AmberDropdown 
                        options={SEGMENTS.map(s => ({label: `${s.label} (${s.count.toLocaleString()})`, value: s.value}))}
                        value={formData.segment || ''}
                        onChange={(val) => setFormData({...formData, segment: val})}
                        className="w-full"
                        placeholder="Select Audience..."
                     />
                  </div>
                  
                  {formData.segment && (
                     <div className="p-4 bg-obsidian-outer border border-white/5 rounded-sm flex items-center justify-between">
                        <div>
                           <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">Estimated Audience</p>
                           <p className="text-2xl font-black text-zinc-text mt-1">{SEGMENTS.find(s => s.value === formData.segment)?.count.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-full text-zinc-muted">
                           <Users className="w-6 h-6" />
                        </div>
                     </div>
                  )}

                  <div className="p-4 border border-dashed border-white/10 rounded-sm text-center">
                     <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest mb-2">Exclude Segments</p>
                     <p className="text-xs text-zinc-secondary italic">Suppression lists can be configured in Audience Settings.</p>
                  </div>
               </div>
            )}

            {/* Step 3: Content */}
            {wizardStep === 3 && (
               <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  {formData.type === 'Email' && (
                     <AmberInput 
                        label="Subject Line"
                        placeholder="Great deals inside..."
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                     />
                  )}
                  
                  <div>
                     <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">
                        {formData.type === 'Email' ? 'Email Body' : 'Message Content'}
                     </label>
                     <div className="w-full bg-obsidian-outer border border-white/5 rounded-sm overflow-hidden focus-within:border-brand/30 transition-all">
                        {formData.type === 'Email' && (
                           <div className="flex items-center gap-1 p-2 border-b border-white/5 bg-white/[0.02]">
                              {['B', 'I', 'Link', 'Img', 'Var'].map(tool => (
                                 <button key={tool} className="px-2 py-1 text-[9px] font-bold text-zinc-muted hover:bg-white/5 hover:text-zinc-text rounded-sm uppercase">{tool}</button>
                              ))}
                           </div>
                        )}
                        <textarea 
                           rows={formData.type === 'Email' ? 10 : 4}
                           className="w-full bg-transparent p-4 text-xs font-medium text-zinc-text outline-none resize-none placeholder:text-zinc-muted/40 font-mono"
                           placeholder="Enter your content here..."
                           value={formData.content}
                           onChange={(e) => setFormData({...formData, content: e.target.value})}
                        />
                        <div className="px-4 py-2 border-t border-white/5 text-[9px] font-mono text-zinc-muted text-right">
                           {formData.content?.length || 0} chars
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* Step 4: Schedule */}
            {wizardStep === 4 && (
               <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="p-4 bg-obsidian-outer border border-white/5 rounded-sm space-y-4">
                     <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest border-b border-white/5 pb-2">Campaign Summary</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <p className="text-[9px] font-bold text-zinc-muted uppercase">Name</p>
                           <p className="text-xs text-zinc-text">{formData.name}</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-bold text-zinc-muted uppercase">Channel</p>
                           <p className="text-xs text-zinc-text">{formData.type}</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-bold text-zinc-muted uppercase">Audience</p>
                           <p className="text-xs text-zinc-text">{formData.segment}</p>
                        </div>
                        {formData.type === 'Email' && (
                           <div>
                              <p className="text-[9px] font-bold text-zinc-muted uppercase">Subject</p>
                              <p className="text-xs text-zinc-text truncate">{formData.subject}</p>
                           </div>
                        )}
                     </div>
                  </div>

                  <div>
                     <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Schedule Delivery</label>
                     <div className="grid grid-cols-2 gap-4">
                        <button 
                           onClick={() => setFormData({...formData, sentDate: ''})}
                           className={cn(
                              "p-3 rounded-sm border text-center transition-all",
                              !formData.sentDate ? "bg-brand/10 border-brand text-brand" : "bg-obsidian-outer border-white/5 text-zinc-muted"
                           )}
                        >
                           <p className="text-xs font-bold uppercase">Send Now</p>
                           <p className="text-[9px] opacity-70">Immediate delivery</p>
                        </button>
                        <button 
                           className={cn(
                              "p-3 rounded-sm border text-center transition-all",
                              formData.sentDate ? "bg-brand/10 border-brand text-brand" : "bg-obsidian-outer border-white/5 text-zinc-muted"
                           )}
                        >
                           <p className="text-xs font-bold uppercase">Schedule</p>
                           <input 
                              type="date" 
                              className="bg-transparent border-none text-[9px] text-center w-full outline-none mt-1 p-0 h-auto"
                              onChange={(e) => setFormData({...formData, sentDate: e.target.value})}
                           />
                        </button>
                     </div>
                  </div>

                  <div className="p-4 border border-dashed border-white/10 rounded-sm flex items-center justify-between">
                     <span className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">Send Test Preview</span>
                     <AmberButton size="sm" variant="ghost">Send Test</AmberButton>
                  </div>
               </div>
            )}
         </div>
      </AmberSlideOver>

      {/* Details SlideOver */}
      <AmberSlideOver
         isOpen={isDetailOpen}
         onClose={() => setIsDetailOpen(false)}
         title="Campaign Details"
         description={selectedCampaign?.name}
         footer={
            <div className="flex justify-end gap-2 w-full">
               <AmberButton variant="secondary" onClick={() => setIsDetailOpen(false)}>Close</AmberButton>
               <AmberButton onClick={() => alert('Editing is disabled for active campaigns.')} disabled={selectedCampaign?.status !== 'Draft'}>Edit Campaign</AmberButton>
            </div>
         }
      >
         {selectedCampaign && (
            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <AmberCard className="p-4 text-center border-brand/20 bg-brand/5">
                     <p className="text-[9px] font-black text-brand uppercase tracking-widest mb-1">Open Rate</p>
                     <p className="text-2xl font-black text-zinc-text">{selectedCampaign.openRate}%</p>
                  </AmberCard>
                  <AmberCard className="p-4 text-center border-info/20 bg-info/5">
                     <p className="text-[9px] font-black text-info uppercase tracking-widest mb-1">Click Rate</p>
                     <p className="text-2xl font-black text-zinc-text">{selectedCampaign.clickRate}%</p>
                  </AmberCard>
               </div>

               <div className="p-4 bg-obsidian-outer border border-white/5 rounded-sm space-y-4">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                     <span className="text-[10px] font-bold text-zinc-muted uppercase">Status</span>
                     <span className={cn("text-[10px] font-black uppercase tracking-widest", getStatusColor(selectedCampaign.status).split(' ')[0])}>{selectedCampaign.status}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                     <span className="text-[10px] font-bold text-zinc-muted uppercase">Sent Date</span>
                     <span className="text-[10px] font-mono text-zinc-text">{selectedCampaign.sentDate || 'Pending'}</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-[10px] font-bold text-zinc-muted uppercase">Audience</span>
                     <span className="text-[10px] font-mono text-zinc-text">{selectedCampaign.audienceSize.toLocaleString()}</span>
                  </div>
               </div>

               <div>
                  <h4 className="text-[10px] font-black text-zinc-text uppercase tracking-widest mb-2">Content Preview</h4>
                  <div className="p-4 bg-white text-black rounded-sm min-h-[150px] text-sm">
                     {selectedCampaign.type === 'Email' && <h3 className="font-bold mb-2 border-b pb-2">{selectedCampaign.subject}</h3>}
                     <p className="whitespace-pre-wrap font-serif">{selectedCampaign.content || 'No content preview available.'}</p>
                  </div>
               </div>
            </div>
         )}
      </AmberSlideOver>
    </div>
  );
};
