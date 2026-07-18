/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#16a34a',
        'primary-focus': '#15803d',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [{
      seoaudit: {
        'primary': '#16a34a',
        'primary-focus': '#15803d',
        'primary-content': '#ffffff',
        'secondary': '#059669',
        'accent': '#10b981',
        'neutral': '#191D24',
        'base-100': '#ffffff',
        'base-200': '#f3f4f6',
        'base-300': '#d1d5db',
        'base-content': '#1f2937',
        'info': '#3ABFF8',
        'success': '#16a34a',
        'warning': '#FBBD23',
        'error': '#dc2626',
      },
    }],
  },
};
