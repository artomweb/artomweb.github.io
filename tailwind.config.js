/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./src/*.js"],
  theme: {
    extend: {
      fontFamily: {
        klasik: ["Klasik", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
};
