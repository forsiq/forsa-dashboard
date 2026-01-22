
import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Check, Clock, User } from 'lucide-react';
import { useLanguage } from '../amber-ui/contexts/LanguageContext';

export const Messages: React.FC = () => {
  const { t } = useLanguage();
  
  const messages = [
    { id: 1, sender: 'System', content: 'Your export is ready to download.', time: 'Just now', unread: true },
    { id: 2, sender: 'Sarah Chen', content: 'Can you review the latest PR?', time: '20 min ago', unread: true },
    { id: 3, sender: 'James Wilson', content: 'Meeting rescheduled to 3 PM.', time: '2 hours ago', unread: false },
    { id: 4, sender: 'Security', content: 'New login detected from unknown device.', time: 'Yesterday', unread: false },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('msg.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('msg.subtitle')}</p>
        </div>
        <Button variant="secondary" size="sm">
          <Check className="w-4 h-4 me-2" />
          {t('msg.mark_read')}
        </Button>
      </div>

      <div className="space-y-4">
        {messages.map((msg) => (
          <Card key={msg.id} className={`cursor-pointer transition-all hover:shadow-md ${msg.unread ? 'border-primary/50' : ''}`}>
            <div className="flex gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                msg.sender === 'System' || msg.sender === 'Security' 
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                <User className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className={`font-semibold text-gray-900 dark:text-white ${msg.unread ? 'text-primary' : ''}`}>
                    {msg.sender}
                  </h3>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 me-1" />
                    {msg.time}
                  </div>
                </div>
                <p className={`text-sm mt-1 truncate ${msg.unread ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                  {msg.content}
                </p>
              </div>
              {msg.unread && (
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
