import type { Metadata } from "next";
import Link from "next/link";
import { list } from "@vercel/blob";
import FilmRoll from "@/components/film-gallery/FilmRoll";
import { FILM_FOLDER } from "./folder";

const title = "Film roll • Avto Grigolia";
const description = "Personal photos shot on Kodak Gold 400.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: "/film-roll",
    siteName: "Avto Grigolia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

// New uploads show up within the hour without a redeploy.
export const revalidate = 3600;

const PHOTO = /\.(jpe?g|png|webp|avif)$/i;

// Every photo in the Blob store's film folder, newest first. Filenames count up
// as photos are added, so the highest number opens the roll.
async function getPhotos(): Promise<string[]> {
  // Blob auth is either a read-write token or OIDC with a store id. A token,
  // when set, is passed explicitly so it wins over OIDC, which the store only
  // allows in some environments. With neither, the gallery falls back to
  // placeholder frames.
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) return [];

  const blobs = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: FILM_FOLDER, cursor, token: process.env.BLOB_READ_WRITE_TOKEN });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  return blobs
    .filter((blob) => PHOTO.test(blob.pathname))
    .sort((a, b) => b.pathname.localeCompare(a.pathname, undefined, { numeric: true }))
    .map((blob) => {
      // The store is private, so photos come resized through photos/[...path].
      const path = blob.pathname.slice(FILM_FOLDER.length).split("/").map(encodeURIComponent).join("/");
      return `/film-roll/photos/${path}?v=${blob.uploadedAt.getTime()}`;
    });
}

export default async function FilmRollPage() {
  const photos = await getPhotos();

  return (
    <div data-film-roll className="relative h-svh">
      <Link
        href="/"
        aria-label="Home"
        className="absolute left-0 z-40 flex w-6 justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 md:left-3"
        style={{ top: "calc(12px + env(safe-area-inset-top))" }}
      >
        <img
          src="/a.svg"
          alt="Avto logo"
          className="h-[17px] w-4 md:h-[26px] md:w-6"
        />
      </Link>

      <FilmRoll photos={photos} />
    </div>
  );
}
