import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { AmberInput } from '@core/components/AmberInput';
import { AmberButton } from '@core/components/AmberButton';
import { AmberCard } from '@core/components/AmberCard';
import { useAuth } from '../hooks/useAuth';
import { LoginCredentials } from '../types';
import { useLanguage } from '@core/contexts/LanguageContext';

export const LoginForm: React.FC = () => {
  const { t, dir } = useLanguage();
  const { login, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(credentials);
    } catch (err) {
      // Error is handled by useAuth hook
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-zinc-text tracking-tighter uppercase italic">
          {t('login.welcome')}
        </h1>
        <p className="text-sm font-medium text-zinc-muted">
          {t('login.subtitle')}
        </p>
      </div>

      {error && (
        <AmberCard className="bg-danger/5 border-danger/20">
          <p className="text-sm text-danger font-medium">{error}</p>
        </AmberCard>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <AmberInput
          label={t('login.email')}
          placeholder={t('login.email')}
          icon={<Mail className="w-4 h-4" />}
          value={credentials.username}
          onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
          required
        />

        <AmberInput
          label={t('login.password')}
          type={showPassword ? 'text' : 'password'}
          placeholder={t('login.password')}
          icon={<Lock className="w-4 h-4" />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-zinc-muted hover:text-zinc-text transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          required
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-white/10 bg-obsidian-panel" />
            <span className="text-[10px] font-bold text-zinc-muted uppercase tracking-wider">
              {t('login.remember')}
            </span>
          </label>
          <Link
            to="/forgot-password"
            className="text-[10px] font-bold text-brand hover:text-brand/80 transition-colors uppercase tracking-wider"
          >
            {t('login.forgot')}
          </Link>
        </div>

        <AmberButton
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? t('common.loading') : t('login.button')}
        </AmberButton>
      </form>

      <div className="text-center">
        <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-wider">
          {t('login.no_account')}{' '}
          <Link
            to="/register"
            className="text-brand hover:text-brand/80 transition-colors"
          >
            {t('login.create_account')}
          </Link>
        </p>
      </div>
    </div>
  );
};
