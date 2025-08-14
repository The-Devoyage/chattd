module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // adjust to your paths
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui"), require("@tailwindcss/typography")],
};
