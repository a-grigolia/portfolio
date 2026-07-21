"use client";

import { useEffect, useState } from "react";

const ROW_HEIGHT = 20;
const ROW_GAP = 8;

export default function SectionNav({ sections = [] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? null);

  useEffect(() => {
    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean);
    if (!elements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  if (!sections.length) return null;

  const activeIndex = Math.max(
    0,
    sections.findIndex((s) => s.id === activeId)
  );

  return (
    <nav aria-label="Sections" className="relative text-sm">
      {/* Continuous track with a sliding active indicator */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[2px] rounded-[3px] bg-border"
      >
        <div
          className="absolute left-0 top-0 h-5 w-[2px] rounded-[4px] bg-accent transition-transform duration-300 ease-out"
          style={{
            transform: `translateY(${activeIndex * (ROW_HEIGHT + ROW_GAP)}px)`,
          }}
        />
      </div>
      <ul className="flex flex-col gap-2">
        {sections.map((section) => {
          const isActive = section.id === activeId;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={`flex h-5 items-center whitespace-nowrap pl-4 leading-5 transition-colors ${
                  isActive
                    ? "text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {section.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
