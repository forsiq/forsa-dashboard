
import React, { useState, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AmberInput } from '../amber-ui/components/AmberInput';
import { AmberDropdown } from '../amber-ui/components/AmberDropdown';
import { useLanguage } from '../amber-ui/contexts/LanguageContext';
import { 
  User, 
  Mail, 
  Shield, 
  Key, 
  Camera, 
  Globe, 
  Clock, 
  Bell, 
  Trash2, 
  Save, 
  Check, 
  AlertTriangle, 
  Smartphone,
  LogOut,
  X
} from 'lucide-react';
import { cn } from '../lib/cn';

// Helper Component: Toggle Switch
const ToggleSwitch = ({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <p className="text-[10px] font-bold text-zinc-text uppercase tracking-widest">{label}</p>
      {description && <p className="text-[9px] font-medium text-zinc-muted mt-0.5">{description}</p>}
    </div>
    <button 
      onClick={() => onChange(!checked)}
      className={cn(
        "w-10 h-5 rounded-full relative transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-brand/50",
        checked ? "bg-brand" : "bg-obsidian-outer border border-white/10"
      )}
    >
      <div className={cn(
        "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out",
        checked ? "translate-x-5" : "translate-x-0"
      )} />
    </button>
  </div>
);

// Helper Component: Section Header
const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle?: string }) => (
  <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
    <Icon className="w-4 h-4 text-brand" />
    <div>
      <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">{title}</h3>
      {subtitle && <p className="text-[9px] text-zinc-muted uppercase tracking-wider mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

export const Profile = () => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -- State --
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'notifications'>('general');
  const [avatar, setAvatar] = useState<string | null>(null);
  
  const [info, setInfo] = useState({
    firstName: 'Alex',
    lastName: 'Morgan',
    email: 'alex.morgan@zonevast.corp',
    phone: '+1 (555) 012-3456',
    bio: 'Senior Catalog Administrator with Level 5 clearance.',
    role: 'Super Admin',
    language: 'en',
    timezone: 'utc-5'
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactor: true
  });

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    securityAlerts: true,
    marketing: false,
    projectActivity: true
  });

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // -- Handlers --

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculatePasswordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length > 7) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = calculatePasswordStrength(security.newPassword);

  const getStrengthColor = (score: number) => {
    if (score <= 25) return 'bg-danger';
    if (score <= 50) return 'bg-warning';
    if (score <= 75) return 'bg-info';
    return 'bg-success';
  };

  const handleSaveInfo = () => {
    // Simulate save
    alert("Profile information updated successfully.");
  };

  const handlePasswordChange = () => {
    if (security.newPassword !== security.confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    // Simulate API
    alert("Password updated securely.");
    setSecurity(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
  };

  return (
    <div className="animate-fade-up max-w-5xl mx-auto py-6 px-4 space-y-8">
      
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-zinc-text tracking-tighter uppercase italic">{t('profile.account')}</h1>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Manage your identity and preferences</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => alert("Logged Out")}
             className="flex items-center gap-2 px-4 py-2 bg-danger/10 border border-danger/20 rounded-sm text-[10px] font-black text-danger hover:bg-danger/20 transition-all uppercase tracking-widest"
           >
             <LogOut className="w-3.5 h-3.5" /> {t('profile.logout')}
           </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 space-x-6">
        {[
          { id: 'general', label: 'General', icon: User },
          { id: 'security', label: 'Security', icon: Shield },
          { id: 'notifications', label: 'Notifications', icon: Bell }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 pb-3 border-b-2 text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === tab.id 
                ? "border-brand text-brand" 
                : "border-transparent text-zinc-muted hover:text-zinc-text hover:border-white/10"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Basic Info Card (Persistent) */}
        <div className="space-y-6">
          <Card className="p-6 text-center space-y-6 bg-obsidian-panel/60" glass>
            <div className="relative inline-block group">
              <div className="w-28 h-28 rounded-full bg-obsidian-outer border-2 border-white/5 flex items-center justify-center overflow-hidden mx-auto shadow-xl">
                {avatar ? (
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-black text-brand italic">AM</span>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-brand text-obsidian-outer rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer border border-obsidian-panel"
                title="Change Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
            </div>
            
            <div>
              <h2 className="text-xl font-black text-zinc-text uppercase italic tracking-tighter">{info.firstName} {info.lastName}</h2>
              <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-[0.2em] mt-1">{info.role}</p>
            </div>

            <div className="pt-6 border-t border-white/5 flex flex-col gap-2">
               <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-zinc-muted uppercase tracking-widest">Clearance</span>
                  <span className="text-brand uppercase">Level 5</span>
               </div>
               <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-zinc-muted uppercase tracking-widest">Status</span>
                  <span className="text-success uppercase">Active</span>
               </div>
               <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-zinc-muted uppercase tracking-widest">Joined</span>
                  <span className="text-zinc-text uppercase">Mar 2024</span>
               </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Dynamic Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* --- GENERAL TAB --- */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <Card className="p-6">
                <SectionHeader icon={User} title="Personal Information" subtitle="Update your identity details" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AmberInput 
                    label={t('settings.fname')}
                    value={info.firstName}
                    onChange={(e) => setInfo({ ...info, firstName: e.target.value })}
                  />
                  <AmberInput 
                    label={t('settings.lname')}
                    value={info.lastName}
                    onChange={(e) => setInfo({ ...info, lastName: e.target.value })}
                  />
                  <div className="md:col-span-2">
                    <AmberInput 
                      label={t('settings.email')}
                      type="email"
                      value={info.email}
                      onChange={(e) => setInfo({ ...info, email: e.target.value })}
                      icon={<Mail className="w-4 h-4" />}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <AmberInput 
                      label="Phone Number"
                      type="tel"
                      value={info.phone}
                      onChange={(e) => setInfo({ ...info, phone: e.target.value })}
                      icon={<Smartphone className="w-4 h-4" />}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <AmberInput 
                      label={t('settings.bio')}
                      multiline
                      rows={3}
                      value={info.bio}
                      onChange={(e) => setInfo({ ...info, bio: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button onClick={handleSaveInfo} size="sm">
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <SectionHeader icon={Globe} title="Regional Preferences" subtitle="Localization settings" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Language</label>
                    <AmberDropdown 
                      options={[
                        { label: 'English (US)', value: 'en' },
                        { label: 'Arabic (AR)', value: 'ar' },
                        { label: 'Spanish (ES)', value: 'es' },
                      ]}
                      value={info.language}
                      onChange={(val) => setInfo({ ...info, language: val })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-1.5 block">Timezone</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
                      <select 
                        className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all appearance-none cursor-pointer"
                        value={info.timezone}
                        onChange={(e) => setInfo({ ...info, timezone: e.target.value })}
                      >
                        <option value="utc">UTC (Coordinated Universal Time)</option>
                        <option value="utc-5">EST (UTC-05:00)</option>
                        <option value="utc-8">PST (UTC-08:00)</option>
                        <option value="utc+1">CET (UTC+01:00)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* --- SECURITY TAB --- */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <Card className="p-6">
                <SectionHeader icon={Key} title="Password Management" subtitle="Update your access credentials" />
                <div className="space-y-5 max-w-md">
                  <AmberInput 
                    label="Current Password"
                    type="password"
                    value={security.currentPassword}
                    onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                  />
                  <div className="space-y-2">
                    <AmberInput 
                      label="New Password"
                      type="password"
                      value={security.newPassword}
                      onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                    />
                    {security.newPassword && (
                      <div className="flex gap-1 h-1 w-full bg-obsidian-outer rounded-full overflow-hidden">
                        <div className={cn("h-full transition-all duration-300", getStrengthColor(passwordStrength))} style={{ width: `${passwordStrength}%` }} />
                      </div>
                    )}
                    {security.newPassword && (
                      <p className="text-[8px] font-bold text-zinc-muted uppercase text-right">
                        Strength: {passwordStrength < 50 ? 'Weak' : passwordStrength < 75 ? 'Medium' : 'Strong'}
                      </p>
                    )}
                  </div>
                  <AmberInput 
                    label="Confirm New Password"
                    type="password"
                    value={security.confirmPassword}
                    onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                  />
                  <div className="pt-2">
                    <Button onClick={handlePasswordChange} size="sm" disabled={!security.currentPassword || !security.newPassword}>
                      Update Password
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <SectionHeader icon={Shield} title="Two-Factor Authentication" subtitle="Enhanced account security" />
                <div className="flex items-center justify-between p-4 bg-obsidian-outer/50 border border-white/5 rounded-sm">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", security.twoFactor ? "bg-success/10 text-success" : "bg-zinc-muted/10 text-zinc-muted")}>
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-zinc-text uppercase tracking-tight">Authenticator App</p>
                      <p className="text-[9px] font-medium text-zinc-muted mt-0.5">Use Google Authenticator or Authy</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn("text-[9px] font-bold uppercase tracking-widest", security.twoFactor ? "text-success" : "text-zinc-muted")}>
                      {security.twoFactor ? "Enabled" : "Disabled"}
                    </span>
                    <button 
                      onClick={() => setSecurity(prev => ({ ...prev, twoFactor: !prev.twoFactor }))}
                      className={cn(
                        "w-10 h-5 rounded-full relative transition-colors focus:outline-none",
                        security.twoFactor ? "bg-success" : "bg-obsidian-card border border-white/10"
                      )}
                    >
                      <div className={cn(
                        "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
                        security.twoFactor ? "translate-x-5" : "translate-x-0"
                      )} />
                    </button>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-danger/20 bg-danger/[0.02]">
                <SectionHeader icon={AlertTriangle} title="Danger Zone" subtitle="Irreversible account actions" />
                {!isDeleteConfirmOpen ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-zinc-text">Delete Account</p>
                      <p className="text-[9px] text-zinc-muted mt-1">Permanently remove your account and all data.</p>
                    </div>
                    <button 
                      onClick={() => setIsDeleteConfirmOpen(true)}
                      className="px-4 py-2 bg-danger/10 text-danger border border-danger/20 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-danger/20 transition-all"
                    >
                      Delete Account
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in zoom-in-95">
                    <p className="text-[10px] font-bold text-danger uppercase tracking-widest">Are you absolutely sure? This action cannot be undone.</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => alert("Account deletion simulation started.")}
                        className="px-4 py-2 bg-danger text-white rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-danger/90 transition-all"
                      >
                        Yes, Delete Everything
                      </button>
                      <button 
                        onClick={() => setIsDeleteConfirmOpen(false)}
                        className="px-4 py-2 bg-transparent border border-white/10 text-zinc-muted rounded-sm text-[10px] font-black uppercase tracking-widest hover:text-zinc-text transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* --- NOTIFICATIONS TAB --- */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <Card className="p-6">
                <SectionHeader icon={Bell} title="Email Preferences" subtitle="Manage what you receive via email" />
                <div className="space-y-1 divide-y divide-white/5">
                  <ToggleSwitch 
                    label="System Updates" 
                    description="Receive emails about major system updates and maintenance."
                    checked={notifications.emailUpdates}
                    onChange={(v) => setNotifications({ ...notifications, emailUpdates: v })}
                  />
                  <ToggleSwitch 
                    label="Security Alerts" 
                    description="Get notified about suspicious logins or password changes."
                    checked={notifications.securityAlerts}
                    onChange={(v) => setNotifications({ ...notifications, securityAlerts: v })}
                  />
                  <ToggleSwitch 
                    label="Marketing & News" 
                    description="Receive our monthly newsletter and promotional offers."
                    checked={notifications.marketing}
                    onChange={(v) => setNotifications({ ...notifications, marketing: v })}
                  />
                  <ToggleSwitch 
                    label="Project Activity" 
                    description="Digest of project changes and team comments."
                    checked={notifications.projectActivity}
                    onChange={(v) => setNotifications({ ...notifications, projectActivity: v })}
                  />
                </div>
              </Card>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
