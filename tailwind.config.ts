import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          50: '#FDF2F8',
          100: '#FCE7F3',
          200: '#FBCFE8',
          300: '#F9A8D4',
          400: '#F472B6',
          500: '#EC4899',
          600: '#DB2777',
          700: '#BE185D',
          800: '#9D174D',
          900: '#831843',
        },
        rose: {
          50: '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
          700: '#BE123C',
          800: '#9F1239',
          900: '#881337',
        },
        fuchsia: {
          50: '#FDF4FF',
          100: '#FAE8FF',
          200: '#F5D0FE',
          300: '#F0ABFC',
          400: '#E879F9',
          500: '#D946EF',
          600: '#C026D3',
          700: '#A21CAF',
          800: '#86198F',
          900: '#701A75',
        },
      },
      backgroundImage: {
        'pink-gradient': 'linear-gradient(to right, #EC4899, #F472B6, #F9A8D4)',
        'cherry-blossom': 'linear-gradient(to right, #FBCFE8, #F9A8D4, #F472B6)',
        'premium-pink': 'linear-gradient(135deg, #DB2777 0%, #EC4899 50%, #F472B6 100%)',
      },
      boxShadow: {
        'pink-glow': '0 4px 14px 0 rgba(236, 72, 153, 0.3)',
      },
    },
  },
  plugins: [],
};

export default config;