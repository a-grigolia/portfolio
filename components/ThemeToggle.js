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
            ? "text-foreground/40 transition-colors group-hover:text-foreground/70"
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
            : "text-foreground/40 transition-colors group-hover:text-foreground/70"
        }
      >
        dark
      </span>
      {" ]"}
    </button>
  );
}
