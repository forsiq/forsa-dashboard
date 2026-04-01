import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { AmberInput } from '@core/components/AmberInput';
import { AmberButton } from '@core/components/AmberButton';
import { useAuth } from '../hooks/useAuth';
import { RegisterData } from '../types';
import { useLanguage } from '@core/contexts/LanguageContext';

export const RegisterForm: React.FC = () => {
  const { t } = useLanguage();
  const { register, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return; // Error: passwords don't match
    }

    try {
      await register(formData);
    } catch (err) {
      // Error is handled by useAuth hook
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-zinc-text tracking-tighter uppercase italic">
          {t('auth.register.title') || 'Create Account'}
        </h1>
        <p className="text-sm font-medium text-zinc-muted">
          {t('auth.register.subtitle') || 'Join the ZoneVast ecosystem'}
        </p>
      </div>

      {error && (
        <div className="p-4 bg-danger/5 border border-danger/20 rounded-sm">
          <p className="text-sm text-danger font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <AmberInput
          label={t('auth.register.username') || 'Username'}
          placeholder={t('auth.register.username_placeholder') || 'Choose a username'}
          icon={<User className="w-4 h-4" />}
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
        />

        <AmberInput
          label={t('auth.register.email') || 'Email'}
          type="email"
          placeholder={t('auth.register.email_placeholder') || 'Enter your email'}
          icon={<Mail className="w-4 h-4" />}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <AmberInput
          label={t('auth.register.password') || 'Password'}
          type={showPassword ? 'text' : 'password'}
          placeholder={t('auth.register.password_placeholder') || 'Create a password'}
          icon={<Lock className="w-4 h-4" />}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />

        <AmberInput
          label={t('auth.register.confirm_password') || 'Confirm Password'}
          type={showPassword ? 'text' : 'password'}
          placeholder={t('auth.register.confirm_password_placeholder') || 'Confirm your password'}
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
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          error={formData.password !== formData.confirmPassword && formData.confirmPassword ? 'Passwords do not match' : ''}
          required
        />

        <AmberButton
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (t('common.loading') || 'Loading...') : (t('auth.register.submit') || 'Create Account')}
        </AmberButton>
      </form>

      <div className="text-center">
        <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-wider">
          {t('auth.register.has_account') || 'Already have an account?'}{' '}
          <Link
            to="/login"
            className="text-brand hover:text-brand/80 transition-colors"
          >
            {t('auth.register.login') || 'Sign in'}
          </Link>
        </p>
      </div>
    </div>
  );
};
