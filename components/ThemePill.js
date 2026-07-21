"use client";

import { useTheme } from "@/app/theme-provider";

export default function ThemePill() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const select = (target) => {
    if ((target === "dark") !== isDark) toggleTheme();
  };

  return (
    <div className="relative flex h-8 w-48 rounded-full bg-border shadow-[inset_0px_1px_2px_0px_rgba(0,0,0,0.2)]">
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-1/2 rounded-full bg-foreground transition-transform duration-300 ease-out ${
          isDark ? "translate-x-full" : "translate-x-0"
        }`}
      />
      <button
        type="button"
        onClick={() => select("light")}
        aria-pressed={!isDark}
        className={`relative z-10 flex-1 cursor-pointer rounded-full text-sm font-semibold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
          isDark ? "text-foreground" : "text-background"
        }`}
      >
        Light
      </button>
      <button
        type="button"
        onClick={() => select("dark")}
        aria-pressed={isDark}
        className={`relative z-10 flex-1 cursor-pointer rounded-full text-sm font-semibold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
          isDark ? "text-background" : "text-foreground"
        }`}
      >
        Dark
      </button>
    </div>
  );
}
