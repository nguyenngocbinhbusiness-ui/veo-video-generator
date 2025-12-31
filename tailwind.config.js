/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
<<<<<<< HEAD
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // HUD / Sci-Fi FUI Color Palette
                primary: {
                    50: '#ecfeff',
                    100: '#cffafe',
                    200: '#a5f3fc',
                    300: '#67e8f9',
                    400: '#22d3ee',
                    500: '#00FFFF', // Neon Cyan
                    600: '#00d4d4',
                    700: '#00a8a8',
                    800: '#007a7a',
                    900: '#004d4d',
                },
                accent: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#00FF00', // Neon Green
                    600: '#00cc00',
                    700: '#00a300',
                    800: '#007a00',
                    900: '#005200',
                },
                warn: {
                    500: '#FFB800', // Amber/Warning for contrast
                },
                hud: {
                    dark: '#0a0f14',      // Deep dark background
                    darker: '#050a0d',     // Darker variant
                    border: '#00ffff33',   // Transparent cyan border
                    glow: '#00ffff',       // Cyan glow color
                },
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'scan': 'scan 3s linear infinite',
                'flicker': 'flicker 0.15s infinite',
            },
            keyframes: {
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                glow: {
                    '0%': { boxShadow: '0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px #00ffff' },
                    '100%': { boxShadow: '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff' },
                },
                scan: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100%)' },
                },
                flicker: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.8' },
                },
            },
            fontFamily: {
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
                display: ['Orbitron', 'sans-serif'],
            },
        },
    },
    plugins: [],
}

=======
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                },
                accent: {
                    500: '#8b5cf6', // Violet
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
        },
    },
    plugins: [require('daisyui')],
    daisyui: {
        themes: ["dark"],
    },
}
>>>>>>> 7e166733f58fefd5483c3fe5562b91014d982f04
