"use client";

import { useEffect, useRef, useState } from "react";
import CopyEmail from "./CopyEmail";
import LocalClock from "./LocalClock";
import ThemeToggle from "./ThemeToggle";
import { profile } from "@/content/site";

// Fixed corner chrome for the v2 landing page, per the Figma: 12px corner
// padding inside 48px gutters, vertical "Connect" label that opens a frosted-glass
// dropdown, vertical clock and theme toggle. Desktop only (>=1100px); below
// that the page renders its in-flow mobile header/footer instead.
export default function V2Chrome() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Close on outside click or Escape while the dropdown is open.
  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event) {
      if (
        menuRef.current?.contains(event.target) ||
        buttonRef.current?.contains(event.target)
      ) {
        return;
      }
      setOpen(false);
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      {/* Top left: logo, scrolls back to top */}
      <div className="reveal fixed left-3 top-3 z-40 hidden min-[1100px]:block">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll to top"
          className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          <img
            src="/a.svg"
            alt="Avto logo"
            className="h-[26px] w-6 dark:invert"
          />
        </button>
      </div>

      {/* Top right: vertical Connect label toggling the dropdown */}
      <div
        className="reveal fixed right-3 top-3 z-40 hidden w-6 min-[1100px]:flex min-[1100px]:justify-center"
        style={{ "--reveal-delay": "80ms" }}
      >
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-haspopup="menu"
          className="cursor-pointer text-[12px] leading-6 text-foreground transition-colors [writing-mode:vertical-rl] hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          Connect
        </button>
      </div>

      {open ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Connect"
          className="fixed right-9 top-3 z-50 hidden origin-top-right animate-[reveal-rise_0.25s_cubic-bezier(0.16,1,0.3,1)_both] rounded-xl bg-white/25 p-4 shadow-[0px_2px_6px_0px_rgba(0,0,0,0.15)] backdrop-blur-[20px] min-[1100px]:block dark:bg-white/10"
        >
          <div className="flex w-[175px] flex-col gap-1 text-sm leading-[22px]">
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              className="w-fit text-foreground transition-colors hover:text-accent"
            >
              {profile.linkedinLabel}
            </a>
            <a
              href={profile.resume}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              className="w-fit text-foreground transition-colors hover:text-accent"
            >
              {profile.resumeLabel}
            </a>
            <CopyEmail email={profile.email} size="sm" />
          </div>
        </div>
      ) : null}

      {/* Bottom left: location + live PST clock, reading bottom-to-top */}
      <div
        className="reveal fixed bottom-3 left-3 z-40 hidden w-6 min-[1100px]:flex min-[1100px]:justify-center"
        style={{ "--reveal-delay": "160ms" }}
      >
        <LocalClock vertical />
      </div>

      {/* Bottom right: vertical theme toggle */}
      <div
        className="reveal fixed bottom-3 right-3 z-40 hidden w-6 justify-center text-[12px] leading-6 min-[1100px]:flex"
        style={{ "--reveal-delay": "240ms" }}
      >
        <ThemeToggle vertical />
      </div>
    </>
  );
}
