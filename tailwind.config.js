/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#DC2626',
        secondary: '#FFFFFF',
        accent: '#F59E0B',
        background: '#111827',
        surface: '#1F2937',
        textPrimary: '#FFFFFF',
        textSecondary: '#9CA3AF',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444'
      },
      fontFamily: {
        'mono': ['monospace'],
      }
    },
  },
  plugins: [],
}

