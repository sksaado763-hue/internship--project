/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'brand-primary': 'rgb(var(--tw-brand-primary) / <alpha-value>)',
        'brand-hover': 'rgb(var(--tw-brand-hover) / <alpha-value>)',
        'brand-accent': 'rgb(var(--tw-brand-accent) / <alpha-value>)',
        surface: 'rgb(var(--tw-surface) / <alpha-value>)',
        navy: {
          950: '#07111f',
          900: '#0b1831',
          800: '#10203e',
        },
        electric: {
          400: '#82b0ff',
          500: '#3670f5',
          600: '#2555d8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
};
