
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Linkedin, 
  Twitter, 
  Plus, 
  MoreVertical,
  Edit,
  Trash2,
  PhoneCall,
  Calendar,
  MessageSquare,
  Briefcase,
  FileText,
  CheckSquare,
  Clock,
  DollarSign,
  TrendingUp,
  Tag,
  X,
  Paperclip,
  User,
  History
} from 'lucide-react';
import { cn } from '../../../lib/cn';
import { paths } from '../../../routes/paths';

// --- Mock Data ---
const CUSTOMER = {
  id: 'CUST-1001',
  name: 'Alex Morgan',
  role: 'Procurement Manager',
  company: 'Acme Corporation',
  status: 'Active',
  avatar: 'AM',
  contact: {
    email: 'alex.morgan@acme.corp',
    phone: '+1 (555) 012-3456',
    mobile: '+1 (555) 987-6543',
    website: 'www.acme.corp',
    address: '123 Tech Plaza, Suite 400, San Francisco, CA 94107',
    mapLink: '#'
  },
  metrics: {
    ltv: 42500,
    orders: 14,
    aov: 3035,
    firstSeen: 'Jan 12, 2024',
    lastContact: '2 days ago'
  },
  tags: ['VIP', 'Enterprise', 'High Risk', 'Q4 Target'],
  deals: [
    { id: 'DL-101', name: 'Q3 Software Expansion', value: 12500, stage: 'Negotiation', probability: '80%' },
    { id: 'DL-102', name: 'Hardware Refresh', value: 45000, stage: 'Closed Won', probability: '100%' },
  ],
  tasks: [
    { id: 'T-1', title: 'Prepare renewal contract', due: 'Tomorrow', status: 'Pending' },
    { id: 'T-2', title: 'Follow up on Q3 invoice', due: 'Overdue', status: 'Overdue' },
  ],
  timeline: [
    { id: 1, type: 'email', title: 'Email Sent', desc: 'Sent proposal v2.1 for review', date: '2 days ago', user: 'You' },
    { id: 2, type: 'call', title: 'Phone Call', desc: 'Discussed pricing tier adjustments', date: '5 days ago', user: 'Sarah Chen' },
    { id: 3, type: 'meeting', title: 'Zoom Meeting', desc: 'Quarterly review with engineering team', date: '1 week ago', user: 'You' },
  ],
  files: [
    { id: 'f1', name: 'MSA_Agreement_Signed.pdf', size: '2.4 MB', date: 'Mar 10, 2025' },
    { id: 'f2', name: 'Q3_Requirements.docx', size: '1.1 MB', date: 'Apr 02, 2025' }
  ]
};

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'deals', label: 'Deals' },
  { id: 'interactions', label: 'Timeline' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'files', label: 'Files' },
];

export const CustomerDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [note, setNote] = useState('');

  // Status Badge Logic
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-success bg-success/10 border-success/20';
      case 'Churned': return 'text-danger bg-danger/10 border-danger/20';
      default: return 'text-zinc-muted bg-white/5 border-white/10';
    }
  };

  return (
    <div className="animate-fade-up max-w-[1600px] mx-auto py-6 space-y-6">
      
      {/* 1. Header Navigation */}
      <div className="flex items-center gap-4 border-b border-white/5 pb-6">
        <button 
          onClick={() => navigate(paths.crmCustomers)}
          className="p-2 bg-white/5 rounded-sm hover:bg-white/10 text-zinc-muted hover:text-zinc-text transition-colors"
        >
          <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
        </button>
        <div className="flex flex-col">
           <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-muted uppercase tracking-widest">
              <span>CRM</span>
              <span>/</span>
              <span>Customers</span>
              <span>/</span>
              <span className="text-zinc-text">{CUSTOMER.name}</span>
           </div>
           <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter mt-1">Customer Profile</h1>
        </div>
        <div className="flex-1" />
        <div className="flex gap-2">
           <AmberButton variant="secondary" size="sm" onClick={() => alert('Delete')}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete
           </AmberButton>
           <AmberButton size="sm" onClick={() => alert('Edit')}>
              <Edit className="w-4 h-4 mr-2" /> Edit Profile
           </AmberButton>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN: PROFILE CARD --- */}
        <div className="xl:col-span-1 space-y-6">
           <AmberCard className="p-0 overflow-hidden bg-obsidian-panel border-white/10">
              <div className="h-24 bg-gradient-to-r from-brand/20 to-obsidian-panel relative">
                 <div className="absolute -bottom-10 left-6">
                    <div className="w-20 h-20 rounded-full bg-obsidian-panel border-4 border-obsidian-panel flex items-center justify-center text-xl font-black text-brand shadow-xl">
                       {CUSTOMER.avatar}
                    </div>
                 </div>
              </div>
              <div className="pt-12 px-6 pb-6 space-y-6">
                 <div>
                    <div className="flex justify-between items-start">
                       <div>
                          <h2 className="text-xl font-black text-zinc-text">{CUSTOMER.name}</h2>
                          <p className="text-sm text-zinc-muted font-medium">{CUSTOMER.role} at {CUSTOMER.company}</p>
                       </div>
                       <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-sm border uppercase tracking-widest", getStatusColor(CUSTOMER.status))}>
                          {CUSTOMER.status}
                       </span>
                    </div>
                 </div>

                 {/* Contact Info */}
                 <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-3 text-zinc-secondary hover:text-zinc-text transition-colors">
                       <Mail className="w-4 h-4 text-zinc-muted" />
                       <a href={`mailto:${CUSTOMER.contact.email}`} className="hover:underline">{CUSTOMER.contact.email}</a>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-secondary hover:text-zinc-text transition-colors">
                       <Phone className="w-4 h-4 text-zinc-muted" />
                       <a href={`tel:${CUSTOMER.contact.phone}`} className="hover:underline">{CUSTOMER.contact.phone}</a>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-secondary hover:text-zinc-text transition-colors">
                       <Globe className="w-4 h-4 text-zinc-muted" />
                       <a href={`https://${CUSTOMER.contact.website}`} target="_blank" className="hover:underline">{CUSTOMER.contact.website}</a>
                    </div>
                    <div className="flex items-start gap-3 text-zinc-secondary hover:text-zinc-text transition-colors">
                       <MapPin className="w-4 h-4 text-zinc-muted shrink-0 mt-0.5" />
                       <span>{CUSTOMER.contact.address}</span>
                    </div>
                 </div>

                 {/* Socials */}
                 <div className="flex gap-2 border-t border-white/5 pt-4">
                    <button className="p-2 bg-white/5 rounded-sm text-zinc-muted hover:text-[#0077b5] transition-colors"><Linkedin className="w-4 h-4" /></button>
                    <button className="p-2 bg-white/5 rounded-sm text-zinc-muted hover:text-[#1DA1F2] transition-colors"><Twitter className="w-4 h-4" /></button>
                 </div>

                 {/* Tags */}
                 <div className="border-t border-white/5 pt-4">
                    <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                       {CUSTOMER.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-brand/5 border border-brand/20 text-brand text-[9px] font-bold rounded-sm flex items-center gap-1 group cursor-pointer hover:bg-brand/10">
                             {tag} <X className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                          </span>
                       ))}
                       <button className="px-2 py-1 border border-dashed border-white/20 text-zinc-muted text-[9px] font-bold rounded-sm hover:text-zinc-text hover:border-white/40 transition-colors">
                          + Add
                       </button>
                    </div>
                 </div>
              </div>
           </AmberCard>

           {/* Key Metrics */}
           <AmberCard className="p-5 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                 <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">Lifetime Value</p>
                 <p className="text-lg font-black text-success">${CUSTOMER.metrics.ltv.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                 <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">Total Orders</p>
                 <p className="text-lg font-black text-zinc-text">{CUSTOMER.metrics.orders}</p>
              </div>
              <div className="space-y-1">
                 <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">Avg Order Value</p>
                 <p className="text-lg font-black text-zinc-text">${CUSTOMER.metrics.aov.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                 <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">Last Contact</p>
                 <p className="text-lg font-black text-brand">{CUSTOMER.metrics.lastContact}</p>
              </div>
           </AmberCard>
        </div>

        {/* --- RIGHT COLUMN: ACTIVITY HUB --- */}
        <div className="xl:col-span-2 space-y-6">
           
           {/* Action Bar */}
           <div className="flex flex-wrap gap-3">
              <AmberButton className="flex-1 justify-center"><MessageSquare className="w-4 h-4 mr-2" /> Send Email</AmberButton>
              <AmberButton variant="secondary" className="flex-1 justify-center"><PhoneCall className="w-4 h-4 mr-2" /> Log Call</AmberButton>
              <AmberButton variant="secondary" className="flex-1 justify-center"><Calendar className="w-4 h-4 mr-2" /> Schedule Meeting</AmberButton>
              <AmberButton variant="secondary" className="flex-1 justify-center"><CheckSquare className="w-4 h-4 mr-2" /> Add Task</AmberButton>
              <AmberButton variant="secondary" className="flex-1 justify-center"><Briefcase className="w-4 h-4 mr-2" /> Create Deal</AmberButton>
           </div>

           {/* Main Content Card */}
           <AmberCard noPadding className="min-h-[600px] flex flex-col">
              {/* Tabs */}
              <div className="flex border-b border-white/5 bg-obsidian-outer/30">
                 {TABS.map(tab => (
                    <button
                       key={tab.id}
                       onClick={() => setActiveTab(tab.id)}
                       className={cn(
                          "px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
                          activeTab === tab.id ? "text-brand bg-white/[0.02]" : "text-zinc-muted hover:text-zinc-text hover:bg-white/[0.01]"
                       )}
                    >
                       {tab.label}
                       {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand" />}
                    </button>
                 ))}
              </div>

              <div className="p-6 flex-1">
                 
                 {/* OVERVIEW TAB */}
                 {activeTab === 'overview' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                       <div className="space-y-2">
                          <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Internal Notes</h3>
                          <textarea 
                             className="w-full h-32 bg-obsidian-outer border border-white/5 rounded-sm p-4 text-sm text-zinc-text outline-none focus:border-brand/30 resize-none placeholder:text-zinc-muted/50"
                             placeholder="Add a note about this customer..."
                             value={note}
                             onChange={(e) => setNote(e.target.value)}
                          />
                          <div className="flex justify-end">
                             <AmberButton size="sm" disabled={!note.trim()}>Save Note</AmberButton>
                          </div>
                       </div>

                       <div>
                          <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest mb-4">Recent Activity</h3>
                          <div className="space-y-6 relative pl-2 before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                             {CUSTOMER.timeline.map((event) => (
                                <div key={event.id} className="relative pl-8">
                                   <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-obsidian-panel border-2 border-white/10 flex items-center justify-center z-10">
                                      <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                                   </div>
                                   <div className="flex justify-between items-start">
                                      <div>
                                         <p className="text-sm font-bold text-zinc-text">{event.title}</p>
                                         <p className="text-xs text-zinc-secondary mt-0.5">{event.desc}</p>
                                         <p className="text-[10px] text-zinc-muted mt-1 italic">by {event.user}</p>
                                      </div>
                                      <span className="text-[10px] font-mono text-zinc-muted">{event.date}</span>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 )}

                 {/* DEALS TAB */}
                 {activeTab === 'deals' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                       {CUSTOMER.deals.map(deal => (
                          <div key={deal.id} className="p-4 bg-obsidian-outer border border-white/5 rounded-sm flex items-center justify-between group hover:border-brand/20 transition-all cursor-pointer">
                             <div className="flex items-center gap-4">
                                <div className="p-2 bg-brand/10 text-brand rounded-sm"><Briefcase className="w-5 h-5" /></div>
                                <div>
                                   <h4 className="text-sm font-bold text-zinc-text group-hover:text-brand transition-colors">{deal.name}</h4>
                                   <p className="text-[10px] text-zinc-muted font-mono">{deal.id} • {deal.stage}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-sm font-black text-zinc-text">${deal.value.toLocaleString()}</p>
                                <p className="text-[10px] text-zinc-muted">Prob: {deal.probability}</p>
                             </div>
                          </div>
                       ))}
                       <AmberButton variant="secondary" className="w-full border-dashed border-white/10 text-zinc-muted hover:text-brand">
                          <Plus className="w-4 h-4 mr-2" /> Add New Deal
                       </AmberButton>
                    </div>
                 )}

                 {/* INTERACTIONS TAB */}
                 {activeTab === 'interactions' && (
                    <div className="space-y-6 pl-2 animate-in fade-in slide-in-from-right-4">
                       {CUSTOMER.timeline.map((event) => (
                          <div key={event.id} className="flex gap-4">
                             <div className="w-10 h-10 rounded-full bg-obsidian-outer border border-white/10 flex items-center justify-center shrink-0 text-zinc-muted">
                                {event.type === 'email' ? <Mail className="w-4 h-4" /> : 
                                 event.type === 'call' ? <PhoneCall className="w-4 h-4" /> : 
                                 <User className="w-4 h-4" />}
                             </div>
                             <div className="flex-1 pb-6 border-b border-white/5 last:border-0">
                                <div className="flex justify-between mb-1">
                                   <h4 className="text-sm font-bold text-zinc-text">{event.title}</h4>
                                   <span className="text-[10px] text-zinc-muted">{event.date}</span>
                                </div>
                                <p className="text-xs text-zinc-secondary leading-relaxed">{event.desc}</p>
                                <div className="mt-2 flex gap-2">
                                   <span className="text-[9px] font-black bg-white/5 px-1.5 py-0.5 rounded text-zinc-muted uppercase">{event.type}</span>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}

                 {/* TASKS TAB */}
                 {activeTab === 'tasks' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
                       {CUSTOMER.tasks.map(task => (
                          <div key={task.id} className="flex items-center gap-3 p-3 bg-obsidian-outer border border-white/5 rounded-sm hover:bg-white/[0.02] transition-colors">
                             <button className="w-5 h-5 rounded border border-white/20 hover:border-brand hover:bg-brand/10 transition-colors flex items-center justify-center">
                                {/* <Check className="w-3.5 h-3.5 text-brand opacity-0 hover:opacity-100" /> */}
                             </button>
                             <div className="flex-1">
                                <p className={cn("text-sm font-medium text-zinc-text", task.status === 'Completed' && "line-through text-zinc-muted")}>{task.title}</p>
                                <p className={cn("text-[10px] font-bold mt-0.5 uppercase", task.status === 'Overdue' ? "text-danger" : "text-zinc-muted")}>Due: {task.due}</p>
                             </div>
                             <button className="p-1.5 hover:bg-white/10 rounded-sm text-zinc-muted"><MoreVertical className="w-4 h-4" /></button>
                          </div>
                       ))}
                       <div className="pt-2">
                          <AmberButton variant="ghost" size="sm"><Plus className="w-3.5 h-3.5 mr-2" /> Add New Task</AmberButton>
                       </div>
                    </div>
                 )}

                 {/* FILES TAB */}
                 {activeTab === 'files' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
                       {CUSTOMER.files.map(file => (
                          <div key={file.id} className="flex items-center justify-between p-3 bg-obsidian-outer border border-white/5 rounded-sm hover:border-brand/30 transition-all cursor-pointer group">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-brand/10 text-brand rounded-sm"><FileText className="w-5 h-5" /></div>
                                <div>
                                   <p className="text-xs font-bold text-zinc-text group-hover:text-brand transition-colors">{file.name}</p>
                                   <p className="text-[9px] text-zinc-muted">{file.size} • Uploaded {file.date}</p>
                                </div>
                             </div>
                             <button className="p-2 hover:bg-white/10 rounded-sm text-zinc-muted hover:text-zinc-text"><MoreVertical className="w-4 h-4" /></button>
                          </div>
                       ))}
                       <div className="border-2 border-dashed border-white/10 rounded-sm p-6 text-center text-zinc-muted hover:border-brand/30 hover:bg-white/[0.02] cursor-pointer transition-all">
                          <Paperclip className="w-6 h-6 mx-auto mb-2 opacity-50" />
                          <p className="text-[10px] font-bold uppercase tracking-widest">Upload Documents</p>
                       </div>
                    </div>
                 )}

              </div>
           </AmberCard>
        </div>

      </div>
    </div>
  );
};
