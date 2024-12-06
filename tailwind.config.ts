import { type Config } from "tailwindcss";
import daisyui from "daisyui";

const cyberpunkTheme = {
  "primary": "#ff2a6d",
  "secondary": "#05d9e8",
  "accent": "#7700ff",
  "neutral": "#1a1a1a",
  "base-100": "#0d0d0d",
  "base-200": "#141414",
  "base-300": "#1f1f1f",
  "info": "#01c8ee",
  "success": "#00ff9f",
  "warning": "#ff7f11",
  "error": "#ff1b6b",
  "--rounded-box": "0",
  "--rounded-btn": "0",
  "--rounded-badge": "0",
  "--animation-btn": "0.25s",
  "--animation-input": "0.2s",
  "--btn-focus-scale": "0.95",
  "--border-btn": "2px",
  "--tab-border": "2px",
  "--tab-radius": "0",
};

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [{
      cyberpunk: cyberpunkTheme,
    }],
    darkTheme: "cyberpunk",
    base: true,
    styled: true,
    utils: true,
    logs: false,
  },
} as Config;
