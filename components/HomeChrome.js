"use client";

import ThemeToggle from "./ThemeToggle";
import CopyEmail from "./CopyEmail";
import LocalClock from "./LocalClock";
import { profile } from "@/content/site";

// Fixed corner chrome for the homepage. Only shown at >=1100px, where the
// corners clear the 816px centered content column; below that the page
// renders the in-flow mobile header/footer instead.
export default function HomeChrome() {
  return (
    <>
      {/* Top left: logo, scrolls back to top */}
      <div className="reveal fixed left-4 top-4 z-40 hidden min-[1100px]:block">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll to top"
          className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          <img src="/logo.png" alt="Avto logo" className="size-5" />
        </button>
      </div>

      {/* Top right: connect links */}
      <div
        className="reveal fixed right-4 top-4 z-40 hidden items-center gap-4 text-[12px] leading-[20px] min-[1100px]:flex"
        style={{ "--reveal-delay": "80ms" }}
      >
        <a
          href={profile.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground transition-colors hover:text-accent"
        >
          {profile.linkedinLabel}
        </a>
        <a
          href={profile.resume}
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground transition-colors hover:text-accent"
        >
          {profile.resumeLabel}
        </a>
        <CopyEmail email={profile.email} small />
      </div>

      {/* Bottom left: location + live PST clock, reading bottom-to-top */}
      <div
        className="reveal fixed bottom-4 left-4 z-40 hidden min-[1100px]:block"
        style={{ "--reveal-delay": "160ms" }}
      >
        <LocalClock vertical />
      </div>

      {/* Bottom right: theme toggle */}
      <div
        className="reveal fixed bottom-4 right-4 z-40 hidden text-[12px] leading-[20px] min-[1100px]:block"
        style={{ "--reveal-delay": "240ms" }}
      >
        <ThemeToggle />
      </div>
    </>
  );
}
