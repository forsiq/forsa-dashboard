/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@yousef2001/core-ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          outer: 'var(--color-obsidian-outer)',
          panel: 'var(--color-obsidian-panel)',
          card: 'var(--color-obsidian-card)',
          hover: 'var(--color-obsidian-hover)',
        },
        zinc: {
          text: 'var(--color-zinc-text)',
          secondary: 'var(--color-zinc-secondary)',
          muted: 'var(--color-zinc-muted)',
        },
        // Primary brand colors
        brand: '#FFC000',
        info: '#3B82F6',
        warning: '#F59E0B',
        success: '#10B981',
        danger: '#EF4444',
        // Service-specific colors
        blue: {
          500: '#3B82F6',
          50: '#EFF6FF',
          100: '#DBEAFE',
          400: '#60A5FA',
          600: '#2563EB',
        },
        cyan: {
          500: '#06B6D4',
          50: '#ECFEFF',
          100: '#CFFAFE',
          400: '#22D3EE',
          600: '#0891B2',
        },
        indigo: {
          500: '#6366F1',
          50: '#EEF2FF',
          100: '#E0E7FF',
          400: '#818CF8',
          600: '#4F46E5',
        },
        violet: {
          500: '#8B5CF6',
          50: '#F5F3FF',
          100: '#EDE9FE',
          400: '#A78BFA',
          600: '#7C3AED',
        },
        purple: {
          500: '#A855F7',
          50: '#FAF5FF',
          100: '#F3E8FF',
          400: '#C084FC',
          600: '#9333EA',
        },
        green: {
          500: '#10B981',
          50: '#ECFDF5',
          100: '#D1FAE5',
          400: '#34D399',
          600: '#059669',
        },
        amber: {
          500: '#F59E0B',
          50: '#FFFBEB',
          100: '#FEF3C7',
          400: '#FBBF24',
          600: '#D97706',
        },
        orange: {
          500: '#F97316',
          50: '#FFF7ED',
          100: '#FFEDD5',
          400: '#FB923C',
          600: '#EA580C',
        },
        pink: {
          500: '#EC4899',
          50: '#FDF2F8',
          100: '#FCE7F3',
          400: '#F472B6',
          600: '#DB2777',
        },
        teal: {
          500: '#14B8A6',
          50: '#F0FDFA',
          100: '#CCFBF1',
          400: '#2DD4BF',
          600: '#0D9488',
        },
        rose: {
          500: '#F43F5E',
          50: '#FFF1F2',
          100: '#FFE4E6',
          400: '#FB7185',
          600: '#E11D48',
        },
        sky: {
          500: '#0EA5E9',
          50: '#F0F9FF',
          100: '#E0F2FE',
          400: '#38BDF8',
          600: '#0284C7',
        },
        slate: {
          500: '#64748B',
          50: '#F8FAFC',
          100: '#F1F5F9',
          400: '#94A3B8',
          600: '#475569',
        },
        border: 'var(--color-border)',
      },
      fontFamily: {
        sans: ['Tajawal', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fade-up 300ms ease-out forwards',
        'fade-in-down': 'fade-in-down 500ms ease-out forwards',
        'slow-zoom': 'slow-zoom 20s ease-in-out infinite alternate',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
      },
      keyframes: {
        'fade-up': {
          'from': {
            opacity: '0',
            transform: 'translateY(4px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-in-down': {
          'from': {
            opacity: '0',
            transform: 'translateY(-8px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'slow-zoom': {
          'from': {
            transform: 'scale(1.05)',
          },
          'to': {
            transform: 'scale(1.15)',
          },
        },
        'pulse-slow': {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.6',
          },
        },
      },
    },
  },
  plugins: [],
}
