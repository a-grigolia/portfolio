"use client";

import { useState } from "react";
import Lightbox from "./Lightbox";
import Visual from "./Visual";
import Placeholder from "./Placeholder";

export default function ImageBlock({
  src,
  color = "#d8d2c6",
  label,
  caption,
  ratio = "16 / 10",
  fit = "cover",
}) {
  const [open, setOpen] = useState(false);

  return (
    <figure>
      <div className="rounded-2xl bg-card p-4 sm:p-8">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={caption ? `Enlarge: ${caption}` : "Enlarge image"}
          className="group block w-full cursor-zoom-in overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:ring-white/5"
        >
          <div style={{ aspectRatio: ratio }} className="w-full overflow-hidden">
            <div className="h-full w-full transition-transform duration-500 group-hover:scale-[1.02]">
              <Visual src={src} color={color} label={label} fit={fit} />
            </div>
          </div>
        </button>
      </div>
      {caption ? (
        <figcaption className="mt-3 text-center text-sm text-muted">
          {caption}
        </figcaption>
      ) : null}

      <Lightbox open={open} onClose={() => setOpen(false)}>
        {src ? (
          <img
            src={src}
            alt={caption || label || ""}
            className="mx-auto max-h-[85vh] w-auto rounded-xl object-contain"
          />
        ) : (
          <div style={{ aspectRatio: ratio }} className="w-full">
            <Placeholder color={color} label={label} className="h-full w-full" />
          </div>
        )}
        {caption ? (
          <p className="mt-4 text-center font-sans text-[16px] text-white/70">{caption}</p>
        ) : null}
      </Lightbox>
    </figure>
  );
}
