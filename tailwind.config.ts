import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#080b12",
        panel: "#111827",
        bronze: "#b88945",
        gold: "#d7b56d"
      }
    }
  },
  plugins: []
};

export default config;
