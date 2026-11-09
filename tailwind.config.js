/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bagel Fat One"', 'system-ui', 'sans-serif'], // letras infladas
        dot: ['Doto', 'ui-monospace', 'monospace'], // cartel de club (pantalla de puntos)
        sans: ['Archivo', 'system-ui', 'sans-serif'],
      },
      colors: {
        sky: { top: '#4BB1F8', mid: '#65C1FD', low: '#ACE8FD' },
        ink: '#0A1F44',
        balloon: { DEFAULT: '#FF4D6D', dark: '#D9264A', light: '#FFB3C1' },
        cloud: '#F7FBFF',
      },
    },
  },
  plugins: [],
};
