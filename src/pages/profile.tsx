'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  User,
  Mail,
  Lock,
  Camera,
  Eye,
  EyeOff,
  Loader2,
  Save,
  Shield,
  Phone,
} from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { useToast } from '@core/contexts/ToastContext';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { AmberCard } from '@core/components/AmberCard';
import { cn } from '@core/lib/utils/cn';
import { getUser, getAccessToken } from '@core/lib';
import { AUTH_API_BASE } from '@config/api';
import { FormSection } from '@core/components/FormSection';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatar: string | null;
}

async function fetchProfile(): Promise<UserProfile | null> {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const response = await fetch(`${AUTH_API_BASE}user/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Project-ID': '11',
        'X-Project': '11',
      },
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

async function updateProfile(data: Partial<UserProfile>): Promise<boolean> {
  const token = getAccessToken();
  if (!token) return false;

  try {
    const response = await fetch(`${AUTH_API_BASE}user/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Project-ID': '11',
        'X-Project': '11',
      },
      body: JSON.stringify(data),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function changePassword(currentPassword: string, newPassword: string): Promise<{ ok: boolean; message?: string }> {
  const token = getAccessToken();
  if (!token) return { ok: false, message: 'Not authenticated' };

  try {
    const response = await fetch(`${AUTH_API_BASE}password/change/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Project-ID': '11',
        'X-Project': '11',
      },
      body: JSON.stringify({
        old_password: currentPassword,
        new_password: newPassword,
      }),
    });
    if (response.ok) return { ok: true };
    const data = await response.json().catch(() => ({}));
    return { ok: false, message: data.detail || data.message || 'Password change failed' };
  } catch {
    return { ok: false, message: 'Network error' };
  }
}

export default function ProfilePage() {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const toast = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    fetchProfile().then((data) => {
      if (data) {
        setProfile(data);
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setEmail(data.email || '');
      } else {
        const cookieUser = getUser();
        if (cookieUser) {
          setProfile({
            id: cookieUser.id,
            username: cookieUser.username,
            email: cookieUser.email || '',
            first_name: '',
            last_name: '',
            phone: '',
            avatar: null,
          });
          setEmail(cookieUser.email || '');
        }
      }
      setIsLoading(false);
    });
  }, [isClient]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const ok = await updateProfile({
        first_name: firstName,
        last_name: lastName,
        email,
      });
      if (ok) {
        toast.success(t('profile.saved') || 'Profile updated successfully');
      } else {
        toast.error(t('profile.save_failed') || 'Failed to update profile');
      }
    } catch {
      toast.error(t('profile.save_failed') || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error(t('auth.register.password_mismatch_inline') || 'Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error(t('validation.password_too_short') || 'Password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      const result = await changePassword(currentPassword, newPassword);
      if (result.ok) {
        toast.success(t('profile.password_changed') || 'Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(result.message || t('profile.password_change_failed') || 'Failed to change password');
      }
    } catch {
      toast.error(t('profile.password_change_failed') || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian-outer">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
          <p className="text-xs font-mono text-zinc-muted uppercase tracking-widest">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700"
      dir={dir}
    >
      {/* Header */}
      <div className={cn('flex flex-col sm:flex-row sm:items-start justify-between gap-6 text-start')}>
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-zinc-text tracking-tight leading-none">
            {t('profile.title') || 'Profile'}
          </h1>
          <p className="text-base text-zinc-secondary font-bold">
            {t('profile.subtitle') || 'Manage your account information'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left - Avatar + Info */}
        <div className="space-y-6">
          <AmberCard className="p-8 bg-obsidian-card border-border shadow-xl space-y-6 text-center">
            {/* Avatar */}
            <div className="flex justify-center">
              <div className="relative group">
                <div className="w-28 h-28 rounded-2xl bg-brand/10 border-2 border-brand/20 flex items-center justify-center overflow-hidden">
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-14 h-14 text-brand/40" />
                  )}
                </div>
                <button
                  className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => toast.info(t('profile.avatar_coming_soon') || 'Avatar upload coming soon')}
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* User Info */}
            <div className="space-y-1">
              <h3 className="text-lg font-black text-zinc-text uppercase tracking-tight">
                {profile?.username || '—'}
              </h3>
              {profile?.email && (
                <p className="text-sm font-medium text-zinc-muted flex items-center justify-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {profile.email}
                </p>
              )}
              {profile?.phone && (
                <p className="text-sm font-medium text-zinc-muted flex items-center justify-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  {profile.phone}
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-white/5">
              <span className="text-[11px] font-black text-zinc-muted uppercase tracking-widest">
                ID: {profile?.id || '—'}
              </span>
            </div>
          </AmberCard>
        </div>

        {/* Right - Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Profile */}
          <FormSection
            icon={<User className="w-5 h-5" />}
            iconBgColor="brand"
            title={t('profile.edit_info') || 'Edit Profile'}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AmberInput
                  label={t('settings.first_name') || 'First Name'}
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <AmberInput
                  label={t('settings.last_name') || 'Last Name'}
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <AmberInput
                label={t('auth.register.email') || 'Email'}
                type="email"
                placeholder="you@example.com"
                icon={<Mail className="w-5 h-5 text-brand/60" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className="flex justify-end pt-4 border-t border-white/5">
                <AmberButton
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="px-8 h-11 bg-[var(--color-brand)] hover:bg-[var(--color-brand)] text-black font-bold rounded-xl shadow-sm transition-all border-none active:scale-95"
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2 text-black">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('common.saving')}
                    </span>
                  ) : (
                    <>
                      <Save className={cn('w-4 h-4 text-black me-2')} />
                      <span className="text-black">{t('settings.save') || 'Save'}</span>
                    </>
                  )}
                </AmberButton>
              </div>
            </div>
          </FormSection>

          {/* Change Password */}
          <FormSection
            icon={<Lock className="w-5 h-5" />}
            iconBgColor="danger"
            title={t('profile.change_password') || 'Change Password'}
          >
            <div className="space-y-6">
              <AmberInput
                label={t('profile.current_password') || 'Current Password'}
                type={showPasswords ? 'text' : 'password'}
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <AmberInput
                label={t('profile.new_password') || 'New Password'}
                type={showPasswords ? 'text' : 'password'}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <div className="space-y-2">
                <AmberInput
                  label={t('auth.register.confirm_password') || 'Confirm Password'}
                  type={showPasswords ? 'text' : 'password'}
                  placeholder="••••••••"
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="p-2 me-2 text-zinc-muted hover:text-brand transition-colors outline-none"
                    >
                      {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  }
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-zinc-muted">
                  <Shield className="w-4 h-4" />
                  <span className="text-[11px] font-semibold tracking-wider uppercase">
                    {t('profile.password_hint') || 'Min 6 characters'}
                  </span>
                </div>
                <AmberButton
                  onClick={handleChangePassword}
                  disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                  className="px-8 h-11 bg-[var(--color-brand)] hover:bg-[var(--color-brand)] text-black font-bold rounded-xl shadow-sm transition-all border-none active:scale-95"
                >
                  {isChangingPassword ? (
                    <span className="flex items-center gap-2 text-black">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('common.saving')}
                    </span>
                  ) : (
                    <span className="text-black">{t('profile.update_password') || 'Update Password'}</span>
                  )}
                </AmberButton>
              </div>
            </div>
          </FormSection>
        </div>
      </div>
    </div>
  );
}
