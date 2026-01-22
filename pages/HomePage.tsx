
import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  Briefcase, 
  Users, 
  Database, 
  Activity, 
  Plus, 
  Settings, 
  HelpCircle, 
  Bell,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { useLanguage } from '../amber-ui/contexts/LanguageContext';
import { useTheme } from '../amber-ui/contexts/ThemeContext';
import { cn } from '../lib/cn';
import { useNavigate } from 'react-router-dom';

export const HomePage = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  // Mock Data
  const activityData = [
    { name: 'Mon', actions: 24 },
    { name: 'Tue', actions: 45 },
    { name: 'Wed', actions: 32 },
    { name: 'Thu', actions: 65 },
    { name: 'Fri', actions: 48 },
    { name: 'Sat', actions: 12 },
    { name: 'Sun', actions: 8 },
  ];

  const recentActivities = [
    { id: 1, user: 'Alex Morgan', action: 'Created new project', target: 'Q4 Marketing', time: '10 min ago', icon: Plus, color: 'text-brand' },
    { id: 2, user: 'Sarah Chen', action: 'Uploaded assets', target: 'Brand_Kit_v2.zip', time: '2 hrs ago', icon: FileText, color: 'text-info' },
    { id: 3, user: 'System', action: 'Database backup', target: 'Daily Snapshot', time: '5 hrs ago', icon: Database, color: 'text-success' },
    { id: 4, user: 'James Wilson', action: 'Closed ticket', target: '#8821', time: 'Yesterday', icon: CheckCircle2, color: 'text-zinc-muted' },
  ];

  const deadlines = [
    { id: 1, title: 'Website Launch', due: 'Tomorrow', status: 'Urgent', color: 'text-danger' },
    { id: 2, title: 'Q3 Financial Review', due: 'May 24', status: 'Pending', color: 'text-warning' },
    { id: 3, title: 'Client Presentation', due: 'May 28', status: 'On Track', color: 'text-success' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-text tracking-tighter uppercase italic">
            Dashboard
          </h1>
          <p className="text-sm text-zinc-muted font-medium mt-1">
            Welcome back, Alex. Here's what's happening today.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/notifications')}>
            <Bell className="w-4 h-4 mr-2" /> Notifications
          </Button>
          <Button onClick={() => navigate('/projects')}>
            <Plus className="w-4 h-4 mr-2" /> New Project
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Projects', value: '24', trend: '+3 this week', icon: Briefcase, color: 'text-brand', bg: 'bg-brand/10' },
          { label: 'Active Users', value: '142', trend: '+12% vs last mo', icon: Users, color: 'text-info', bg: 'bg-info/10' },
          { label: 'Storage Used', value: '84%', trend: '1.2TB / 1.5TB', icon: Database, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'System Health', value: '99.9%', trend: 'All systems operational', icon: Activity, color: 'text-success', bg: 'bg-success/10' },
        ].map((stat, i) => (
          <Card key={i} className="p-6 border-l-4 border-l-transparent hover:border-l-brand transition-all group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-zinc-muted uppercase tracking-widest mb-1 group-hover:text-brand transition-colors">{stat.label}</p>
                <h3 className="text-2xl font-black text-zinc-text tracking-tight">{stat.value}</h3>
              </div>
              <div className={cn("p-2 rounded-lg", stat.bg, stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] font-bold text-zinc-muted mt-3 uppercase tracking-wide opacity-80">{stat.trend}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Activity Chart */}
        <Card className="lg:col-span-2 p-6 flex flex-col h-[400px]" glass>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand" /> Weekly Activity
            </h3>
            <select className="bg-obsidian-outer border border-white/5 text-[10px] font-bold text-zinc-muted uppercase tracking-widest rounded-sm px-2 py-1 outline-none cursor-pointer hover:text-zinc-text transition-colors">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="flex-1 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorAct" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFC000" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#FFC000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 700, fill: isDark ? '#64748B' : '#94a3b8'}} 
                  dy={10} 
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{stroke: 'rgba(255,255,255,0.1)'}}
                  contentStyle={{ 
                    backgroundColor: isDark ? '#1e293b' : '#ffffff', 
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: isDark ? '#F1F5F9' : '#0F172A',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area type="monotone" dataKey="actions" stroke="#FFC000" strokeWidth={3} fillOpacity={1} fill="url(#colorAct)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Quick Actions & Deadlines Column */}
        <div className="space-y-6">
          
          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'New Project', icon: Plus, path: '/projects' },
                { label: 'Add User', icon: Users, path: '/admin/users' },
                { label: 'Settings', icon: Settings, path: '/settings' },
                { label: 'Support', icon: HelpCircle, path: '/help' },
              ].map((action, i) => (
                <button 
                  key={i} 
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center justify-center p-3 bg-obsidian-outer border border-white/5 hover:border-brand/30 hover:bg-white/5 rounded-sm transition-all group"
                >
                  <action.icon className="w-5 h-5 text-zinc-muted group-hover:text-brand mb-2 transition-colors" />
                  <span className="text-[9px] font-bold text-zinc-muted group-hover:text-zinc-text uppercase tracking-widest">{action.label}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Deadlines */}
          <Card className="p-6">
            <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest mb-4 flex items-center justify-between">
              <span>Deadlines</span>
              <Calendar className="w-4 h-4 text-zinc-muted" />
            </h3>
            <div className="space-y-4">
              {deadlines.map((item) => (
                <div key={item.id} className="flex items-center justify-between pb-3 border-b border-white/5 last:border-0 last:pb-0">
                  <div>
                    <p className="text-xs font-bold text-zinc-text">{item.title}</p>
                    <p className={cn("text-[9px] font-black uppercase mt-0.5", item.color)}>{item.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-zinc-muted">{item.due}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Activity Timeline */}
        <Card className="p-6 h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">Recent Activity</h3>
            <Button variant="ghost" size="sm" className="text-[10px]">View All</Button>
          </div>
          <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-white/5">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex items-start gap-4 relative z-10 group">
                <div className={cn("w-10 h-10 rounded-full border border-white/10 bg-obsidian-panel flex items-center justify-center shrink-0 transition-colors group-hover:border-white/20", act.color)}>
                  <act.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-xs text-zinc-text">
                    <span className="font-bold">{act.user}</span> {act.action} <span className="text-brand opacity-90 font-medium">{act.target}</span>
                  </p>
                  <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest mt-1 group-hover:text-zinc-secondary transition-colors">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Notifications Panel */}
        <Card className="p-6 h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">System Notifications</h3>
            <Button variant="ghost" size="sm" className="text-[10px]">Clear All</Button>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Maintenance Scheduled', desc: 'System update on Saturday at 2:00 AM UTC.', type: 'info' },
              { title: 'Storage Warning', desc: 'Project "Alpha" is approaching storage limits.', type: 'warning' },
              { title: 'New Integration', desc: 'Slack integration was successfully connected.', type: 'success' },
            ].map((note, i) => (
              <div key={i} className="p-3 bg-obsidian-outer border border-white/5 rounded-sm flex gap-3 hover:border-white/10 transition-colors cursor-default">
                {note.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" /> : 
                 note.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" /> :
                 <Bell className="w-4 h-4 text-info shrink-0 mt-0.5" />}
                <div>
                  <p className="text-xs font-bold text-zinc-text">{note.title}</p>
                  <p className="text-[10px] text-zinc-muted mt-0.5 leading-relaxed">{note.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4 text-[10px] uppercase tracking-widest border-white/10 hover:border-brand/20 hover:text-brand" onClick={() => navigate('/notifications')}>
            View All Notifications <ArrowRight className="w-3.5 h-3.5 ml-2" />
          </Button>
        </Card>
      </div>
    </div>
  );
};
