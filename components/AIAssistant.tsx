
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { X, Send, Sparkles, MessageSquare } from 'lucide-react';
import { useLanguage } from '../amber-ui/contexts/LanguageContext';

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: t('ai.welcome') }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: t('ai.instruction'),
        },
      });

      setMessages(prev => [...prev, { role: 'ai', text: response.text || "Diagnostic Failed." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: t('ai.error') }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-40 p-3.5 bg-brand text-obsidian-outer rounded-sm shadow-2xl hover:scale-105 active:scale-95 transition-all group"
      >
        <MessageSquare className="w-5 h-5" />
      </button>

      <div className={`fixed inset-y-0 right-0 rtl:right-auto rtl:left-0 z-50 w-full sm:w-[450px] bg-obsidian-panel shadow-[-10px_0_30px_rgba(0,0,0,0.5)] transform transition-transform duration-300 ease-in-out border-s border-white/5 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full rtl:-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
          <div className="flex items-center gap-2 text-brand">
            <Sparkles className="w-4 h-4" />
            <h2 className="text-sm font-bold uppercase tracking-widest">{t('ai.title')}</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-obsidian-hover rounded-sm transition-colors text-zinc-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-obsidian-outer/10">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] px-4 py-3 rounded-sm text-sm leading-relaxed border ${
                m.role === 'user' 
                  ? 'bg-obsidian-hover border-white/10 text-zinc-text' 
                  : 'bg-obsidian-panel border-white/5 text-zinc-secondary'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-obsidian-outer border border-white/5 px-4 py-3 rounded-sm flex gap-1.5 items-center">
                <div className="w-1 h-1 bg-brand rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-brand rounded-full animate-bounce delay-75"></div>
                <div className="w-1 h-1 bg-brand rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-obsidian-panel border-t border-white/5">
          <div className="relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('ai.placeholder')}
              className="w-full bg-obsidian-outer border border-white/5 rounded-sm pl-4 pr-12 py-3 text-sm focus:border-brand/30 outline-none transition-all placeholder-zinc-muted text-zinc-text rtl:pr-4 rtl:pl-12"
            />
            <button 
              onClick={handleSend}
              className="absolute right-2 top-2 rtl:right-auto rtl:left-2 p-1.5 text-brand hover:bg-brand/10 rounded-sm disabled:opacity-50 transition-colors"
              disabled={!input.trim() || loading}
            >
              <Send className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
