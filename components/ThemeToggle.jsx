"use client";

import { useTheme } from "./ThemeProvider";
import Icon from "./Icon";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn-secondary !px-3 !py-2 text-sm"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <Icon name={theme === "dark" ? "sun" : "moon"} size="sm" className="icon-fancy" />
    </button>
  );
}
