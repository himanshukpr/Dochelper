/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBlue: '#2C3E50',
        lightGrey: '#ECF0F1',
        blue: '#3498DB',
        darkGrey: '#2C3E50',
        orange: '#E67E22',
        mainsection: '#e9f3fe',
        borderBlue:'#D2E3FC'
      }
    },
  },
  plugins: [],
}

