import React, { useState } from 'react';
import { useProject, useLanguage } from '@core/contexts';
import { AmberButton } from '@core/components';
import { Logo } from 'lucide-react';

interface ProjectOnboardingProps {
  onSuccess?: () => void;
}

export const ProjectOnboarding: React.FC<ProjectOnboardingProps> = ({ onSuccess }) => {
  const { fetchProjectByUsername, isLoading, error } = useProject();
  const { t, dir } = useLanguage();
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) return;

    setIsSubmitting(true);
    const result = await fetchProjectByUsername(username);
    setIsSubmitting(false);

    if (result) {
      onSuccess?.();
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-outer flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
            <Logo className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-zinc-text tracking-tighter">
            ZONEVAST
          </h1>
          <p className="text-zinc-muted mt-2">
            {dir === 'rtl' ? 'أدخل اسم المشروع للمتابعة' : 'Enter your project to continue'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-text mb-2">
              {dir === 'rtl' ? 'اسم المستخدم للمشروع' : 'Project Username'}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={dir === 'rtl' ? 'مثال: my-project' : 'e.g., my-project'}
              dir="ltr"
              className="w-full px-4 py-3 rounded-lg bg-obsidian-card border border-white/10 text-zinc-text placeholder:text-zinc-muted focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              disabled={isLoading || isSubmitting}
              autoFocus
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <AmberButton
            type="submit"
            disabled={!username.trim() || isLoading || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {dir === 'rtl' ? 'جاري التحميل...' : 'Loading...'}
              </span>
            ) : (
              <span>{dir === 'rtl' ? 'متابعة' : 'Continue'}</span>
            )}
          </AmberButton>
        </form>

        {/* Help text */}
        <p className="mt-6 text-center text-sm text-zinc-muted">
          {dir === 'rtl'
            ? 'أدخل اسم المستخدم الخاص بمشروعك للوصول إلى لوحة التحكم'
            : 'Enter your project username to access your dashboard'
          }
        </p>
      </div>
    </div>
  );
};

export default ProjectOnboarding;
