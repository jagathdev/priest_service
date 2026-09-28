/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          violet: '#1f1f1f',
          orange: '#F47820',
          'orange-dark': '#d95f13',
          ink: '#241a46',
          surface: '#fff8f0',
        },
        'primary-violet': {
          50: '#f3f0ff',
          100: '#e8e2ff',
          200: '#d8ceff',
          300: '#b9abff',
          400: '#9189ff',
          500: '#1f1f1f',
          600: '#000000',
          700: '#4647c4',
          800: '#373895',
          900: '#2b2d70',
        },
        blue: {
          50: '#f3f0ff',
          100: '#e8e2ff',
          200: '#d8ceff',
          300: '#b9abff',
          400: '#9189ff',
          500: '#1f1f1f',
          600: '#000000',
          700: '#4647c4',
          800: '#373895',
          900: '#2b2d70',
        },
        violet: {
          50: '#f3f0ff',
          100: '#e8e2ff',
          200: '#d8ceff',
          300: '#b9abff',
          400: '#9189ff',
          500: '#1f1f1f',
          600: '#000000',
          700: '#4647c4',
          800: '#373895',
          900: '#2b2d70',
        },
        purple: {
          50: '#fff3eb',
          100: '#ffe3cf',
          200: '#ffc79f',
          300: '#ffa66a',
          400: '#ff883d',
          500: '#F47820',
          600: '#d95f13',
          700: '#b6480f',
          800: '#933913',
          900: '#783114',
        }
      }
    },
  },
  plugins: [],
};