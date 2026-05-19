'use client';

import { useState } from 'react';
import { Mail, Phone, MessageSquare, Send } from 'lucide-react';
import { useLanguage } from '@yousef2001/core-ui/contexts';
import { cn } from '@core/lib/utils/cn';
import { AmberCard } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';

export default function SupportPage() {
  const { t, dir } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ email: '', subject: '', message: '' });
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: Mail,
      label: t('support.email') || 'Email',
      value: 'support@forsa.zonevast.com',
      description: t('support.email_desc') || 'We respond within 24 hours',
    },
    {
      icon: Phone,
      label: t('support.phone') || 'Phone',
      value: '+964 770 000 0000',
      description: t('support.phone_desc') || 'Sun-Thu, 9AM - 5PM',
    },
    {
      icon: MessageSquare,
      label: t('support.whatsapp') || 'WhatsApp',
      value: '+964 770 000 0000',
      description: t('support.whatsapp_desc') || 'Quick responses available',
    },
  ];

  return (
    <div className="space-y-8 p-6 max-w-[900px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700" dir={dir}>
      <div className="space-y-1">
        <h1 className="text-4xl font-black text-zinc-text tracking-tight leading-none">
          {t('support.title') || 'Support'}
        </h1>
        <p className="text-base text-zinc-secondary font-bold">
          {t('support.subtitle') || 'Get help from our support team'}
        </p>
      </div>

      {/* Contact Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contactInfo.map((info) => {
          const Icon = info.icon;
          return (
            <AmberCard
              key={info.label}
              className="p-6 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-brand/10">
                  <Icon className="w-4 h-4 text-brand" />
                </div>
                <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">
                  {info.label}
                </h3>
              </div>
              <p className="text-sm text-zinc-text font-bold">{info.value}</p>
              <p className="text-[11px] text-zinc-muted font-medium mt-1">{info.description}</p>
            </AmberCard>
          );
        })}
      </div>

      {/* Contact Form */}
      <AmberCard className="p-8 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm">
        <h2 className="text-sm font-black text-zinc-text uppercase tracking-[0.2em] mb-8 pb-4 border-b border-[var(--color-border)]">
          {t('support.form_title') || 'Send us a message'}
        </h2>

        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="p-3 rounded-full bg-success/10 mx-auto w-fit mb-4">
              <Send className="w-6 h-6 text-success" />
            </div>
            <p className="text-sm font-black text-zinc-text uppercase tracking-widest">
              {t('support.sent') || 'Message sent successfully!'}
            </p>
            <p className="text-[13px] text-zinc-muted font-medium mt-2">
              {t('support.sent_desc') || 'We\'ll get back to you as soon as possible.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest block mb-2 text-start">
                  {t('support.email_label') || 'Your Email'}
                </label>
                <AmberInput
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder={t('support.email_placeholder') || 'your@email.com'}
                  className="h-11 bg-[var(--color-obsidian-outer)] border-[var(--color-border)]"
                />
              </div>
              <div>
                <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest block mb-2 text-start">
                  {t('support.subject_label') || 'Subject'}
                </label>
                <AmberInput
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder={t('support.subject_placeholder') || 'How can we help?'}
                  className="h-11 bg-[var(--color-obsidian-outer)] border-[var(--color-border)]"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-black text-zinc-muted uppercase tracking-widest block mb-2 text-start">
                {t('support.message_label') || 'Message'}
              </label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder={t('support.message_placeholder') || 'Describe your issue or question...'}
                className={cn(
                  'w-full bg-[var(--color-obsidian-outer)] border border-[var(--color-border)] rounded-xl p-4 text-sm text-zinc-text font-medium',
                  'placeholder:text-zinc-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/20 resize-none',
                )}
              />
            </div>
            <AmberButton
              type="submit"
              disabled={isSubmitting}
              className="gap-2 px-8 h-11 bg-[var(--color-brand)] hover:bg-[var(--color-brand)] text-black font-bold rounded-xl shadow-sm transition-all border-none active:scale-95"
            >
              <Send className="w-4 h-4" />
              {isSubmitting
                ? (t('support.sending') || 'Sending...')
                : (t('support.send') || 'Send Message')}
            </AmberButton>
          </form>
        )}
      </AmberCard>
    </div>
  );
}
