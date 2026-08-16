/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        heading: ['Outfit', 'Inter', 'sans-serif'],
      },
      colors: {
        cube: {
          white: '#F8FAFC',
          yellow: '#FACC15',
          red: '#EF4444',
          orange: '#F97316',
          blue: '#2563EB',
          green: '#10B981',
          plastic: '#181A20',
        }
      }
    },
  },
  plugins: [],
}
