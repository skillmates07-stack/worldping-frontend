/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#0a0a0a',
        'brand-gray': '#1a1a1a',
        'brand-accent': '#3b82f6'
      }
    },
  },
  plugins: [],
}
