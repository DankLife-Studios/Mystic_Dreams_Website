"use client";

import { useTheme } from "./ThemeProvider";
import Icon from "./Icon";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="nav-pill nav-pill-idle !px-2.5"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <Icon name={theme === "dark" ? "sun" : "moon"} size="sm" />
    </button>
  );
}
