import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        'brand-black': '#050505',
        'brand-dark': '#0A0A0A',
        'brand-gray': '#111111',
        'brand-green': '#4ADE80',
        'brand-silver': '#A1A1AA',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        'general-sans': ['GeneralSans-Variable', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        h1: '40px',
        h2: '36px',
        h3: '32px',
        h4: '28px',
        h5: '24px',
        subtitle: '20px',
        'paragraph-lg': '18px',
        paragraph: '16px',
        'paragraph-sm': '14px',
        label: '12px',
      },
      fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        'extra-bold': '800',
        black: '900',
      },
    },
  },
  plugins: [],
} as Config;
