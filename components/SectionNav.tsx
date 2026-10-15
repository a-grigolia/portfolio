"use client";

import { useEffect, useState } from "react";
import type { FocusEvent } from "react";
import type { Section } from "@/content/case-studies";

type SectionNavItem = Pick<Section, "id" | "label">;

interface SectionNavProps {
  sections?: SectionNavItem[];
}

export default function SectionNav({ sections = [] }: SectionNavProps) {
  const [activeId, setActiveId] = useState<string | null>(sections[0]?.id ?? null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el) => el !== null);
    if (!elements.length) return undefined;

    const lastId = elements[elements.length - 1]?.id ?? null;
    const isAtBottom = () =>
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

    // The last section can be too short to reach the observer band, so the
    // bottom of the page always marks it.
    const observer = new IntersectionObserver(
      (entries) => {
        if (isAtBottom()) {
          setActiveId(lastId);
          return;
        }
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );

    const handleScroll = () => {
      if (isAtBottom()) setActiveId(lastId);
    };

    elements.forEach((el) => observer.observe(el));
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [sections]);

  if (!sections.length) return null;

  // Hovering moves the bullet off the current section; leaving snaps it back.
  const markedId = hoveredId ?? activeId;

  function handleBlur(event: FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setHoveredId(null);
    }
  }

  return (
    <nav
      aria-label="Sections"
      onMouseLeave={() => setHoveredId(null)}
      onBlur={handleBlur}
    >
      <ul className="flex flex-col gap-1">
        {sections.map((section) => {
          const isMarked = section.id === markedId;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={section.id === activeId ? "location" : undefined}
                onMouseEnter={() => setHoveredId(section.id)}
                onFocus={() => setHoveredId(section.id)}
                className={`relative flex items-center whitespace-nowrap font-sans text-[14px] leading-[18px] transition-colors duration-250 ease-out focus-visible:outline-none motion-reduce:transition-none ${
                  isMarked ? "text-foreground" : "text-faint"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute left-0 transition-opacity duration-250 ease-out motion-reduce:transition-none ${
                    isMarked ? "opacity-100" : "opacity-0"
                  }`}
                >
                  •
                </span>
                <span
                  className={`transition-transform duration-250 ease-out motion-reduce:transition-none ${
                    isMarked ? "translate-x-[9px]" : "translate-x-0"
                  }`}
                >
                  {section.label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
