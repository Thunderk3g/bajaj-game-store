/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            screens: {
                'sh': { 'raw': '(max-height: 750px)' },
            },
            colors: {
                tetris: {
                    grid: '#1a1a2e',
                    border: '#16213e',
                    neon: '#0f3460',
                    accent: '#e94560',
                    "blue": "#00f0ff",
                    "yellow": "#fff000",
                    "purple": "#a020f0",
                    "green": "#00ff00",
                    "red": "#ff0000",
                    "orange": "#ff8c00",
                    "darkBlue": "#0000ff"
                }
            },
            backgroundImage: {
                'neon-gradient': 'linear-gradient(to bottom right, #0f3460, #16213e, #1a1a2e)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'bounce-slow': 'bounce 2s infinite',
            }
        },
    },
    plugins: [],
}
