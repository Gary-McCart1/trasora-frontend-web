/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/app/**/*.{js,ts,jsx,tsx}",
      "./src/components/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
      extend: {
        screens: {
          '4xl': '1920px', // Giant monitor breakpoint
        },
      },
    },
    plugins: [],
  }
  