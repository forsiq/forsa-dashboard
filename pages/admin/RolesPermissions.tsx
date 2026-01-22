
import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, Plus, Check, X, ShieldAlert, Lock, MoreHorizontal } from 'lucide-react';
import { useLanguage } from '../../amber-ui/contexts/LanguageContext';
import { cn } from '../../lib/cn';

const roles = [
  { id: 'role_admin', name: 'Super Administrator', users: 2, status: 'Active', permissions: ['Full Access', 'System Control', 'Auth Override'] },
  { id: 'role_catalog', name: 'Catalog Manager', users: 5, status: 'Active', permissions: ['SKU Write', 'Inventory Sync', 'Pricing Control'] },
  { id: 'role_editor', name: 'Content Editor', users: 12, status: 'Active', permissions: ['SKU Metadata', 'Media Assets'] },
  { id: 'role_viewer', name: 'System Auditor', users: 8, status: 'Active', permissions: ['Read Only', 'Logs View'] },
];

export const RolesPermissions = () => {
  const { t } = useLanguage();

  return (
    <div className="animate-fade-up space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-text tracking-tighter uppercase italic">{t('roles.title')}</h1>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1 italic">{t('roles.subtitle')}</p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" /> {t('roles.add')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card noPadding className="bg-obsidian-panel/30 border-white/[0.03]" glass>
            <div className="overflow-x-auto">
              <table className="w-full text-start">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                    <th className="px-6 py-4 text-start text-[9px] font-black text-zinc-muted uppercase tracking-widest italic">{t('roles.table.identity')}</th>
                    <th className="px-6 py-4 text-start text-[9px] font-black text-zinc-muted uppercase tracking-widest italic">{t('roles.table.scope')}</th>
                    <th className="px-6 py-4 text-start text-[9px] font-black text-zinc-muted uppercase tracking-widest italic">{t('roles.table.integrity')}</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {roles.map((role) => (
                    <tr key={role.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-sm bg-obsidian-outer border border-white/5 flex items-center justify-center text-info">
                             <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-zinc-text uppercase tracking-tight italic group-hover:text-brand transition-colors">{role.name}</p>
                            <p className="text-[9px] font-bold text-zinc-muted uppercase font-mono">{role.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                         <div className="flex flex-wrap gap-1.5">
                            {role.permissions.map((p, i) => (
                              <span key={i} className="text-[8px] font-black px-1.5 py-0.5 rounded-sm bg-white/5 border border-white/10 text-zinc-secondary uppercase tracking-tighter">
                                {p}
                              </span>
                            ))}
                         </div>
                      </td>
                      <td className="px-6 py-3">
                         <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                            <span className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">{role.users} Active Holders</span>
                         </div>
                      </td>
                      <td className="px-6 py-3 text-end">
                         <button className="p-2 text-zinc-muted hover:text-brand transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 border-brand/20">
             <div className="flex items-center gap-3 mb-4">
                <ShieldAlert className="w-5 h-5 text-brand" />
                <h3 className="text-xs font-black text-brand uppercase tracking-[0.3em] italic">{t('roles.protocol')}</h3>
             </div>
             <p className="text-[10px] font-bold text-zinc-muted uppercase italic leading-relaxed opacity-70 mb-6">
                Node-level authorization is enforced via cryptographic tokens. Revoking a role will immediately terminate all active sessions associated with that policy cluster.
             </p>
             <div className="space-y-3">
                {[
                  { label: 'Enforce MFA on High Clear', status: true },
                  { label: 'Session Persistence', status: false },
                  { label: 'Auto-Revoke Idle Nodes', status: true },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-obsidian-outer border border-white/5 rounded-sm">
                    <span className="text-[9px] font-black text-zinc-text uppercase tracking-widest italic">{s.label}</span>
                    {s.status ? <Check className="w-3.5 h-3.5 text-success" /> : <X className="w-3.5 h-3.5 text-danger" />}
                  </div>
                ))}
             </div>
          </Card>

          <Card className="p-6 bg-obsidian-panel/40" glass>
             <div className="flex items-center gap-3 mb-4">
                <Lock className="w-5 h-5 text-zinc-muted" />
                <h3 className="text-xs font-black text-zinc-text uppercase tracking-[0.3em] italic">{t('roles.hardening')}</h3>
             </div>
             <p className="text-[10px] font-bold text-zinc-muted uppercase italic leading-relaxed mb-4">
                All changes to security policies are logged in the <strong>Audit Vault</strong> with an immutable timestamp and actor fingerprint.
             </p>
             <Button variant="ghost" className="w-full text-[9px] border-white/10 italic">View Policy History</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
