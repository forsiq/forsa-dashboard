import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Grip,
  ArrowUpRight,
  ExternalLink,
  Hexagon,
  LogOut
} from 'lucide-react';
import { AmberCard } from '../components/AmberCard';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils/cn';
import { getEnabledServices, resolveServiceIcon } from '../../config/services';

export const PortalPage: React.FC = () => {
  const { t, dir } = useLanguage();
  const navigate = useNavigate();

  // Get all enabled services from config
  const services = getEnabledServices();

  const handleServiceClick = (service: typeof services[0]) => {
    if (service.type === 'external') {
      window.open(service.url, '_blank');
    } else {
      navigate(service.route || '/');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Get color classes from service color
  const getColorClasses = (color?: string) => {
    const colorLower = color?.toLowerCase() || '';
    return {
      text: colorLower.includes('purple') ? 'text-purple-500' :
             colorLower.includes('blue') || colorLower.includes('brand') ? 'text-brand' :
             colorLower.includes('amber') ? 'text-amber-500' :
             colorLower.includes('emerald') ? 'text-emerald-500' :
             colorLower.includes('cyan') ? 'text-cyan-500' :
             colorLower.includes('orange') ? 'text-orange-500' :
             colorLower.includes('rose') ? 'text-rose-500' :
             colorLower.includes('indigo') ? 'text-indigo-500' :
             colorLower.includes('red') ? 'text-red-500' :
             'text-info',
      bg: colorLower.includes('purple') ? 'bg-purple-500/10' :
           colorLower.includes('blue') || colorLower.includes('brand') ? 'bg-brand/10' :
           colorLower.includes('amber') ? 'bg-amber-500/10' :
           colorLower.includes('emerald') ? 'bg-emerald-500/10' :
           colorLower.includes('cyan') ? 'bg-cyan-500/10' :
           colorLower.includes('orange') ? 'bg-orange-500/10' :
           colorLower.includes('rose') ? 'bg-rose-500/10' :
           colorLower.includes('indigo') ? 'bg-indigo-500/10' :
           colorLower.includes('red') ? 'bg-red-500/10' :
           'bg-info/10',
    };
  };

  return (
    <div className="space-y-12 py-10 animate-in fade-in duration-700 max-w-7xl mx-auto">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-8">
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="p-2.5 bg-brand/10 rounded-sm border border-brand/20 shadow-[0_0_15px_rgba(255,192,0,0.1)]">
              <Grip className="w-6 h-6 text-brand" />
            </div>
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
              ZV <span className="text-brand">Gateway</span>
            </h1>
          </motion.div>
          <p className="text-zinc-muted max-w-xl text-sm font-medium leading-relaxed tracking-tight">
             {t('portal.subtitle') || 'بوابة الوصول الموحدة من ZoneVast.'}
          </p>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em]">{t('portal.operational_status') || 'حالة التشغيل'}</span>
              <div className="flex items-center gap-2 px-3 py-1 bg-success/5 border border-success/20 rounded-full text-[9px] font-black text-success uppercase tracking-widest animate-pulse-slow">
                 <div className="w-1.5 h-1.5 bg-success rounded-full" />
                 {t('portal.all_systems_normal') || 'جميع الأنظمة تعمل'}
              </div>
           </div>
           <div className="h-10 w-px bg-white/5" />
           <button
             onClick={handleLogout}
             className="w-12 h-12 flex items-center justify-center text-danger/80 hover:text-danger hover:bg-danger/10 border border-white/10 hover:border-danger/30 rounded-sm transition-all group"
             title={t('portal.logout') || 'تسجيل الخروج'}
           >
              <LogOut className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
           </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service, index) => {
          const IconComponent = resolveServiceIcon(service.icon);
          const colors = getColorClasses(service.color);

          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
            >
              <AmberCard
                onClick={() => handleServiceClick(service)}
                className="cursor-pointer group relative overflow-hidden flex flex-col items-start gap-5 hover:border-brand/40 hover:shadow-2xl transition-all duration-500 h-full p-8"
                glass
              >
                {service.type === 'external' && (
                  <div className="absolute top-4 right-4 p-1.5 opacity-30 group-hover:opacity-100 transition-opacity">
                     <ExternalLink className="w-4 h-4 text-zinc-muted group-hover:text-brand" />
                  </div>
                )}

                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center border border-white/5 bg-obsidian-outer group-hover:scale-110 transition-transform duration-500", colors.bg)}>
                  <IconComponent className={cn("w-8 h-8", colors.text)} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-white tracking-tighter italic uppercase group-hover:text-brand transition-colors">
                     {t(`service.${service.id}.name`) || service.name}
                  </h3>
                  <p className="text-[11px] text-zinc-muted leading-relaxed font-medium tracking-tight">
                     {t(service.description) || service.description}
                  </p>
                </div>

                <div className="w-full mt-auto flex items-center justify-between pt-5 border-t border-white/5 group-hover:border-brand/20 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      <span className="text-[10px] font-black text-success uppercase tracking-widest">
                        {service.type === 'external' ? (t('portal.service_external') || 'خارجي') : (t('portal.service_internal') || 'داخلي')}
                      </span>
                   </div>
                   <ArrowUpRight className={cn("w-5 h-5 text-zinc-muted group-hover:text-brand transition-all duration-500", dir === 'rtl' ? "rotate-[-90deg] group-hover:rotate-0" : "group-hover:translate-x-1 group-hover:-translate-y-1")} />
                </div>
              </AmberCard>
            </motion.div>
          );
        })}
      </div>

      {/* Admin / Low Priority Hub Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-wrap gap-4 pt-10 border-t border-white/5"
      >
         <button className="flex items-center gap-3 px-6 py-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 rounded-sm transition-all group">
            <span className="text-[10px] font-black text-zinc-muted group-hover:text-zinc-text uppercase tracking-widest">{t('portal.platform_settings') || 'إعدادات المنصة'}</span>
         </button>
         <button className="flex items-center gap-3 px-6 py-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 rounded-sm transition-all group">
            <span className="text-[10px] font-black text-zinc-muted group-hover:text-zinc-text uppercase tracking-widest">{t('portal.service_management') || 'إدارة الخدمات'}</span>
         </button>
         <div className="flex-1" />
         <div className="flex items-center gap-2 group cursor-help">
            <Hexagon className="w-8 h-8 text-brand transition-transform group-hover:rotate-180 duration-1000" />
            <div className="text-right">
               <span className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] block leading-none">{t('portal.version') || 'الإصدار'}</span>
               <span className="text-[9px] font-bold text-zinc-muted/40 uppercase tracking-widest block mt-1 leading-none">1.0.4-LTS</span>
            </div>
         </div>
      </motion.div>
    </div>
  );
};
