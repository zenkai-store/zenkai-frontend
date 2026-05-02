import plugin from "@tailwindcss/vite";
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  //darkMode: "class",
  theme: {
    extend: {
      container: {
        center: true,
        padding: "1rem",
      },
      fontFamily: {
        lufga: ["Lufga", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
