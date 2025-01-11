/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/*.html"],
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
