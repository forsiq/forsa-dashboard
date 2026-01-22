
import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AmberInput } from '../amber-ui/components/AmberInput';
import { AmberDropdown } from '../amber-ui/components/AmberDropdown';
import { useLanguage } from '../amber-ui/contexts/LanguageContext';
import { useTheme } from '../amber-ui/contexts/ThemeContext';
import { 
  Settings as SettingsIcon, 
  Mail, 
  Shield, 
  Bell, 
  Plug, 
  Database, 
  AlertTriangle, 
  Save, 
  Upload, 
  Download,
  Trash2,
  RefreshCw,
  Globe,
  Check,
  Server
} from 'lucide-react';
import { cn } from '../lib/cn';

const ToggleSwitch = ({ label, description, checked, onChange }: { label: string, description?: string, checked: boolean, onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
    <div className="space-y-0.5">
      <div className="text-[10px] font-black text-zinc-text uppercase tracking-widest">{label}</div>
      {description && <div className="text-[9px] font-medium text-zinc-muted">{description}</div>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "w-9 h-5 rounded-full relative transition-colors focus:outline-none",
        checked ? "bg-brand" : "bg-obsidian-outer border border-white/10"
      )}
    >
      <div className={cn(
        "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
        checked ? "translate-x-4" : "translate-x-0"
      )} />
    </button>
  </div>
);

export const Settings = () => {
  const { t, setLanguage, language } = useLanguage();
  const { toggleTheme, theme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');

  // Form States
  const [general, setGeneral] = useState({ appName: 'ZoneVast Enterprise', language: language });
  const [email, setEmail] = useState({ host: 'smtp.zonevast.corp', port: '587', user: 'admin', sender: 'noreply@zonevast.corp' });
  const [security, setSecurity] = useState({ sessionTimeout: '30m', mfa: true, passwordReq: true });
  const [notifications, setNotifications] = useState({ email: true, sms: false, push: true });
  const [integrations, setIntegrations] = useState([
    { id: 'slack', name: 'Slack', connected: true, icon: 'S' },
    { id: 'github', name: 'GitHub', connected: false, icon: 'G' },
    { id: 'stripe', name: 'Stripe', connected: true, icon: '$' },
  ]);

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'email', label: 'Email Service', icon: Mail },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Plug },
    { id: 'data', label: 'Data & System', icon: Database },
  ];

  const handleSave = () => {
    // Simulate save
    alert("System configuration updated successfully.");
  };

  return (
    <div className="animate-fade-up max-w-6xl mx-auto py-6 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-black text-zinc-text uppercase italic tracking-tighter">{t('settings.title')}</h1>
          <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-[0.2em] mt-1">
            Global System Configuration
          </p>
        </div>
        <Button onClick={handleSave} size="sm">
            <Save className="w-4 h-4 mr-2" /> {t('settings.save')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-1">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all text-left",
                        activeTab === tab.id 
                            ? "bg-brand/10 text-brand border border-brand/20" 
                            : "text-zinc-muted hover:text-zinc-text hover:bg-white/5 border border-transparent"
                    )}
                >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                </button>
            ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
            
            {/* GENERAL */}
            {activeTab === 'general' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <Card className="p-6">
                        <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Application Identity</h3>
                        <div className="space-y-6">
                            <AmberInput 
                                label="Application Name"
                                value={general.appName}
                                onChange={(e) => setGeneral({...general, appName: e.target.value})}
                            />
                            <div>
                                <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1.5 block px-1">Interface Language</label>
                                <AmberDropdown 
                                    options={[
                                        { label: 'English (US)', value: 'en' },
                                        { label: 'Arabic (AR)', value: 'ar' },
                                    ]}
                                    value={general.language}
                                    onChange={(val) => {
                                        setGeneral({...general, language: val as any});
                                        setLanguage(val as any);
                                    }}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1.5 block px-1">Theme Preference</label>
                                <div className="flex gap-4">
                                    <button onClick={() => theme !== 'light' && toggleTheme()} className={cn("px-4 py-2 border rounded-sm text-[10px] font-bold uppercase transition-all", theme === 'light' ? "border-brand text-brand bg-brand/5" : "border-white/10 text-zinc-muted hover:bg-white/5")}>Light</button>
                                    <button onClick={() => theme !== 'dark' && toggleTheme()} className={cn("px-4 py-2 border rounded-sm text-[10px] font-bold uppercase transition-all", theme === 'dark' ? "border-brand text-brand bg-brand/5" : "border-white/10 text-zinc-muted hover:bg-white/5")}>Dark</button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* EMAIL */}
            {activeTab === 'email' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <Card className="p-6">
                        <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest mb-6 border-b border-white/5 pb-4 flex items-center gap-2"><Server className="w-4 h-4" /> SMTP Configuration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <AmberInput 
                                    label="SMTP Host"
                                    value={email.host}
                                    onChange={(e) => setEmail({...email, host: e.target.value})}
                                />
                            </div>
                            <AmberInput 
                                label="Port"
                                value={email.port}
                                onChange={(e) => setEmail({...email, port: e.target.value})}
                            />
                            <AmberInput 
                                label="Username"
                                value={email.user}
                                onChange={(e) => setEmail({...email, user: e.target.value})}
                            />
                            <div className="md:col-span-2">
                                <AmberInput 
                                    label="Sender Email"
                                    type="email"
                                    value={email.sender}
                                    onChange={(e) => setEmail({...email, sender: e.target.value})}
                                />
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* SECURITY */}
            {activeTab === 'security' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <Card className="p-6">
                        <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Session & Access</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1.5 block px-1">Session Timeout</label>
                                <AmberDropdown 
                                    options={[
                                        { label: '15 Minutes', value: '15m' },
                                        { label: '30 Minutes', value: '30m' },
                                        { label: '1 Hour', value: '1h' },
                                        { label: '4 Hours', value: '4h' },
                                    ]}
                                    value={security.sessionTimeout}
                                    onChange={(val) => setSecurity({...security, sessionTimeout: val})}
                                    className="w-full"
                                />
                            </div>
                            <ToggleSwitch 
                                label="Enforce 2FA" 
                                description="Require Two-Factor Authentication for all admin accounts."
                                checked={security.mfa}
                                onChange={(v) => setSecurity({...security, mfa: v})}
                            />
                            <ToggleSwitch 
                                label="Strict Password Policy" 
                                description="Require symbols, numbers, and uppercase letters."
                                checked={security.passwordReq}
                                onChange={(v) => setSecurity({...security, passwordReq: v})}
                            />
                        </div>
                    </Card>
                </div>
            )}

            {/* NOTIFICATIONS */}
            {activeTab === 'notifications' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <Card className="p-6">
                        <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest mb-6 border-b border-white/5 pb-4">System Alerts</h3>
                        <div className="space-y-2">
                            <ToggleSwitch 
                                label="Email Notifications" 
                                description="Receive system alerts via registered email."
                                checked={notifications.email}
                                onChange={(v) => setNotifications({...notifications, email: v})}
                            />
                            <ToggleSwitch 
                                label="SMS Notifications" 
                                description="Receive critical alerts via SMS (requires gateway)."
                                checked={notifications.sms}
                                onChange={(v) => setNotifications({...notifications, sms: v})}
                            />
                            <ToggleSwitch 
                                label="Push Notifications" 
                                description="Browser push notifications for active sessions."
                                checked={notifications.push}
                                onChange={(v) => setNotifications({...notifications, push: v})}
                            />
                        </div>
                    </Card>
                </div>
            )}

            {/* INTEGRATIONS */}
            {activeTab === 'integrations' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <Card className="p-6">
                        <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Connected Services</h3>
                        <div className="space-y-4">
                            {integrations.map((integ, i) => (
                                <div key={integ.id} className="flex items-center justify-between p-4 bg-obsidian-outer border border-white/5 rounded-sm hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-zinc-text border border-white/10 shadow-inner">
                                            {integ.icon}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-zinc-text uppercase tracking-tight">{integ.name}</p>
                                            <p className="text-[9px] text-zinc-muted uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                                                <span className={cn("w-1.5 h-1.5 rounded-full", integ.connected ? "bg-success" : "bg-zinc-muted")} />
                                                {integ.connected ? 'Active Connection' : 'Not Connected'}
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        className={cn(
                                            "px-4 py-2 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all",
                                            integ.connected 
                                                ? "bg-transparent border border-white/10 text-zinc-muted hover:text-danger hover:border-danger/30 hover:bg-danger/5" 
                                                : "bg-brand text-obsidian-outer hover:bg-brand/90"
                                        )}
                                        onClick={() => {
                                            const newInteg = [...integrations];
                                            newInteg[i].connected = !newInteg[i].connected;
                                            setIntegrations(newInteg);
                                        }}
                                    >
                                        {integ.connected ? 'Disconnect' : 'Connect'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {/* DATA & DANGER */}
            {activeTab === 'data' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <Card className="p-6">
                        <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Data Management</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button className="flex flex-col items-center justify-center p-6 bg-obsidian-outer border border-white/5 hover:border-brand/30 rounded-sm transition-all group">
                                <Download className="w-8 h-8 text-zinc-muted group-hover:text-brand mb-3 transition-colors" />
                                <span className="text-xs font-bold text-zinc-text uppercase tracking-widest">Export All Data</span>
                                <span className="text-[9px] text-zinc-muted mt-1 font-medium">JSON / CSV Format</span>
                            </button>
                            <button className="flex flex-col items-center justify-center p-6 bg-obsidian-outer border border-white/5 hover:border-info/30 rounded-sm transition-all group">
                                <Upload className="w-8 h-8 text-zinc-muted group-hover:text-info mb-3 transition-colors" />
                                <span className="text-xs font-bold text-zinc-text uppercase tracking-widest">Import Data</span>
                                <span className="text-[9px] text-zinc-muted mt-1 font-medium">Restore from Backup</span>
                            </button>
                        </div>
                    </Card>

                    <Card className="p-6 border-danger/20 bg-danger/[0.02]">
                        <h3 className="text-sm font-black text-danger uppercase tracking-widest mb-6 border-b border-danger/10 pb-4 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Danger Zone
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-zinc-text">Clear System Cache</p>
                                    <p className="text-[9px] text-zinc-muted mt-0.5">Removes temporary files and local storage data.</p>
                                </div>
                                <button className="px-4 py-2 border border-white/10 hover:bg-white/5 text-zinc-text rounded-sm text-[9px] font-black uppercase tracking-widest transition-all">
                                    Clear Cache
                                </button>
                            </div>
                            <div className="h-px bg-white/5" />
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-zinc-text">Factory Reset</p>
                                    <p className="text-[9px] text-zinc-muted mt-0.5">Restores all settings to default. Data is preserved.</p>
                                </div>
                                <button className="px-4 py-2 bg-danger/10 border border-danger/20 text-danger hover:bg-danger/20 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all">
                                    Reset Defaults
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};
