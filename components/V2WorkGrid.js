"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

// Fades/rises a card in the first time it scrolls into view.
function useInView(ref) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return visible;
}

function CardInner({ item }) {
  const comingSoon = Boolean(item.comingSoon);
  return (
    <>
      {/* Header: title/subtitle have no gap; year stays opposite. */}
      <div className="flex min-h-24 shrink-0 items-start justify-between gap-4 px-6 pt-6 md:px-8 md:pt-8">
        <div className="flex min-w-0 flex-col">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium leading-5 text-foreground">
                {item.title}
              </p>
              {!comingSoon ? (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                  className="v2-card-arrow shrink-0"
                >
                  <path
                    d="M3 9 9 3M4 3h5v5"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : null}
            </div>
            {item.subtitle ? (
              <p className="v2-card-subtitle text-sm leading-5 text-subtle">
                {item.subtitle}
              </p>
            ) : null}
          </div>
        </div>
        <p className="text-xs leading-4 text-muted">{item.year}</p>
      </div>

      {/* Media: each cover keeps its own natural size and aspect ratio */}
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <div
          className={`v2-media-frame relative rounded-2xl ${
            comingSoon
              ? "overflow-hidden border border-white bg-[#b9b9b9] shadow-[0px_2px_3px_rgba(0,0,0,0.15)] dark:border-border dark:bg-card"
              : "v2-media-group"
          }`}
          style={{
            "--v2-media-width": item.mediaWidth,
            "--v2-media-max-width": item.mediaMaxWidth,
            aspectRatio: item.aspect,
            maxHeight: "100%",
          }}
        >
          {item.media ? (
            <div className="v2-media-image absolute inset-0 overflow-hidden rounded-2xl border border-white shadow-[0px_2px_3px_rgba(0,0,0,0.15)] dark:border-border">
              <img
                src={item.media}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* Outcome anchors the opposite corner and reveals after the subtitle. */}
      <div className="flex h-24 shrink-0 items-end justify-end px-6 pb-6 md:px-8 md:pb-8">
        {!comingSoon && item.stats ? (
          <p className="v2-card-stats text-right text-sm leading-5 text-subtle">
            {item.stats}
          </p>
        ) : null}
      </div>
    </>
  );
}

function Card({ item, index, isActive, registerCard }) {
  const ref = useRef(null);
  const visible = useInView(ref);
  const setRef = useCallback(
    (node) => {
      ref.current = node;
      registerCard(index, node);
    },
    [index, registerCard]
  );

  const cellClass = `v2-card-reveal ${
    visible ? "is-visible" : ""
  } ${isActive ? "is-active" : ""} flex h-[75svh] flex-col border-b border-border md:aspect-square md:h-auto`;

  if (item.comingSoon) {
    return (
      <div ref={setRef} className={cellClass}>
        <CardInner item={item} />
      </div>
    );
  }

  // The whole square is the link.
  return (
    <Link
      ref={setRef}
      href={`/work/${item.slug}`}
      draggable={false}
      className={`${cellClass} group select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/60`}
    >
      <CardInner item={item} />
    </Link>
  );
}

export default function V2WorkGrid({ items }) {
  const gridRef = useRef(null);
  const cardRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [trackerVisible, setTrackerVisible] = useState(false);

  const registerCard = useCallback((index, node) => {
    cardRefs.current[index] = node;
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const root = document.documentElement;
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    let animationFrame = 0;

    const update = () => {
      animationFrame = 0;

      if (!mobileQuery.matches) {
        root.classList.remove("v2-carousel-active");
        setTrackerVisible(false);
        return;
      }

      const viewportHeight = window.innerHeight;
      const gridRect = grid.getBoundingClientRect();
      const isVisible = gridRect.top < viewportHeight && gridRect.bottom > 0;

      root.classList.toggle("v2-carousel-active", isVisible);
      setTrackerVisible(isVisible);

      if (!isVisible) return;

      const viewportCenter = viewportHeight / 2;
      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;

      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - viewportCenter);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      setActiveIndex((current) =>
        current === nearestIndex ? current : nearestIndex
      );
    };

    const scheduleUpdate = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.visualViewport?.addEventListener("resize", scheduleUpdate);
    mobileQuery.addEventListener("change", scheduleUpdate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      root.classList.remove("v2-carousel-active");
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.visualViewport?.removeEventListener("resize", scheduleUpdate);
      mobileQuery.removeEventListener("change", scheduleUpdate);
    };
  }, []);

  const scrollToCard = (index) => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    cardRefs.current[index]?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center",
    });
  };

  return (
    <>
      <div
        ref={gridRef}
        className="v2-work-grid relative grid border-t border-border md:grid-cols-2"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 z-10 hidden w-px -translate-x-1/2 bg-border md:block"
        />
        {items.map((item, index) => (
          <Card
            key={item.slug}
            item={item}
            index={index}
            isActive={activeIndex === index}
            registerCard={registerCard}
          />
        ))}
      </div>

      <nav
        aria-label="Project carousel"
        aria-hidden={!trackerVisible}
        className={`v2-carousel-tracker ${
          trackerVisible ? "is-visible" : ""
        }`}
      >
        {items.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <button
              key={item.slug}
              type="button"
              aria-label={`View ${item.title}`}
              aria-current={isActive ? "true" : undefined}
              tabIndex={trackerVisible ? 0 : -1}
              onClick={() => scrollToCard(index)}
              className={`v2-carousel-dot ${
                isActive ? "is-active" : ""
              }`}
            >
              <span />
            </button>
          );
        })}
      </nav>
    </>
  );
}
