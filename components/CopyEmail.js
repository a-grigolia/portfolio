"use client";

import { useEffect, useRef, useState } from "react";

const COPIED_COLOR = "#60B073";
const SLIDE_MS = 250;
const HOLD_MS = 2000;

function ClipboardIcon() {
  return (
    <svg
      width="11"
      height="13"
      viewBox="0 0 11 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M8.5 0C9.88071 0 11 1.11929 11 2.5V8.5C11 9.7248 10.1188 10.7415 8.95605 10.9561C8.74152 12.1188 7.7248 13 6.5 13H2.5C1.11929 13 0 11.8807 0 10.5V4.5C0 3.27547 0.880623 2.25781 2.04297 2.04297C2.25781 0.880623 3.27547 0 4.5 0H8.5ZM2 3.08691C1.41766 3.29297 1 3.84707 1 4.5V10.5C1 11.3284 1.67157 12 2.5 12H6.5C7.15293 12 7.70703 11.5823 7.91309 11H4.5C3.11929 11 2 9.88071 2 8.5V3.08691ZM4.5 1C3.67157 1 3 1.67157 3 2.5V8.5C3 9.32843 3.67157 10 4.5 10H8.5C9.32843 10 10 9.32843 10 8.5V2.5C10 1.67157 9.32843 1 8.5 1H4.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Phases: idle → copied (slide up to the green row) → returning (keep sliding
// up to a duplicate email row) → snap back to idle with no transition, which
// is invisible because rows 0 and 2 are identical.
export default function CopyEmail({ email }) {
  const [phase, setPhase] = useState("idle");
  const timeoutsRef = useRef([]);

  useEffect(() => {
    return () => timeoutsRef.current.forEach(clearTimeout);
  }, []);

  async function handleClick() {
    if (phase !== "idle") return;
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      return;
    }
    setPhase("copied");
    timeoutsRef.current.push(
      setTimeout(() => {
        setPhase("returning");
        timeoutsRef.current.push(setTimeout(() => setPhase("idle"), SLIDE_MS));
      }, HOLD_MS)
    );
  }

  // Row height is h-6 (1.5rem). translateY percentages would be relative to
  // the full 3-row stack, so use explicit row-height offsets instead.
  const offset =
    phase === "copied" ? "-1.5rem" : phase === "returning" ? "-3rem" : "0";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Copy email address ${email} to clipboard`}
      className="h-6 w-fit cursor-pointer overflow-hidden text-left text-base leading-6 text-foreground transition-colors hover:text-accent"
    >
      <span aria-live="polite" className="sr-only">
        {phase !== "idle" ? "Email copied to your clipboard" : ""}
      </span>
      <span
        aria-hidden="true"
        className="flex flex-col"
        style={{
          transform: `translateY(${offset})`,
          transition: phase === "idle" ? "none" : `transform ${SLIDE_MS}ms ease`,
        }}
      >
        <span className="flex h-6 items-center gap-2">
          {email}
          <ClipboardIcon />
        </span>
        <span
          className="flex h-6 items-center gap-2"
          style={{ color: COPIED_COLOR }}
        >
          Copied to your clipboard
          <ClipboardIcon />
        </span>
        <span className="flex h-6 items-center gap-2">
          {email}
          <ClipboardIcon />
        </span>
      </span>
    </button>
  );
}
