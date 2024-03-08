/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans Variable'],
      },
      boxShadow: {
        line: '0 1px 0 0 rgb(244, 244, 245, 1)',
      },
      animation: {
        'spin-fast': 'spin 0.6s linear infinite',
      },
    },
  },
  plugins: [],
};
