import { type Config } from "tailwindcss";
import daisyui from "daisyui";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx,js,jsx}",
  ],
  plugins: [
    (daisyui as any),
  ],
  daisyui: {
    themes: true,
  },
} satisfies Config;
