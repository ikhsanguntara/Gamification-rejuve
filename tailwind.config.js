/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './components/**/*.{js,vue}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.js',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif']
      },
      colors: {
        rejuve: {
          // Signature Re.juve Beetroot & Berry Watercolor Palette
          beet: {
            50: '#fdf2f8',
            100: '#fce7f3',
            200: '#fbcfe8',
            300: '#f9a8d4',
            400: '#f472b6',
            500: '#be185d',
            600: '#9d174d',
            700: '#831843',
            800: '#6b133a',
            900: '#4a0e28',
            950: '#38071e'
          },
          berry: {
            50: '#fdf7fd',
            100: '#faeefa',
            200: '#f4daf3',
            300: '#eabce7',
            400: '#db92d7',
            500: '#963189',
            600: '#812474',
            700: '#6a1d5f',
            800: '#571b4e',
            900: '#491b41'
          },
          blue: {
            50: '#f0f8fc',
            100: '#e0f1f9',
            200: '#bce4f4',
            300: '#84cded',
            400: '#499ec7',
            500: '#2d89b5',
            600: '#24779f',
            700: '#1d5e7f',
            800: '#1c4e68',
            900: '#1a4257'
          },
          green: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d'
          },
          orange: {
            50: '#fff7ed',
            100: '#ffedd5',
            200: '#fed7aa',
            300: '#fdba74',
            400: '#fb923c',
            500: '#f97316',
            600: '#ea580c',
            700: '#c2410c',
            800: '#9a3412',
            900: '#7c2d12'
          }
        },
        brand: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#be185d',
          600: '#9d174d',
          700: '#831843',
          800: '#6b133a',
          900: '#4a0e28',
          950: '#38071e'
        },
        star: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          glow: '#fbbf24'
        }
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-short': 'bounceShort 0.5s ease-in-out 1',
        'star-pop': 'starPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite'
      },
      keyframes: {
        bounceShort: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' }
        },
        starPop: {
          '0%': { transform: 'scale(0.8)', opacity: '0.6' },
          '50%': { transform: 'scale(1.25)' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(251, 191, 36, 0.4)' },
          '50%': { boxShadow: '0 0 25px rgba(251, 191, 36, 0.8)' }
        }
      }
    }
  },
  plugins: []
}
