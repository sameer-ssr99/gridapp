/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'vice': ['"Pricedown"', 'cursive', 'sans-serif'], // We'll simulate Pricedown styling or use a google font
                'sans': ['Inter', 'sans-serif'],
            },
            colors: {
                gta: {
                    pink: '#ff0099',    // Hot Pink
                    blue: '#00e5ff',    // Cyan
                    purple: '#bd00ff',  // Deep Purple
                    yellow: '#ffee00',  // Sunset Yellow
                    bg: '#0d0221',      // Deep Night
                    card: 'rgba(255, 255, 255, 0.1)'
                }
            }
        },
    },
    plugins: [],
}
