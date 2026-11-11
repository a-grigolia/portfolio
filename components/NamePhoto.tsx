"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { createPortal, preload } from "react-dom";

const PHOTO_SRC = "/avto-didgori.jpg";
const PHOTO_WIDTH = 282;
const PHOTO_HEIGHT = 376;
// Gap between the cursor and the photo's bottom-left corner.
const CURSOR_OFFSET = 12;
// Minimum distance kept from the window edges.
const EDGE_MARGIN = 8;

type OpenedBy = "mouse" | "touch" | null;

interface NamePhotoProps {
  name: string;
}

// The name in the intro. Hovering (mouse) shows a photo whose bottom-left
// corner tracks the cursor; on touch, a tap shows it at the tap point and the
// next tap anywhere, or a scroll, hides it.
export default function NamePhoto({ name }: NamePhotoProps) {
  preload(PHOTO_SRC, { as: "image" });

  const [mounted, setMounted] = useState(false);
  const [openedBy, setOpenedBy] = useState<OpenedBy>(null);
  const openedByRef = useRef<OpenedBy>(null);
  const wasOpenOnDownRef = useRef(false);
  const frameRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setMounted(true), []);

  function open(mode: Exclude<OpenedBy, null>) {
    openedByRef.current = mode;
    setOpenedBy(mode);
  }

  function close() {
    openedByRef.current = null;
    setOpenedBy(null);
  }

  // Position is written straight to the DOM so the photo stays locked to the
  // cursor without re-rendering on every pointer move.
  function placeAt(x: number, y: number) {
    const frame = frameRef.current;
    if (!frame) return;
    const maxLeft = window.innerWidth - PHOTO_WIDTH - EDGE_MARGIN;
    const left = Math.max(EDGE_MARGIN, Math.min(x + CURSOR_OFFSET, maxLeft));
    const top = Math.max(EDGE_MARGIN, y - CURSOR_OFFSET - PHOTO_HEIGHT);
    frame.style.transform = `translate3d(${left}px, ${top}px, 0)`;
  }

  function handlePointerEnter(event: ReactPointerEvent<HTMLSpanElement>) {
    if (event.pointerType === "touch") return;
    placeAt(event.clientX, event.clientY);
    open("mouse");
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLSpanElement>) {
    if (event.pointerType === "touch") return;
    placeAt(event.clientX, event.clientY);
  }

  function handlePointerLeave(event: ReactPointerEvent<HTMLSpanElement>) {
    if (event.pointerType === "touch") return;
    if (openedByRef.current === "mouse") close();
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLSpanElement>) {
    if (event.pointerType !== "touch") return;
    wasOpenOnDownRef.current = openedByRef.current === "touch";
  }

  // pointerup rather than click: iOS doesn't fire click on non-interactive
  // elements, and a pan that starts on the name ends in pointercancel instead.
  function handlePointerUp(event: ReactPointerEvent<HTMLSpanElement>) {
    if (event.pointerType !== "touch" || wasOpenOnDownRef.current) return;
    placeAt(event.clientX, event.clientY);
    open("touch");
  }

  useEffect(() => {
    if (openedBy !== "touch") return;
    const dismiss = () => {
      openedByRef.current = null;
      setOpenedBy(null);
    };
    // React's handlers on the name run before this document listener, so a
    // tap on the name while open is recorded before the photo closes.
    document.addEventListener("pointerdown", dismiss);
    window.addEventListener("scroll", dismiss, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("scroll", dismiss);
    };
  }, [openedBy]);

  const isOpen = openedBy !== null;

  return (
    <>
      <span
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="text-foreground underline decoration-dotted underline-offset-2 transition-colors hover:text-accent"
      >
        {name}
      </span>
      {/* Portaled to body: the intro's reveal animation transforms its
          ancestors, which would otherwise offset position: fixed. Always
          mounted so the image is decoded before the first hover. */}
      {mounted
        ? createPortal(
            <div
              ref={frameRef}
              aria-hidden={!isOpen}
              className="pointer-events-none fixed left-0 top-0 z-50"
            >
              <div
                className={`name-photo overflow-hidden rounded-2xl border border-white shadow-[0px_2px_3px_0px_rgba(0,0,0,0.15)] ${
                  isOpen ? "is-open" : ""
                }`}
                style={{ width: PHOTO_WIDTH, height: PHOTO_HEIGHT }}
              >
                <img
                  src={PHOTO_SRC}
                  alt="Avto leaning against a giant sword sculpture on a grassy hill"
                  width={768}
                  height={1024}
                  className="block size-full object-cover"
                />
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
