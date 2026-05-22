export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: {
          50:  '#faf7f4',
          100: '#f5ede6',
          200: '#ede0d4',
          300: '#deccbb',
        },
        terra: {
          300: '#d4937a',
          400: '#c47a60',
          500: '#b5674d',
          600: '#9e5640',
          700: '#7d3f2d',
        },
        warm: {
          100: '#f0ebe5',
          200: '#e4dbd3',
          300: '#c8bdb3',
          400: '#a89488',
          500: '#7a6558',
          600: '#5c4a3e',
          700: '#3d2f26',
          800: '#2d2018',
          900: '#1e1410',
        },
      },
    },
  },
  plugins: [],
}
