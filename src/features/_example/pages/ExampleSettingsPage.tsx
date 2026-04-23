import React from 'react';
import { Settings } from 'lucide-react';
import { AmberCard } from '@core/components/AmberCard';
import { AmberInput } from '@core/components/AmberInput';
import { AmberButton } from '@core/components/AmberButton';

export const ExampleSettingsPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-zinc-text tracking-tighter uppercase">
          Example Settings
        </h1>
        <p className="text-sm text-zinc-muted mt-1">
          Configure the example feature settings
        </p>
      </div>

      {/* Settings */}
      <div className="space-y-6">
        <AmberCard>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-brand/10 rounded-lg">
              <Settings className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h2 className="text-sm font-black text-zinc-text uppercase tracking-wider">
                General Settings
              </h2>
              <p className="text-[10px] text-zinc-muted uppercase tracking-wider">
                Configure basic feature behavior
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <AmberInput
              label="Items per page"
              type="number"
              value="10"
              onChange={(e) => console.log('Change items per page:', e.target.value)}
            />

            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <div>
                <p className="text-sm font-bold text-zinc-text">Enable notifications</p>
                <p className="text-[10px] text-zinc-muted">Get notified about changes</p>
              </div>
              <button className="w-12 h-6 bg-brand rounded-full relative">
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-bold text-zinc-text">Auto-save drafts</p>
                <p className="text-[10px] text-zinc-muted">Save work automatically</p>
              </div>
              <button className="w-12 h-6 bg-zinc-muted rounded-full relative">
                <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-white/5">
            <AmberButton variant="primary">
              Save Settings
            </AmberButton>
          </div>
        </AmberCard>
      </div>
    </div>
  );
};
