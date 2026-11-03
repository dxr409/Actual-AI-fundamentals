/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        dark: {
          DEFAULT: '#111111',
          50: '#222222',
          100: '#1a1a1a',
          200: '#161616',
          300: '#111111',
        },
        // macOS Dark Palette — obsidian darks matching Language Model Builder
        navy: {
          950: '#111113',   // deepest window background
          900: '#151518',   // sidebar & surfaces
          800: '#1b1b1f',   // cards & panels
          700: '#232328',   // elevated inputs & buttons
          600: '#2e2e34',   // hover states
          500: '#3e3e46',   // subtle dividers
        },
        // Accent: Warm cream / ivory tone #f6e9c7
        accent: {
          DEFAULT: '#f6e9c7',
          hover: '#ebd6a1',
          active: '#dfbe79',
          dark: '#1a1813',
        },
        cream: {
          50: '#fdfbf7',
          100: '#faf6ee',
          200: '#f6e9c7',
          300: '#ebd6a1',
          400: '#dfbe79',
          500: '#cfa656',
          600: '#b88a3e',
          700: '#946a30',
        },
        surface: '#131315',
        'surface-card': '#18181a',
        'surface-elevated': '#222226',
        border: 'rgba(255, 255, 255, 0.08)',
        'border-light': 'rgba(255, 255, 255, 0.12)',
        'text-primary': '#f2f2f7',
        'text-secondary': '#aeaeb2',
        'text-muted': '#636366',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"SF Pro Display"',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          '"SF Mono"',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
        serif: [
          'Georgia',
          'Cambria',
          '"Times New Roman"',
          'serif',
        ],
      },
    },
  },
  plugins: [],
}
