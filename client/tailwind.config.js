/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [{
      seogreen: {
        "primary": "#16a34a",
        "primary-content": "#ffffff",
        "secondary": "#15803d",
        "accent": "#16a34a",
        "neutral": "#1f2937",
        "neutral-content": "#d1d5db",
        "base-100": "#ffffff",
        "base-200": "#f9fafb",
        "base-300": "#e5e7eb",
        "base-content": "#111827",
        "info": "#3b82f6",
        "success": "#16a34a",
        "warning": "#f59e0b",
        "error": "#ef4444",
      },
    }],
  },
};
