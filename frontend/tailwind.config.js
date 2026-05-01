/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        spotify: "#1DB954",
        tidal: "#00FFFF",
      },
    },
  },
  plugins: [],
};
