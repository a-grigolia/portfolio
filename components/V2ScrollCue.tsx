"use client";

import { useEffect, useState } from "react";

const IDLE_MS = 3000;

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
      <span className="flex h-[5.625px] w-[10px] animate-bounce items-center justify-center motion-reduce:animate-none">
        <span className="rotate-90">
          <span className="relative block h-[10px] w-[5.625px]">
            <img
              src="/shipped-work-chevron.svg"
              alt=""
              width={6.8776}
              height={11}
              className="absolute inset-[-5%_-13.38%_-5%_-8.89%] block max-w-none dark:invert"
            />
          </span>
        </span>
      </span>
    </a>
  );
}
