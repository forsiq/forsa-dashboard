import React from 'react';
import { User, Mail } from 'lucide-react';
import { AmberInput } from '@core/components/AmberInput';
import { AmberButton } from '@core/components/AmberButton';
import { AmberCard } from '@core/components/AmberCard';
import { useSettings } from '../hooks/useSettings';
import { useLanguage } from '@core/contexts/LanguageContext';

export const SettingsForm: React.FC = () => {
  const { t } = useLanguage();
  const { profile, updateProfile, isLoading } = useSettings();
  const [formData, setFormData] = React.useState(profile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(formData);
  };

  return (
    <AmberCard>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AmberInput
            label={t('settings.firstName') || 'First Name'}
            icon={<User className="w-4 h-4" />}
            value={formData.firstName || ''}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />

          <AmberInput
            label={t('settings.lastName') || 'Last Name'}
            icon={<User className="w-4 h-4" />}
            value={formData.lastName || ''}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </div>

        <AmberInput
          label={t('settings.username') || 'Username'}
          icon={<User className="w-4 h-4" />}
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        />

        <AmberInput
          label={t('settings.email') || 'Email'}
          type="email"
          icon={<Mail className="w-4 h-4" />}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <div className="flex justify-end">
          <AmberButton
            type="submit"
            variant="primary"
            disabled={isLoading}
          >
            {t('common.save') || 'Save Changes'}
          </AmberButton>
        </div>
      </form>
    </AmberCard>
  );
};
