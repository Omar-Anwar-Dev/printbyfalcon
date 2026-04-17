import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './providers/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // — Printing Atelier palette —
        ink: {
          DEFAULT: '#12172b',
          deep: '#0a0e1f',
          mid: '#1a1a2e',
          soft: '#3a3f55',
          ghost: '#8b90a5',
        },
        paper: {
          DEFAULT: '#f8f4ed',
          white: '#fdfcf8',
          dark: '#ece6d9',
          shadow: '#ddd5c3',
        },
        gold: {
          DEFAULT: '#c9a063',
          bright: '#e8b86d',
          deep: '#8f6c37',
          hover: '#b88950',
        },
        seal: {
          DEFAULT: '#a8382a',
          hover: '#8a2e22',
        },
        accent: {
          DEFAULT: '#2e4fa8',
          hover: '#26438a',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        arabic: ['var(--font-arabic)', 'Cairo', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.03em',
        wideplus: '0.14em',
      },
      boxShadow: {
        letter: '0 1px 0 rgba(18, 23, 43, 0.04), 0 2px 8px rgba(18, 23, 43, 0.06)',
        press: 'inset 0 -2px 0 rgba(143, 108, 55, 0.3)',
        card: '0 1px 2px rgba(18, 23, 43, 0.04), 0 8px 32px -8px rgba(18, 23, 43, 0.08)',
        gold: '0 4px 14px -4px rgba(201, 160, 99, 0.4)',
      },
      backgroundImage: {
        'paper-grain': "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.07 0 0 0 0 0.09 0 0 0 0 0.16 0 0 0 0.04 0'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>\")",
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
        'fade-up-1': 'fade-up 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) 0.08s forwards',
        'fade-up-2': 'fade-up 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) 0.16s forwards',
        'fade-up-3': 'fade-up 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) 0.24s forwards',
      },
    },
  },
  plugins: [],
};

export default config;
