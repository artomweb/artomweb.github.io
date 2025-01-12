/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/*.html", "./src/*.js"],
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
  // plugins: [require("flowbite/plugin")],
};
