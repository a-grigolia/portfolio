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
      className="group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
    >
      {"[ "}
      <span
        className={
          isDark
            ? "text-border transition-colors group-hover:text-subtle"
            : "text-foreground transition-colors"
        }
      >
        light
      </span>
      {" / "}
      <span
        className={
          isDark
            ? "text-foreground transition-colors"
            : "text-border transition-colors group-hover:text-subtle"
        }
      >
        dark
      </span>
      {" ]"}
    </button>
  );
}
