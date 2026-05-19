'use client';

import { HelpCircle, ChevronDown, ChevronUp, Mail, Phone, MessageSquare } from 'lucide-react';
import { useLanguage } from '@yousef2001/core-ui/contexts';
import { cn } from '@core/lib/utils/cn';
import { AmberCard } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

export default function HelpPage() {
  const { t, dir } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: t('help.faq.bid_question') || 'How do I place a bid?',
      answer: t('help.faq.bid_answer') || 'Navigate to any active auction, enter your bid amount, and click "Place Bid". Your bid must be higher than the current bid. You\'ll receive a confirmation once your bid is accepted.',
    },
    {
      question: t('help.faq.watchlist_question') || 'How does the watchlist work?',
      answer: t('help.faq.watchlist_answer') || 'Click the heart icon on any auction to add it to your watchlist. You\'ll receive notifications when watched auctions are ending soon or when new bids are placed.',
    },
    {
      question: t('help.faq.payment_question') || 'What payment methods are accepted?',
      answer: t('help.faq.payment_answer') || 'We currently accept Cash on Delivery (COD) and Bank Transfer. Credit card support is coming soon. All prices are displayed in Iraqi Dinar (IQD).',
    },
    {
      question: t('help.faq.auction_types_question') || 'What types of auctions are available?',
      answer: t('help.faq.auction_types_answer') || 'We offer standard auctions where the highest bid wins, and group buying deals where you can get discounts based on participant count. Check the auction details for specific rules.',
    },
    {
      question: t('help.faq.account_question') || 'How do I update my account information?',
      answer: t('help.faq.account_answer') || 'Go to your Profile page to update your name, email, and avatar. Use Settings to manage notifications, appearance, and navigation preferences.',
    },
  ];

  const contactMethods = [
    {
      icon: Mail,
      label: t('help.email') || 'Email',
      value: 'support@forsa.zonevast.com',
      color: 'bg-info/10 text-info border-info/20',
    },
    {
      icon: Phone,
      label: t('help.phone') || 'Phone',
      value: '+964 770 000 0000',
      color: 'bg-success/10 text-success border-success/20',
    },
    {
      icon: MessageSquare,
      label: t('help.whatsapp') || 'WhatsApp',
      value: '+964 770 000 0000',
      color: 'bg-brand/10 text-brand border-brand/20',
    },
  ];

  return (
    <div className="space-y-8 p-6 max-w-[900px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700" dir={dir}>
      <div className="space-y-1">
        <h1 className="text-4xl font-black text-zinc-text tracking-tight leading-none">
          {t('help.title') || 'Help Center'}
        </h1>
        <p className="text-base text-zinc-secondary font-bold">
          {t('help.subtitle') || 'Find answers to common questions'}
        </p>
      </div>

      {/* FAQ Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-black text-zinc-muted uppercase tracking-[0.2em]">
          {t('help.faq_title') || 'Frequently Asked Questions'}
        </h2>
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <AmberCard
              key={index}
              className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between p-5 text-start"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-brand/10">
                    <HelpCircle className="w-4 h-4 text-brand" />
                  </div>
                  <span className="text-sm font-black text-zinc-text tracking-tight">
                    {faq.question}
                  </span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-zinc-muted shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-muted shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-0">
                  <div className="h-px bg-white/5 mb-4" />
                  <p className="text-[13px] text-zinc-muted font-medium leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </AmberCard>
          );
        })}
      </div>

      {/* Contact Support Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-black text-zinc-muted uppercase tracking-[0.2em]">
          {t('help.contact_title') || 'Contact Support'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contactMethods.map((method) => {
            const Icon = method.icon;
            return (
              <AmberCard
                key={method.label}
                className="p-6 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm text-center"
              >
                <div className={cn('p-3 rounded-xl border mx-auto w-fit mb-4', method.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest mb-2">
                  {method.label}
                </h3>
                <p className="text-[13px] text-zinc-muted font-medium">
                  {method.value}
                </p>
              </AmberCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
