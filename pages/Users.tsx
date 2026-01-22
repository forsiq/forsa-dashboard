
import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Plus, MoreVertical, Mail, Shield } from 'lucide-react';
import { useLanguage } from '../amber-ui/contexts/LanguageContext';

export const Users: React.FC = () => {
  const { t } = useLanguage();

  const users = [
    { id: 1, name: 'Alex Morgan', role: 'Admin', status: 'Active', lastActive: '2 min ago', email: 'alex@zonevast.com' },
    { id: 2, name: 'Sarah Chen', role: 'Editor', status: 'Active', lastActive: '1 hr ago', email: 'sarah@zonevast.com' },
    { id: 3, name: 'James Wilson', role: 'Viewer', status: 'Inactive', lastActive: '2 days ago', email: 'james@zonevast.com' },
    { id: 4, name: 'Maria Garcia', role: 'Editor', status: 'Active', lastActive: '5 min ago', email: 'maria@zonevast.com' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">{t('users.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('users.subtitle')}</p>
        </div>
        <Button>
          <Plus className="w-5 h-5 me-2" />
          {t('users.add')}
        </Button>
      </div>

      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-start">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-start">{t('users.table.name')}</th>
                <th className="px-6 py-3 text-start">{t('users.table.role')}</th>
                <th className="px-6 py-3 text-start">{t('users.table.status')}</th>
                <th className="px-6 py-3 text-start">{t('users.table.last_active')}</th>
                <th className="px-6 py-3 text-end"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-lg font-bold text-gray-500 dark:text-gray-300">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <Shield className="w-4 h-4" />
                      {user.role}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'Active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {user.status === 'Active' ? t('label.active') : t('label.inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {user.lastActive}
                  </td>
                  <td className="px-6 py-4 text-end">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
