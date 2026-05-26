/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    extend: {

      colors: {

        primary: {
          DEFAULT: '#00ADB5',
          dark: '#008C93',
          light: '#4FD6DC',
        },

        accent: {
          DEFAULT: '#393E46',
          dark: '#222831',
          light: '#6B7280',
        },

        foreground: '#222831',
        background: '#EEEEEE',
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
    },
  },

  plugins: [],
}