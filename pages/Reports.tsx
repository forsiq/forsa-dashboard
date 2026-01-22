
import React from 'react';
import { Card, CardHeader } from '../components/Card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useLanguage } from '../amber-ui/contexts/LanguageContext';
import { useTheme } from '../amber-ui/contexts/ThemeContext';

const dataPerformance = [
  { name: 'Jan', current: 4000, previous: 2400 },
  { name: 'Feb', current: 3000, previous: 1398 },
  { name: 'Mar', current: 2000, previous: 9800 },
  { name: 'Apr', current: 2780, previous: 3908 },
  { name: 'May', current: 1890, previous: 4800 },
  { name: 'Jun', current: 2390, previous: 3800 },
  { name: 'Jul', current: 3490, previous: 4300 },
];

const dataDist = [
  { name: 'Mobile', value: 400 },
  { name: 'Desktop', value: 300 },
  { name: 'Tablet', value: 300 },
  { name: 'Other', value: 200 },
];

const COLORS = ['#F5C451', '#EC4899', '#45C490', '#4EA1FF'];

export const Reports: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-zinc-text uppercase tracking-widest">{t('nav.reports')}</h1>
        <button className="px-4 py-2 bg-obsidian-card border border-border rounded-sm text-xs font-bold text-zinc-text hover:bg-obsidian-hover transition-all uppercase tracking-widest">
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 min-w-0">
          <Card className="min-h-[450px]">
            <CardHeader title="Performance Trend" />
            <div className="h-[350px] min-h-[350px] w-full relative" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataPerformance}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: isDark ? '#6E768A' : '#94a3b8'}} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: isDark ? '#6E768A' : '#94a3b8'}} 
                    dx={-10} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#141A22' : '#FFFFFF', 
                      border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.1)', 
                      borderRadius: '4px', 
                      color: isDark ? '#E6EAF0' : '#0F172A', 
                      fontSize: '11px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }} />
                  <Line type="monotone" dataKey="current" stroke="#F5C451" strokeWidth={3} dot={{ r: 4, fill: '#F5C451', strokeWidth: 2, stroke: isDark ? '#0E1218' : '#FFFFFF' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="previous" stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} strokeWidth={2} dot={false} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1 min-w-0">
           <Card className="min-h-[450px]">
            <CardHeader title="Device Distribution" />
            <div className="h-[350px] min-h-[350px] w-full flex flex-col justify-center relative" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataDist}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {dataDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#141A22' : '#FFFFFF', 
                      border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.1)', 
                      borderRadius: '4px', 
                      color: isDark ? '#E6EAF0' : '#0F172A', 
                      fontSize: '11px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
