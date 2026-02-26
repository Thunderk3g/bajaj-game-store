/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    prefix: 'lsl-',
    theme: {
        extend: {
            colors: {
                bajaj: {
                    blue: "#0066B2",
                    orange: "#FF6600",
                    charcoal: "#2D3748",
                }
            },
            animation: {
                'bounce-slow': 'bounce 3s linear infinite',
            }
        },
    },
    plugins: [],
}
