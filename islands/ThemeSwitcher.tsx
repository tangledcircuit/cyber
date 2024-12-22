import { useEffect, useState } from "preact/hooks";

const THEMES = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
];

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Get initial theme from localStorage or default to light
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  return (
    <div class="dropdown dropdown-end">
      <div tabIndex={0} role="button" class="btn btn-ghost gap-1 normal-case">
        <span class="material-icons">palette</span>
        <span class="hidden md:inline">Theme</span>
        <span class="material-icons">expand_more</span>
      </div>
      <div class="dropdown-content bg-base-200 text-base-content rounded-t-box rounded-b-box top-px max-h-96 h-[70vh] w-52 overflow-y-auto shadow-2xl mt-16 z-[9999]">
        <div class="grid grid-cols-1 gap-3 p-3">
          {THEMES.map((t) => (
            <button
              key={t}
              class={`outline-base-content overflow-hidden rounded-lg text-left ${
                theme === t ? "outline outline-2 outline-offset-2" : ""
              }`}
              onClick={() => {
                setTheme(t);
                localStorage.setItem("theme", t);
                document.documentElement.setAttribute("data-theme", t);
              }}
            >
              <div
                data-theme={t}
                class="bg-base-100 text-base-content w-full cursor-pointer font-sans"
              >
                <div class="grid grid-cols-5 grid-rows-3">
                  <div class="col-span-5 row-span-3 row-start-1 flex items-center gap-2 px-4 py-3">
                    <span class="capitalize">{t}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 