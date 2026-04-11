/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        screens: {
            'sh': { 'raw': '(max-height: 700px)' },
        },
        extend: {
            colors: {
                bg: '#0A1628',
                gold: '#F5C842',
                teal: '#2DD4BF',
                blue: '#3B82F6',
                growth: '#22C55E',
                safety: '#3B82F6',
                resp: '#F59E0B',
                risk: '#EF4444',
                asset: '#A855F7',
            },
            fontFamily: {
                heading: ['Playfair Display', 'serif'],
                body: ['DM Sans', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
