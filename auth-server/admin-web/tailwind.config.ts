import type { Config } from "tailwindcss";

const config = {
  theme: {
    extend: {
      colors: {
        "carbon-black": "#0f172a",
        "ghost-white": "#f8fafc",
        "ocean-blue": "#0284c7",
        cerulean: "#0369a1",
        "turquoise-surf": "#e0f2fe",
      },
    },
  },
} satisfies Config;

export default config;
