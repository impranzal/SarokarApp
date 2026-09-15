/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F6F5F1',
        ink: '#1E2A33',
        govblue: {
          DEFAULT: '#1E4258',
          light: '#2E5A73',
          dark: '#132D3B',
        },
        sarokar: {
          green: '#3E6B52',
          terracotta: '#A85436',
          gold: '#B9924A',
          mist: '#DCE3E0',
        },
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

