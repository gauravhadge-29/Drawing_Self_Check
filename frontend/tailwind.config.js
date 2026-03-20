/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#f1f5f9',
          foreground: '#0f172a',
        },
        success: '#22c55e',
        error: '#ef4444',
        warning: '#f59e0b',
        background: '#f8fafc',
        muted: '#64748b',
        border: 'hsl(var(--border))',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
}
