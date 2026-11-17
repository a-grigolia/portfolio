"use client";

import dynamic from "next/dynamic";

// WebGL only exists in the browser, and skipping SSR keeps three.js out of the
// server bundle. The page background shows through until the scene mounts.
const FilmGallery = dynamic(() => import("./FilmGallery"), { ssr: false });

interface FilmRollProps {
  photos: string[];
}

// A lightbox: light even when the rest of the site is dark.
export default function FilmRoll({ photos }: FilmRollProps) {
  return <FilmGallery photos={photos} theme="light" verticalScroll />;
}
