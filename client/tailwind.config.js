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
        primary: '#14395C',
        secondary: '#7B61FF',
        accent: '#881337',
        ink: '#1E293B',
        surface: '#FAFAFF',
        success: '#16a34a',
        danger: '#dc2626',
      },
      fontFamily: {
        sans: ['var(--font-sans)', '"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', '"Playfair Display"', 'Georgia', 'serif'],
        display: ['var(--font-display)', 'Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};