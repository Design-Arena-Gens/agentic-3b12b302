import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        night: "#0b1120",
        aurora: {
          start: "#36cfc9",
          end: "#725bff"
        }
      },
      backgroundImage: {
        "aurora-gradient":
          "radial-gradient(circle at 20% 20%, rgba(54,207,201,0.25), transparent 45%), radial-gradient(circle at 80% 0%, rgba(114,91,255,0.3), transparent 55%), linear-gradient(135deg, rgba(11,17,32,0.95), rgba(15,23,42,0.95))"
      }
    }
  },
  plugins: []
};

export default config;
