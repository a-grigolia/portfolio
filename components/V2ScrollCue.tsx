"use client";

import { useEffect, useState } from "react";

const IDLE_MS = 6000;

export default function V2ScrollCue() {
  const [isAtTop, setIsAtTop] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);

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

  // Appears only after the visitor has gone IDLE_MS without scrolling; once
  // shown it stays revealed.
  useEffect(() => {
    if (isRevealed) return;
    let timeout = setTimeout(() => setIsRevealed(true), IDLE_MS);
    const restart = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsRevealed(true), IDLE_MS);
    };
    const events = ["scroll", "wheel", "touchmove"] as const;
    events.forEach((name) =>
      window.addEventListener(name, restart, { passive: true })
    );
    return () => {
      clearTimeout(timeout);
      events.forEach((name) => window.removeEventListener(name, restart));
    };
  }, [isRevealed]);

  const isVisible = isRevealed && isAtTop;

  return (
    <a
      href="#work"
      aria-label="Scroll to shipped work"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      className={`absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[12px] leading-6 text-foreground transition-[opacity,color] duration-500 hover:text-accent ${
        isVisible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <span className="whitespace-nowrap">[ shipped work ]</span>
      <span className="relative block h-[13.5px] w-2 shrink-0">
        <svg
          width="9.00001"
          height="14.7526"
          viewBox="0 0 9.00001 14.7526"
          fill="none"
          aria-hidden="true"
          className="v2-cue-chevrons absolute inset-[-3.7%_-6.25%_-5.57%_-6.25%] block max-w-none"
        >
          <path
            d="M8.50001 0.500006L4.50001 5.00001L0.500006 0.500005"
            stroke="currentColor"
            strokeLinecap="round"
            opacity={0.2}
          />
          <path
            d="M8.50001 5.00001L4.50001 9.50001L0.500006 5.00001"
            stroke="currentColor"
            strokeLinecap="round"
            opacity={0.2}
          />
          <path
            d="M8.50001 9.50001L4.50001 14L0.500006 9.50001"
            stroke="currentColor"
            strokeLinecap="round"
            opacity={0.8}
          />
        </svg>
      </span>
    </a>
  );
}
