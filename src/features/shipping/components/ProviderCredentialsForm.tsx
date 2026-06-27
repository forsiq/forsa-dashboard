import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, Plug, Save } from 'lucide-react';
import { AmberInput } from '@core/components/AmberInput';
import { AmberButton } from '@core/components/AmberButton';
import { AmberDropdown } from '@core/components';
import { FormSection } from '@core/components';
import { useLanguage } from '@core/contexts/LanguageContext';
import type {
  ShippingEnvironment,
  ShippingProviderConfig,
  ShippingProviderName,
  TestConnectionInput,
  UpsertProviderInput,
} from '../types';
import { useTestConnection, useUpsertProvider } from '../hooks';

export interface ProviderCredentialsFormProps {
  provider: ShippingProviderConfig | null;
  /** Pass-through from the settings page (toggles the global AmberToggle). */
  enabled?: boolean;
  onEnabledChange?: (v: boolean) => void;
}

const PROVIDER_NAME: ShippingProviderName = 'alwaseet';

/**
 * Provider credentials form (username / password / environment) following the
 * same useState pattern as LoginForm. Calls POST /shipping/providers to save
 * and POST /shipping/test-connection to validate.
 *
 * The form is initialized from the loaded `provider` prop. The parent page
 * (`ShippingProvidersPage`) passes a `key` keyed on the provider identity so
 * that selecting a different provider remounts this component and reseeds the
 * local state cleanly — no `setState`-in-`useEffect` needed.
 */
export const ProviderCredentialsForm: React.FC<ProviderCredentialsFormProps> = ({
  provider,
}) => {
  const { t } = useLanguage();
  const upsert = useUpsertProvider();
  const test = useTestConnection();

  const [username, setUsername] = useState(provider?.username ?? '');
  const [password, setPassword] = useState('');
  const [environment, setEnvironment] = useState<ShippingEnvironment>(
    provider?.environment ?? 'sandbox',
  );
  const [showPassword, setShowPassword] = useState(false);

  const isDirty = !!username && !!password;

  const handleSave = () => {
    if (!username.trim() || !password.trim()) return;
    const input: UpsertProviderInput = {
      providerName: PROVIDER_NAME,
      environment,
      username: username.trim(),
      password,
    };
    upsert.mutate(input);
  };

  const handleTest = () => {
    const input: TestConnectionInput = {
      providerName: PROVIDER_NAME,
      environment,
      // If a password is entered, send it; otherwise let the backend reuse
      // the stored encrypted credentials.
      username: username || undefined,
      password: password || undefined,
    };
    test.mutate(input);
  };

  const busy = upsert.isPending || test.isPending;

  return (
    <FormSection
      icon={<Save className="w-5 h-5" />}
      iconBgColor="info"
      title={t('shipping.credentials')}
    >
      <p className="text-[11px] text-zinc-muted mb-5">
        {t('shipping.credentials_desc')}
      </p>

      <div className="space-y-5">
        <AmberInput
          label={t('shipping.username')}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="merchant_user"
          autoComplete="off"
          disabled={busy}
        />

        <AmberInput
          label={t('shipping.password')}
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          disabled={busy}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="p-2 me-2 text-zinc-muted hover:text-brand transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          }
        />

        <div className="space-y-2">
          <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest block text-start">
            {t('shipping.environment')}
          </label>
          <AmberDropdown
            value={environment}
            onChange={(v) => setEnvironment(v as ShippingEnvironment)}
            options={[
              { value: 'sandbox', label: t('shipping.sandbox') },
              { value: 'production', label: t('shipping.production') },
            ]}
          />
        </div>

        {provider?.lastLoginAt && (
          <p className="text-[11px] text-zinc-muted">
            {t('shipping.last_login')}:{' '}
            {new Date(provider.lastLoginAt).toLocaleString()}
          </p>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <AmberButton
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={busy || !isDirty}
          >
            <Save className="w-4 h-4" />
            <span>{t('shipping.save_credentials')}</span>
          </AmberButton>

          <AmberButton
            variant="secondary"
            size="sm"
            onClick={handleTest}
            disabled={busy || !username}
          >
            {test.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plug className="w-4 h-4" />
            )}
            <span>
              {test.isPending
                ? t('shipping.testing')
                : t('shipping.test_connection')}
            </span>
          </AmberButton>
        </div>
      </div>
    </FormSection>
  );
};

export default ProviderCredentialsForm;
