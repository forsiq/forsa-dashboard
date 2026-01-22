
import React, { useState, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AmberSlideOver } from '../amber-ui/components/AmberSlideOver';
import { AmberInput } from '../amber-ui/components/AmberInput';
import { AmberDropdown } from '../amber-ui/components/AmberDropdown';
import { 
  LifeBuoy, 
  Search, 
  Plus, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  ArrowLeft,
  Paperclip,
  Send,
  Book,
  ExternalLink,
  Filter
} from 'lucide-react';
import { cn } from '../lib/cn';

interface Message {
  id: string;
  sender: 'User' | 'Agent';
  text: string;
  timestamp: string;
}

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: 'Open' | 'In Progress' | 'Closed' | 'Resolved';
  created: string;
  messages: Message[];
}

export const Support = () => {
  // State
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Form State
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'Technical',
    priority: 'Medium',
    description: ''
  });

  const [replyText, setReplyText] = useState('');

  // Mock Data
  const [tickets, setTickets] = useState<Ticket[]>([
    { 
      id: 'TKT-1042', 
      subject: 'API Rate Limits Exceeded on Production', 
      category: 'Technical', 
      priority: 'High', 
      status: 'Open', 
      created: '2025-05-20 09:15',
      messages: [
        { id: 'm1', sender: 'User', text: 'We are seeing 429 errors on the /sync endpoint despite being within our quota.', timestamp: '2025-05-20 09:15' }
      ]
    },
    { 
      id: 'TKT-1039', 
      subject: 'Billing Invoice Discrepancy', 
      category: 'Billing', 
      priority: 'Medium', 
      status: 'In Progress', 
      created: '2025-05-19 14:30',
      messages: [
        { id: 'm1', sender: 'User', text: 'The May invoice shows a charge for "Storage Overages" but we cleared files.', timestamp: '2025-05-19 14:30' },
        { id: 'm2', sender: 'Agent', text: 'Hello, I am looking into your usage logs now. One moment.', timestamp: '2025-05-19 15:45' }
      ]
    },
    { 
      id: 'TKT-1011', 
      subject: 'Feature Request: Dark Mode API Docs', 
      category: 'Feature Request', 
      priority: 'Low', 
      status: 'Closed', 
      created: '2025-05-10 11:00',
      messages: [
        { id: 'm1', sender: 'User', text: 'Can we get a dark mode for the developer portal?', timestamp: '2025-05-10 11:00' },
        { id: 'm2', sender: 'Agent', text: 'Good news! This was deployed in v4.11. Ticket closed.', timestamp: '2025-05-12 09:00' }
      ]
    }
  ]);

  // Derived Data
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
      const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [tickets, searchQuery, statusFilter, categoryFilter]);

  // Handlers
  const handleCreateTicket = () => {
    const ticket: Ticket = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: newTicket.subject,
      category: newTicket.category,
      priority: newTicket.priority,
      status: 'Open',
      created: new Date().toLocaleString(),
      messages: [
        { id: `m${Date.now()}`, sender: 'User', text: newTicket.description, timestamp: new Date().toLocaleString() }
      ]
    };
    setTickets([ticket, ...tickets]);
    setIsCreateOpen(false);
    setNewTicket({ subject: '', category: 'Technical', priority: 'Medium', description: '' });
  };

  const handleReply = () => {
    if (!selectedTicket || !replyText.trim()) return;
    const updatedTicket = {
      ...selectedTicket,
      messages: [
        ...selectedTicket.messages,
        { id: `m${Date.now()}`, sender: 'User' as const, text: replyText, timestamp: new Date().toLocaleString() }
      ]
    };
    setTickets(tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t));
    setSelectedTicket(updatedTicket);
    setReplyText('');
  };

  const handleStatusChange = (status: Ticket['status']) => {
    if (!selectedTicket) return;
    const updatedTicket = { ...selectedTicket, status };
    setTickets(tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t));
    setSelectedTicket(updatedTicket);
  };

  // Render Helpers
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Open': return 'text-danger bg-danger/10 border-danger/20';
      case 'In Progress': return 'text-brand bg-brand/10 border-brand/20';
      case 'Resolved': return 'text-success bg-success/10 border-success/20';
      case 'Closed': return 'text-zinc-muted bg-white/5 border-white/10';
      default: return 'text-zinc-muted';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'Critical': return 'text-danger';
      case 'High': return 'text-warning';
      case 'Medium': return 'text-info';
      default: return 'text-zinc-muted';
    }
  };

  return (
    <div className="animate-fade-up max-w-6xl mx-auto py-4 space-y-8 h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <LifeBuoy className="w-6 h-6 text-brand" />
             <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Support Center</h1>
          </div>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] italic">Manage your inquiries and support requests</p>
        </div>
        <div className="flex gap-2">
          {viewMode === 'detail' && (
             <Button variant="ghost" size="sm" onClick={() => setViewMode('list')}>
               <ArrowLeft className="w-3.5 h-3.5 mr-2 rtl:ml-2 rtl:mr-0" /> Back to List
             </Button>
          )}
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-2 rtl:ml-2 rtl:mr-0" /> Create New Ticket
          </Button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
           {/* Sidebar / Filters */}
           <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-4">
                 <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest border-b border-white/5 pb-2">Filter Tickets</h3>
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-muted" />
                    <input 
                      type="text" 
                      placeholder="Search tickets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-9 bg-obsidian-outer border border-white/5 rounded-sm pl-9 pr-3 text-[11px] font-bold text-zinc-text outline-none focus:border-brand/30"
                    />
                 </div>
                 <AmberDropdown 
                    label="Status"
                    options={[{label: 'All', value: 'All'}, {label: 'Open', value: 'Open'}, {label: 'In Progress', value: 'In Progress'}, {label: 'Closed', value: 'Closed'}]}
                    value={statusFilter}
                    onChange={setStatusFilter}
                 />
                 <AmberDropdown 
                    label="Category"
                    options={[{label: 'All', value: 'All'}, {label: 'Technical', value: 'Technical'}, {label: 'Billing', value: 'Billing'}, {label: 'Feature Request', value: 'Feature Request'}]}
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                 />
              </div>

              <div className="pt-6 border-t border-white/5 space-y-4">
                 <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest border-b border-white/5 pb-2">Knowledge Base</h3>
                 {[
                   { title: 'API Authentication Guide', desc: 'How to rotate keys securely.' },
                   { title: 'Billing FAQ', desc: 'Understanding invoice cycles.' },
                   { title: 'Webhook Integration', desc: 'Setup realtime event listeners.' }
                 ].map((kb, i) => (
                   <a key={i} href="#" className="block p-3 bg-obsidian-card border border-white/5 rounded-sm hover:border-brand/30 hover:bg-white/[0.02] transition-all group">
                      <div className="flex items-start justify-between">
                         <div className="flex items-center gap-2 text-brand mb-1">
                            <Book className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wide">Guide</span>
                         </div>
                         <ExternalLink className="w-3 h-3 text-zinc-muted group-hover:text-zinc-text opacity-0 group-hover:opacity-100 transition-all rtl:rotate-180" />
                      </div>
                      <h4 className="text-xs font-bold text-zinc-text mb-1 group-hover:underline decoration-brand/50 underline-offset-4">{kb.title}</h4>
                      <p className="text-[10px] text-zinc-muted leading-tight">{kb.desc}</p>
                   </a>
                 ))}
              </div>
           </div>

           {/* Ticket List */}
           <Card noPadding className="lg:col-span-3 flex flex-col overflow-hidden bg-obsidian-panel/50 border-white/[0.03]">
              <div className="overflow-x-auto flex-1">
                 <table className="w-full text-start">
                    <thead className="bg-white/[0.02] border-b border-white/5 sticky top-0 z-10">
                       <tr>
                          <th className="px-6 py-3 text-start text-[9px] font-black text-zinc-muted uppercase tracking-[0.2em]">ID</th>
                          <th className="px-6 py-3 text-start text-[9px] font-black text-zinc-muted uppercase tracking-[0.2em]">Subject</th>
                          <th className="px-6 py-3 text-start text-[9px] font-black text-zinc-muted uppercase tracking-[0.2em]">Category</th>
                          <th className="px-6 py-3 text-start text-[9px] font-black text-zinc-muted uppercase tracking-[0.2em]">Priority</th>
                          <th className="px-6 py-3 text-start text-[9px] font-black text-zinc-muted uppercase tracking-[0.2em]">Status</th>
                          <th className="px-6 py-3 text-start text-[9px] font-black text-zinc-muted uppercase tracking-[0.2em]">Created</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                       {filteredTickets.length > 0 ? (
                         filteredTickets.map((t) => (
                           <tr 
                             key={t.id} 
                             onClick={() => { setSelectedTicket(t); setViewMode('detail'); }}
                             className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                           >
                              <td className="px-6 py-4 font-mono text-[10px] font-bold text-zinc-muted group-hover:text-brand transition-colors">{t.id}</td>
                              <td className="px-6 py-4">
                                 <p className="text-xs font-bold text-zinc-text truncate max-w-[200px]">{t.subject}</p>
                              </td>
                              <td className="px-6 py-4 text-[10px] font-bold text-zinc-secondary">{t.category}</td>
                              <td className="px-6 py-4">
                                 <span className={cn("text-[10px] font-black uppercase tracking-tight", getPriorityColor(t.priority))}>{t.priority}</span>
                              </td>
                              <td className="px-6 py-4">
                                 <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-sm border uppercase tracking-widest", getStatusColor(t.status))}>
                                    {t.status}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-[10px] font-mono text-zinc-muted">{t.created.split(' ')[0]}</td>
                           </tr>
                         ))
                       ) : (
                         <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-zinc-muted italic text-xs">
                               No tickets found matching your filters.
                            </td>
                         </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </Card>
        </div>
      ) : (
        // Detail View
        <div className="flex flex-col h-full min-h-0 gap-6">
           {selectedTicket && (
             <>
               <Card className="shrink-0 p-6 flex flex-col md:flex-row md:items-start justify-between gap-6 border-brand/20">
                  <div className="space-y-3">
                     <div className="flex items-center gap-3">
                        <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-sm border uppercase tracking-widest", getStatusColor(selectedTicket.status))}>
                           {selectedTicket.status}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-muted font-bold">{selectedTicket.id}</span>
                     </div>
                     <h2 className="text-xl font-black text-zinc-text uppercase italic tracking-tight">{selectedTicket.subject}</h2>
                     <div className="flex items-center gap-6 text-[10px] font-bold text-zinc-muted uppercase tracking-widest">
                        <span>Category: <span className="text-zinc-text">{selectedTicket.category}</span></span>
                        <span>Priority: <span className={getPriorityColor(selectedTicket.priority)}>{selectedTicket.priority}</span></span>
                        <span>Created: {selectedTicket.created}</span>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     {selectedTicket.status !== 'Closed' ? (
                        <Button variant="ghost" className="text-danger hover:bg-danger/10 border-danger/20" onClick={() => handleStatusChange('Closed')}>
                           Close Ticket
                        </Button>
                     ) : (
                        <Button variant="ghost" onClick={() => handleStatusChange('Open')}>Reopen Ticket</Button>
                     )}
                  </div>
               </Card>

               <Card className="flex-1 min-h-0 flex flex-col overflow-hidden bg-obsidian-panel/30">
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                     {selectedTicket.messages.map((msg) => (
                        <div key={msg.id} className={cn("flex flex-col gap-2 max-w-3xl", msg.sender === 'User' ? "self-end items-end" : "self-start items-start")}>
                           <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-muted uppercase tracking-widest">
                              <span>{msg.sender === 'User' ? 'You' : 'Support Agent'}</span>
                              <span>•</span>
                              <span>{msg.timestamp}</span>
                           </div>
                           <div className={cn(
                              "p-4 rounded-sm text-sm font-medium leading-relaxed border",
                              msg.sender === 'User' 
                                 ? "bg-brand/10 border-brand/20 text-zinc-text rounded-tr-none" 
                                 : "bg-obsidian-outer border-white/10 text-zinc-text rounded-tl-none"
                           )}>
                              {msg.text}
                           </div>
                        </div>
                     ))}
                  </div>
                  
                  {selectedTicket.status !== 'Closed' && (
                     <div className="p-4 border-t border-white/5 bg-obsidian-panel/80 backdrop-blur-md">
                        <div className="relative">
                           <textarea 
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Type your reply..."
                              className="w-full bg-obsidian-outer border border-white/10 rounded-sm p-4 pr-12 text-sm font-medium text-zinc-text outline-none focus:border-brand/30 min-h-[80px] resize-none"
                           />
                           <div className="absolute bottom-3 right-3 flex items-center gap-2">
                              <button className="p-2 text-zinc-muted hover:text-zinc-text transition-colors">
                                 <Paperclip className="w-4 h-4" />
                              </button>
                              <button 
                                 onClick={handleReply}
                                 disabled={!replyText.trim()}
                                 className="p-2 bg-brand text-obsidian-outer rounded-sm hover:opacity-90 disabled:opacity-50 transition-all"
                              >
                                 <Send className="w-4 h-4 rtl:rotate-180" />
                              </button>
                           </div>
                        </div>
                     </div>
                  )}
               </Card>
             </>
           )}
        </div>
      )}

      {/* Create Ticket Modal */}
      <AmberSlideOver
         isOpen={isCreateOpen}
         onClose={() => setIsCreateOpen(false)}
         title="Create Support Ticket"
         description="Submit a new inquiry to our support team."
         footer={
            <>
               <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
               <Button onClick={handleCreateTicket} disabled={!newTicket.subject || !newTicket.description}>Submit Ticket</Button>
            </>
         }
      >
         <div className="space-y-6">
            <AmberInput 
               label="Subject"
               placeholder="Brief summary of the issue..."
               value={newTicket.subject}
               onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Category</label>
                  <AmberDropdown 
                     options={[{label: 'Technical', value: 'Technical'}, {label: 'Billing', value: 'Billing'}, {label: 'Account', value: 'Account'}, {label: 'Feature Request', value: 'Feature Request'}]}
                     value={newTicket.category}
                     onChange={(val) => setNewTicket({...newTicket, category: val})}
                     className="w-full"
                  />
               </div>
               <div>
                  <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Priority</label>
                  <AmberDropdown 
                     options={[{label: 'Low', value: 'Low'}, {label: 'Medium', value: 'Medium'}, {label: 'High', value: 'High'}, {label: 'Critical', value: 'Critical'}]}
                     value={newTicket.priority}
                     onChange={(val) => setNewTicket({...newTicket, priority: val})}
                     className="w-full"
                  />
               </div>
            </div>
            <AmberInput 
               label="Description"
               multiline
               rows={6}
               placeholder="Please describe the issue in detail..."
               value={newTicket.description}
               onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
            />
            <div className="p-4 border-2 border-dashed border-white/10 rounded-sm flex flex-col items-center justify-center text-zinc-muted hover:border-brand/20 hover:text-brand/80 hover:bg-white/[0.02] transition-all cursor-pointer">
               <Paperclip className="w-6 h-6 mb-2" />
               <span className="text-[10px] font-bold uppercase tracking-widest">Attach Screenshots or Logs</span>
            </div>
         </div>
      </AmberSlideOver>
    </div>
  );
};
