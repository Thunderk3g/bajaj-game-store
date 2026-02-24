/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        game: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'bb-navy': '#081c3a',
        'bb-deep': '#0f2a55',
        'bb-glass': 'rgba(255, 255, 255, 0.08)',
        'bb-glass-border': 'rgba(255, 255, 255, 0.12)',
        'bb-accent': '#3B82F6',
        'bb-gold': '#F59E0B',
        'bb-green': '#10B981',
        'bb-red': '#EF4444',
        'bajaj-blue': '#0066B2',
        'bajaj-orange': '#FF8C00',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
        'glow-blue': '0 0 1.25rem rgba(30, 94, 255, 0.35)',
        'glow-red': '0 0 1.25rem rgba(239, 68, 68, 0.35)',
        'glow-green': '0 0 1.25rem rgba(16, 185, 129, 0.35)',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0.625rem rgba(59, 130, 246, 0.5)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 1.25rem rgba(59, 130, 246, 0.8)' },
        },
        'bomb-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
        'explode': {
          '0%': { transform: 'scale(0.5)', opacity: '1' },
          '50%': { transform: 'scale(1.4)', opacity: '0.8' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-0.25rem)' },
          '40%': { transform: 'translateX(0.25rem)' },
          '60%': { transform: 'translateX(-0.125rem)' },
          '80%': { transform: 'translateX(0.125rem)' },
        },
        'float-up': {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(-2.5rem) scale(0.7)', opacity: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'bomb-pulse': 'bomb-pulse 0.5s ease-in-out infinite',
        'explode': 'explode 0.5s ease-out forwards',
        'shake': 'shake 0.3s ease-in-out',
        'float-up': 'float-up 0.8s ease-out forwards',
        'fade-in': 'fade-in 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
};
