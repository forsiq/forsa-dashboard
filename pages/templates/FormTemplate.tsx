
import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  ArrowLeft, 
  Save, 
  X, 
  HelpCircle, 
  ShieldCheck, 
  Sparkles,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../amber-ui/contexts/LanguageContext';

export const FormTemplate = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  return (
    <div className="animate-fade-up max-w-6xl mx-auto py-4 space-y-8">
      {/* Dynamic Action Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-obsidian-card border border-white/5 rounded-sm text-zinc-muted hover:text-zinc-text transition-all"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-zinc-text uppercase tracking-tighter">{t('form.init_resource')}</h1>
            <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">{t('form.service_module')}: AUTH_SYSTEM_V2</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <X className="w-3.5 h-3.5 me-2" /> {t('form.discard')}
          </Button>
          <Button size="sm">
            <Save className="w-3.5 h-3.5 me-2" /> {t('form.commit_changes')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Entry Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="space-y-8" glass>
            <section className="space-y-4">
              <h3 className="text-xs font-black text-brand uppercase tracking-[0.4em] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> {t('form.primary_config')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">{t('form.resource_name')}</label>
                  <input 
                    type="text" 
                    placeholder="...Enter unique identifier"
                    className="w-full h-11 bg-obsidian-outer border border-white/5 rounded-sm px-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all italic"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">{t('form.cluster_region')}</label>
                  <select className="w-full h-11 bg-obsidian-outer border border-white/5 rounded-sm px-4 text-xs font-bold text-zinc-secondary outline-none focus:border-brand/30 transition-all appearance-none cursor-pointer">
                    <option>US-East (Primary)</option>
                    <option>EU-West (Secondary)</option>
                    <option>AP-South (Edge)</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-black text-zinc-muted uppercase tracking-[0.4em] flex items-center gap-2">
                 <Info className="w-4 h-4" /> {t('form.extended_metadata')}
              </h3>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">{t('form.resource_desc')}</label>
                <textarea 
                  rows={4}
                  placeholder="Describe the operational scope of this node..."
                  className="w-full bg-obsidian-outer border border-white/5 rounded-sm p-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all italic resize-none"
                />
              </div>
              <div className="flex flex-wrap items-center gap-6 pt-2">
                 <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="hidden peer" />
                    <div className="w-5 h-5 bg-obsidian-outer border border-white/10 rounded-sm flex items-center justify-center text-brand transition-all peer-checked:bg-brand/10 peer-checked:border-brand">
                       <ShieldCheck className="w-3 h-3 opacity-0 peer-checked:opacity-100" />
                    </div>
                    <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest group-hover:text-zinc-text transition-colors">{t('form.encrypt_data')}</span>
                 </label>
                 <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" defaultChecked className="hidden peer" />
                    <div className="w-5 h-5 bg-obsidian-outer border border-white/10 rounded-sm flex items-center justify-center text-brand transition-all peer-checked:bg-brand/10 peer-checked:border-brand">
                       <ShieldCheck className="w-3 h-3 opacity-0 peer-checked:opacity-100" />
                    </div>
                    <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest group-hover:text-zinc-text transition-colors">{t('form.active_monitoring')}</span>
                 </label>
              </div>
            </section>
          </Card>

          <Card className="bg-success/5 border-success/10 flex items-center justify-between p-6">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-sm bg-success/10 border border-success/20 flex items-center justify-center text-success">
                   <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                   <h4 className="text-xs font-black text-success uppercase tracking-widest">{t('form.validation_passed')}</h4>
                   <p className="text-[9px] font-bold text-success/70 uppercase tracking-widest">{t('form.integrity_note')}</p>
                </div>
             </div>
             <div className="text-[11px] font-mono font-bold text-success">SEC_CODE: OK_200</div>
          </Card>
        </div>

        {/* Sidebar Context */}
        <div className="space-y-6">
          <Card className="p-5 border-brand/20">
            <h3 className="text-xs font-black text-brand uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> {t('form.live_manifest')}
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">AUTHOR</span>
                <span className="text-[10px] font-bold text-zinc-text uppercase tracking-tight italic">ALEX MORGAN</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">SYNC PRIORITY</span>
                <span className="text-[10px] font-bold text-info uppercase tracking-tight">HIGH</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">ETA DEPLOYMENT</span>
                <span className="text-[10px] font-bold text-zinc-text uppercase tracking-tight font-mono">14.00S</span>
              </div>
            </div>
            <p className="mt-6 text-[9px] font-bold text-zinc-muted leading-relaxed uppercase italic opacity-60">
              {language === 'ar' ? 'ملاحظة: التغييرات التي يتم الالتزام بها لهذه العقدة ستنتشر عالميًا عبر الـ 14 مجموعة إقليمية خلال نافذة التحديث المجدولة.' : 'NOTE: CHANGES COMMITTED TO THIS NODE WILL PROPAGATE GLOBALLY THROUGH THE 14 REGIONAL CLUSTERS WITHIN THE SCHEDULED REFRESH WINDOW.'}
            </p>
          </Card>

          <Card className="p-5 bg-obsidian-outer/40" glass>
            <div className="flex items-center gap-3 mb-4">
              <HelpCircle className="w-4 h-4 text-zinc-muted" />
              <h4 className="text-[10px] font-black text-zinc-text uppercase tracking-widest italic">{t('form.operational_help')}</h4>
            </div>
            <ul className="space-y-3">
              {[
                language === 'ar' ? 'تأكد من أن معرف المورد فريد ضمن النطاق العالمي.' : 'ENSURE THE RESOURCE IDENTIFIER IS UNIQUE WITHIN THE GLOBAL SCOPE.',
                language === 'ar' ? 'يجب اختيار المجموعات الإقليمية بناءً على القرب من أصحاب المصلحة الأساسيين.' : 'REGIONAL CLUSTERS MUST BE SELECTED BASED ON PROXIMITY TO PRIMARY STAKEHOLDERS.',
                language === 'ar' ? 'يضيف التشفير ما يقرب من 14 مللي ثانية من التأخير في معالجة البيانات.' : 'ENCRYPTION ADDS APPROXIMALLY 14MS OF LATENCY TO DATA THROUGHPUT.'
              ].map((tip, i) => (
                <li key={i} className="text-[9px] font-bold text-zinc-muted uppercase tracking-tight leading-relaxed flex gap-2">
                  <span className="text-brand">•</span> {tip}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};
