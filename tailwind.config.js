/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5', // Indigo for buttons and accents
        secondary: '#6B7280', // Gray for text
        accent: '#F472B6', // Pink for highlights
      },
    },
  },
  plugins: [],
}