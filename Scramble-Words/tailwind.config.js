/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    dark: '#0f172a',
                    blue: '#1e3a8a',
                    gold: '#f59e0b',
                    light: '#f8fafc',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                float: 'float 3s ease-in-out infinite',
                'pulse-slow': 'pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                shine: 'shine 3s infinite linear',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'pulse-slow': {
                    '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                    '50%': { opacity: .8, transform: 'scale(1.05)' },
                },
                shine: {
                    from: { 'background-position': '0 0' },
                    to: { 'background-position': '-200% 0' },
                },
            },
        },
    },
    plugins: [],
}
