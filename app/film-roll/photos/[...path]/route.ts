import { get } from "@vercel/blob";
import sharp from "sharp";
import { FILM_FOLDER } from "../../folder";

const PHOTO = /\.(jpe?g|png|webp|avif)$/i;

// The frame draws a photo at most 864px on its long edge, so this covers both
// orientations with room to spare.
const LONG_EDGE = 1200;

// Serves a resized copy of a photo from the private Blob store's film folder.
// The original never leaves the store. URLs carry a ?v= upload stamp, so the
// response can be cached forever.
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  if (path.includes("..") || !PHOTO.test(path.at(-1) ?? "")) {
    return new Response(null, { status: 404 });
  }

  const result = await get(`${FILM_FOLDER}${path.join("/")}`, {
    access: "private",
    token: process.env.BLOB_READ_WRITE_TOKEN, // same auth order as the page
  });
  if (!result || result.statusCode !== 200) {
    return new Response(null, { status: 404 });
  }

  const original = Buffer.from(await new Response(result.stream).arrayBuffer());
  const photo = await sharp(original)
    .rotate() // apply EXIF orientation before it is stripped
    .resize(LONG_EDGE, LONG_EDGE, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  return new Response(new Uint8Array(photo), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
    },
  });
}
