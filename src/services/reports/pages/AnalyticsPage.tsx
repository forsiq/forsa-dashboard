import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, Users, ShoppingCart, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useLanguage } from '../../../core/contexts/LanguageContext';
import { cn } from '../../../core/lib/utils/cn';
import { AmberCard } from '../../../core/components/AmberCard';
import { useGetAnalytics } from '../hooks';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export function AnalyticsPage() {
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const { data: analytics, isLoading } = useGetAnalytics();

  const summaryStats = [
    { label: t('report.total_revenue') || 'Total Revenue', value: '$124,592', change: '+12.5%', icon: DollarSign, color: 'text-success' },
    { label: t('report.active_users') || 'Active Users', value: '8,432', change: '+5.2%', icon: Users, color: 'text-info' },
    { label: t('report.avg_order') || 'Avg. Order', value: '$142.10', change: '-2.1%', icon: ShoppingCart, color: 'text-warning' },
    { label: t('report.conversion_rate') || 'Conversion', value: '3.2%', change: '+0.4%', icon: TrendingUp, color: 'text-brand' },
  ];

  const pieData = [
    { name: 'Hardware', value: 400 },
    { name: 'Sensing', value: 300 },
    { name: 'Energy', value: 300 },
    { name: 'Security', value: 200 },
  ];

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700" dir={dir}>
      {/* Header */}
      <div className={cn("space-y-1", isRTL ? "text-right" : "text-left")}>
        <h1 className="text-4xl font-black text-zinc-text tracking-tight leading-none">
          {t('report.analytics') || 'التحليلات'}
        </h1>
        <p className="text-base text-zinc-secondary font-bold">
          {t('report.analytics_subtitle') || 'تتبع أداء الأعمال والمؤشرات الرئيسية'}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-obsidian-card rounded-xl animate-pulse" />)}
          </div>
          <div className="h-96 bg-obsidian-card rounded-xl animate-pulse" />
        </div>
      ) : (
        <>
          {/* Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {summaryStats.map((stat, i) => (
              <AmberCard key={i} className="!p-6 group hover:border-[var(--color-brand)]/20 transition-all">
                 <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em] mb-1">
                      {stat.label}
                    </span>
                    <span className="text-2xl font-black text-zinc-text tracking-tight">
                      {stat.value}
                    </span>
                    <div className="mt-2 flex items-center gap-1">
                      {stat.change.startsWith('+') ? <ArrowUpRight className="w-3 h-3 text-success" /> : <ArrowDownRight className="w-3 h-3 text-danger" />}
                      <span className={cn("text-[10px] font-bold", stat.change.startsWith('+') ? "text-success" : "text-danger")}>
                        {stat.change} vs LY
                      </span>
                    </div>
                  </div>
                  <div className={cn('p-3 rounded-xl bg-white/5 border border-white/5 shadow-inner', stat.color)}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
              </AmberCard>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Performance */}
            <AmberCard className="lg:col-span-2 overflow-hidden" title={t('report.sales_performance') || 'Sales Performance'}>
              <div className="h-[350px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.sales || []}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#3f3f46" 
                      tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#3f3f46" 
                      tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 700 }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" name="Revenue" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </AmberCard>

            {/* Distribution */}
            <AmberCard title={t('report.inventory_dist') || 'Inventory Distribution'}>
              <div className="h-[350px] w-full flex flex-col items-center">
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.05)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-4 w-full px-4">
                  {pieData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-[10px] font-black text-zinc-muted uppercase tracking-tight">{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AmberCard>
          </div>

          {/* Orders History BarChart */}
          <AmberCard title={t('report.orders_overview') || 'Orders Load Pattern'}>
            <div className="h-[250px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.orders || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#3f3f46" 
                    tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#3f3f46" 
                    tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AmberCard>
        </>
      )}
    </div>
  );
}

export default AnalyticsPage;
