"use client";

import { useTheme } from "@/app/theme-provider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
    >
      [
      <span className={isDark ? "" : "text-foreground"}>light</span>
      /
      <span className={isDark ? "text-foreground" : ""}>dark</span>
      ]
    </button>
  );
}
