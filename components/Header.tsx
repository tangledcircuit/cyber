import ThemeSwitcher from "../islands/ThemeSwitcher.tsx";

export default function Header() {
  return (
    <header class="navbar bg-base-100">
      {/* Your existing header content */}
      <div class="flex-none gap-2">
        <ThemeSwitcher />
        {/* Other header items */}
      </div>
    </header>
  );
} 