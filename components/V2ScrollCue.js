"use client";

import { useEffect, useState } from "react";

export default function V2ScrollCue() {
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.classList.add("v2-hide-scrollbar");
    body.classList.add("v2-hide-scrollbar");

    const updateVisibility = () => setIsAtTop(window.scrollY < 1);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });

    return () => {
      root.classList.remove("v2-hide-scrollbar");
      body.classList.remove("v2-hide-scrollbar");
      window.removeEventListener("scroll", updateVisibility);
    };
  }, []);

  return (
    <a
      href="#work"
      aria-label="Scroll to case studies"
      aria-hidden={!isAtTop}
      tabIndex={isAtTop ? 0 : -1}
      className={`absolute bottom-6 left-1/2 -translate-x-1/2 text-muted transition-[opacity,color] duration-200 hover:text-foreground ${
        isAtTop ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className="animate-bounce motion-reduce:animate-none"
      >
        <path
          d="m3.5 6 4.5 4.5L12.5 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}
