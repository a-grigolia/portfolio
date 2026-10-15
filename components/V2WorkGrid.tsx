"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import type { WorkItem } from "@/content/site";
import PlusGrid from "./PlusGrid";

// React's CSSProperties is closed (no index signature); this widens it for
// CSS custom properties like --v2-media-width.
type CSSVars = CSSProperties & { [key: `--${string}`]: string | undefined };

// Grid items are WorkItems augmented with per-project presentation sizing;
// "coming soon" cells carry only a subset of the WorkItem fields.
export interface V2WorkGridItem
  extends Pick<WorkItem, "slug" | "title" | "year">,
    Partial<Pick<WorkItem, "subtitle" | "stats" | "media" | "href">> {
  comingSoon?: boolean;
  // plusGrid replaces the media with a live grid; logo draws the media's alpha
  // as a bare silhouette in the theme's ink color.
  mediaVariant?: "plusGrid" | "logo";
  mediaWidth?: string;
  mediaMaxWidth?: string;
  aspect?: string;
}

// Minimum gap between consecutive image reveals, so images entering together
// (e.g. both cards in a desktop row) play in order.
const REVEAL_STAGGER_MS = 150;

// Just under 1 because subpixel layout can leave a fully visible image at a
// ratio like 0.9999, which never reaches a threshold of exactly 1.
const FULLY_VISIBLE = 0.99;

// Maximum cover tilt on each axis when the cursor is at the card's edge.
const MAX_TILT_DEG = 8;

// Matches the desktop hover treatment in globals.css.
let tiltQuery: MediaQueryList | undefined;
const canTilt = () =>
  (tiltQuery ??= window.matchMedia("(hover: hover) and (min-width: 768px)"))
    .matches;

// Tilts the cover toward the cursor: the side under the pointer lifts toward
// the viewer, like a playing card.
function handleTiltMove(event: PointerEvent<HTMLElement>) {
  if (event.pointerType === "touch" || !canTilt()) return;
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  card.style.setProperty("--v2-tilt-x", `${(y * 2 * MAX_TILT_DEG).toFixed(2)}deg`);
  card.style.setProperty("--v2-tilt-y", `${(-x * 2 * MAX_TILT_DEG).toFixed(2)}deg`);
}

function handleTiltLeave(event: PointerEvent<HTMLElement>) {
  event.currentTarget.style.removeProperty("--v2-tilt-x");
  event.currentTarget.style.removeProperty("--v2-tilt-y");
}

function isVideo(src: string) {
  return /\.(mov|mp4|webm)$/i.test(src);
}

interface CardInnerProps {
  item: V2WorkGridItem;
  // Undefined until the image is revealed.
  revealDelay?: number;
  mediaRef: (node: HTMLElement | null) => void;
}

function CardInner({ item, revealDelay, mediaRef }: CardInnerProps) {
  const comingSoon = Boolean(item.comingSoon);
  const revealed = revealDelay !== undefined;
  return (
    <>
      {/* Header: title/subtitle have no gap; year stays opposite. */}
      <div className="v2-card-text flex min-h-24 shrink-0 items-start justify-between gap-4 px-6 pt-6 md:px-8 md:pt-8">
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
      <div
        className={`flex min-h-0 flex-1 items-center justify-center transition-[opacity,translate] duration-500 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
          revealed ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
        style={{ transitionDelay: `${revealDelay ?? 0}ms` }}
      >
        <div
          ref={mediaRef}
          className={`v2-media-frame relative rounded-2xl ${
            item.mediaVariant === "plusGrid"
              ? ""
              : comingSoon || !item.media
                ? "overflow-hidden border border-white bg-[#b9b9b9] shadow-[0px_2px_3px_rgba(0,0,0,0.15)] dark:border-border dark:bg-card"
                : "v2-media-group"
          }`}
          style={
            {
              "--v2-media-width": item.mediaWidth,
              "--v2-media-max-width": item.mediaMaxWidth,
              aspectRatio: item.aspect,
              maxHeight: "100%",
            } as CSSVars
          }
        >
          {item.mediaVariant === "plusGrid" ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <PlusGrid
                rows={6}
                cols={18}
                colsMobile={12}
                breakpoint={768}
                minScale={0}
                maxScale={Infinity}
                className="plus-grid"
                style={{ touchAction: "pan-y" }}
              />
            </div>
          ) : item.mediaVariant === "logo" && item.media ? (
            <div
              className="absolute inset-0 bg-black dark:bg-white"
              style={{
                maskImage: `url(${item.media})`,
                maskSize: "contain",
                maskRepeat: "no-repeat",
                maskPosition: "center",
              }}
            />
          ) : item.media ? (
            <div className="v2-media-image absolute inset-0 overflow-hidden rounded-2xl border border-white shadow-[0px_2px_3px_rgba(0,0,0,0.15)] dark:border-border">
              {isVideo(item.media) ? (
                <video
                  src={item.media}
                  autoPlay
                  loop
                  muted
                  playsInline
                  aria-hidden="true"
                  className="absolute inset-0 size-full object-cover"
                />
              ) : (
                <img
                  src={item.media}
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                />
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Outcome anchors the opposite corner and reveals after the subtitle. */}
      <div className="v2-card-text flex h-24 shrink-0 items-end justify-end px-6 pb-6 md:px-8 md:pb-8">
        {!comingSoon && item.stats ? (
          <p className="v2-card-stats text-right text-sm leading-5 text-subtle">
            {item.stats}
          </p>
        ) : null}
      </div>
    </>
  );
}

interface CardProps {
  item: V2WorkGridItem;
  index: number;
  isActive: boolean;
  revealDelay?: number;
  registerCard: (index: number, node: HTMLElement | null) => void;
  registerMedia: (index: number, node: HTMLElement | null) => void;
}

function Card({
  item,
  index,
  isActive,
  revealDelay,
  registerCard,
  registerMedia,
}: CardProps) {
  const setRef = useCallback(
    (node: HTMLElement | null) => registerCard(index, node),
    [index, registerCard]
  );
  const setMediaRef = useCallback(
    (node: HTMLElement | null) => registerMedia(index, node),
    [index, registerMedia]
  );

  const cellClass = `v2-card ${
    isActive ? "is-active" : ""
  } flex h-[75svh] flex-col border-b border-border md:aspect-square md:h-auto`;
  const inner = (
    <CardInner item={item} revealDelay={revealDelay} mediaRef={setMediaRef} />
  );

  if (item.comingSoon) {
    return (
      <div ref={setRef} className={cellClass}>
        {inner}
      </div>
    );
  }

  // The whole square is the link.
  const linkClass = `${cellClass} group select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/60`;
  const tiltHandlers =
    item.mediaVariant === "plusGrid"
      ? {}
      : { onPointerMove: handleTiltMove, onPointerLeave: handleTiltLeave };

  if (item.href) {
    return (
      <a
        ref={setRef}
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        draggable={false}
        {...tiltHandlers}
        className={linkClass}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link
      ref={setRef}
      href={`/work/${item.slug}`}
      draggable={false}
      {...tiltHandlers}
      className={linkClass}
    >
      {inner}
    </Link>
  );
}

interface V2WorkGridProps {
  items: V2WorkGridItem[];
}

export default function V2WorkGrid({ items }: V2WorkGridProps) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [trackerVisible, setTrackerVisible] = useState(false);
  // Index -> transition delay (ms) for each image that has been revealed.
  const [revealDelays, setRevealDelays] = useState<ReadonlyMap<number, number>>(
    new Map()
  );

  const registerCard = useCallback((index: number, node: HTMLElement | null) => {
    cardRefs.current[index] = node;
  }, []);

  const registerMedia = useCallback((index: number, node: HTMLElement | null) => {
    mediaRefs.current[index] = node;
  }, []);

  // Each image reveals once, after it has been fully on screen. Reveals run
  // strictly in card order: covers in a row differ in height, so the shorter
  // right-hand one would otherwise become fully visible (and play) first.
  useEffect(() => {
    const nodes = mediaRefs.current;
    const reveal = (index: number, delay: number) =>
      setRevealDelays((current) => new Map(current).set(index, delay));

    if (typeof IntersectionObserver === "undefined") {
      nodes.forEach((_, index) => reveal(index, 0));
      return;
    }

    let cursor = 0;
    let nextRevealAt = 0;

    // Reached = bottom edge on screen (within the observer's tolerance) or
    // already scrolled past, so a fast jump down doesn't stall the queue.
    const isReached = (node: HTMLElement) => {
      const rect = node.getBoundingClientRect();
      const tolerance = rect.height * (1 - FULLY_VISIBLE) + 1;
      return rect.bottom <= window.innerHeight + tolerance;
    };

    const observer = new IntersectionObserver(
      () => {
        while (cursor < nodes.length) {
          const node = nodes[cursor];
          if (node && !isReached(node)) break;
          const index = cursor++;
          const now = performance.now();
          nextRevealAt = Math.max(now, nextRevealAt + REVEAL_STAGGER_MS);
          reveal(index, Math.round(nextRevealAt - now));
        }
        if (cursor >= nodes.length) observer.disconnect();
      },
      { threshold: FULLY_VISIBLE }
    );

    nodes.forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
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

  const scrollToCard = (index: number) => {
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
        className="v2-work-grid relative grid md:grid-cols-2"
      >
        {/* Same two-track split as the hero bands so the center lines round
            to the same pixel. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 hidden grid-cols-2 md:grid"
        >
          <div className="border-r border-border" />
        </div>
        {items.map((item, index) => (
          <Card
            key={item.slug}
            item={item}
            index={index}
            isActive={activeIndex === index}
            revealDelay={revealDelays.get(index)}
            registerCard={registerCard}
            registerMedia={registerMedia}
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
