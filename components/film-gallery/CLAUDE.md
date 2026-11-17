# FilmGallery

Context for working on `FilmGallery.tsx`, the film photo gallery on avtogrigolia.com.

## What it is

A side-by-side row of Avto's film photos. Each photo is drawn as a scanned 35mm frame with
sprocket holes, amber edge print and scanner grunge. A tick-ruler dial at the bottom shows
where you are in the roll.

One file, one default export, one dependency (`three`). It has `'use client'` at the top and
only touches `window` inside effects.

```tsx
<div style={{ height: '100vh' }}>
  <FilmGallery photos={['/film/01.jpg', '/film/02.jpg']} />
</div>
```

It fills its parent, so the parent needs a height.

## Decisions already made (do not relitigate without asking)

These came out of several rounds of review. Avto picked each one on purpose.

- **Flat row, not a 3D arrangement.** Rings, drums, fans, arcs, a contact sheet and about 30
  other layouts were built and rejected for this piece. The row won.
- **Sizing:** the center frame is 1.32x. Every other frame is 1x. There is no further falloff
  toward the edges. A version that kept shrinking outward was tried and rejected.
- **The roll ends.** It does not loop. It opens on frame 1 and stops on the last frame.
  `loop` exists as a prop but defaults to `false`.
- **Edges overscroll like a browser page.** Pushed past either end, the whole row slides with
  growing resistance (frames never stretch) and springs back the moment the fingers stop or
  the trackpad starts coasting. It never waits out the coast while sitting off to the side.
- **Glide, then settle.** (Replaced the earlier hard detents, Nov 2026.) The row follows a
  trackpad swipe or dial drag 1:1, glides with its momentum, then settles softly onto a
  photo with no overshoot. A small swipe moves exactly one photo; a big flick can travel
  several. A small deliberate move always goes at least one photo over.
- **Click a frame to go to it.** Non-centered frames show a pointer cursor.
- **No browser back/forward swipe on the page.** `/film-roll` sets `overscroll-behavior-x:
  none` (see `app/globals.css`), so sideways swipes only move the gallery. Aimed at Chrome;
  Safari's swipe navigation is not covered.
- **Separate cut frames with a gap**, not one continuous strip.
- **Mixed orientation.** Portrait photos get an upright frame. Landscape photos get the same
  frame turned on its side. Both must keep working in the same row.
- **Film look:** based on Kodak Gold 400, which is what Avto shoots. Grungy and cool, not
  clean. The current grunge level is approved, so don't make it dirtier or cleaner unasked.
- **Background:** pure white in light mode, like a lightbox. Dark mode is supported.
- **Simple, not gimmicky.** No extra chrome, captions, buttons or decoration around the row.
  The only UI is the dial and the `01 / 16` counter.
- **Dial (from Figma, TBS Design Gallery file, node 1417:309):** one 2px rounded tick per
  photo, 16px apart, 25 visible. There is no fixed needle: each tick's height comes from its
  distance to the current position (48, 32, 22, 18, 14, 12, 10, 8, 7, 6, 5, 4, 4px), so all
  ticks resize as the roll moves and the current photo's tick is the tall one. Ink is
  `#272727`, full at the middle and 20% elsewhere. The ruler ends with the roll. Dragging
  moves one photo per 18px.
- **Counter:** `01 / 31`, zero-padded, in Geist sans 12px with tabular digits, three 20px
  cells. The current number is full black, `/ 31` is 30%. (Replaced Geist Mono, Nov 2026.)
- **Dark mode dial and counter** use the site's dark foreground `#e7e7e7` at the same strengths.

## How it works

### The frame painter (top half of the file)

`createFilmFrame(index, stock)` returns a 2D canvas and a `draw(img?, { landscape, dark })`
function that paints the whole frame, photo included. No image assets are involved.

- Laid out in millimetres at 24 canvas px per mm, using real 35mm numbers: 35mm film,
  24.5 x 36mm image window, 2.8 x 1.98mm holes on a 4.75mm pitch, 8 holes per side.
- All randomness comes from a seeded generator (`mulberry32`) seeded by the frame index.
  Each frame is dirty in its own way, and the same frame looks identical on every load and
  every redraw. Keep it seeded. `Math.random()` would make dust jump when a photo loads.
- Paint order, back to front: base shape, rebate clouds, photo, light leak (40% of frames),
  edge print, scratches, dust and hairs, grain, then the sprocket holes.
- The holes are real transparency. A cream glow is painted first, then the hole shapes are
  erased with `destination-out`, which leaves the bloom around a see-through hole.
- Landscape is the portrait drawing rotated a quarter turn clockwise, with the canvas
  resized and the photo counter-rotated so it ends up upright. Both edge-print lines read
  bottom to top in portrait so they both read left to right in landscape.
- Dark mode skips the hole bloom and lifts the base color so the film reads on a dark page.

### The gallery (bottom half)

- Each frame is a unit `PlaneGeometry` with the frame canvas as a `CanvasTexture`, sized per
  card. `alphaTest` makes the holes actual holes.
- A photo more than 5% wider than tall is treated as landscape once it loads. That changes
  the card's width, so the row is laid out as a running total of widths (`layOut`, `rowX`),
  not a fixed pitch.
- `sim` is a ref holding `pos` (in photos), `vel`, `target` (the photo it is settling on, or
  `null` while input drives it), `pxPerPhoto` and `shown` (the counter). The render loop reads
  it every frame and updates the counter state only when the shown photo changes. Don't move
  this into React state, it would restart the scene on every step.
- Two moves: `drive(d)` pushes `pos` directly, with resistance past the ends, and
  `settleTo(t)` hands over to a critically damped spring (solved exactly per frame) that keeps
  the current velocity. `settleTo` caps that velocity so the spring never overshoots a photo
  and never carries more than `EDGE_BOUNCE` past an end.
- Trackpad: browsers don't say when fingers lift, so the wheel handler infers it. Events that
  keep shrinking are the trackpad coasting. Once coasting drops below `SLOW` (or immediately,
  if past an end) it settles and ignores the rest of that coast. A growing delta or a 120ms gap
  starts a new gesture. `IDLE_MS` without events counts as fingers stopped.
- Release picks `round(pos + vel * PROJECT)`, bumped one photo over if the gesture moved at
  least `INTENT` but would land back where it started.
- Click: a raycast on the stage finds the frame under the pointer.
- The scene effect rebuilds from scratch when photos, theme, gap, loop or stock change.
- Input: drag the dial, tap a tick, scroll horizontally anywhere on the gallery, click a frame,
  or arrow keys. A press on the dial that moves under 5px before release is a tap and goes to
  that tick; anything more is a drag. Vertical scroll moves the row anywhere when `verticalScroll` is on (the film roll page
  turns it on), otherwise only over the dial, so a page around the gallery can still scroll.
  Scrolling down or right goes to the next photo.

## Knobs

| What | Where | Current |
| --- | --- | --- |
| Center frame size | `ACTIVE_SCALE` | 1.32 |
| Overall size of the row | `CAMERA_Z` (bigger = smaller) | 6.6 |
| Gap between frames | `gap` prop | 0.12 |
| Dial tick pitch (= drag per photo) | `TICK_PX` | 18px |
| Dial tick heights, middle outward | `TICK_HEIGHTS` | 48 … 4px |
| Settle softness (lower = softer, slower) | `SETTLE` | 11 |
| How far a release's momentum carries | `PROJECT` | 0.15s |
| When a coasting swipe hands over to the settle | `SLOW` | 3 photos/s |
| Smallest move that goes to the next photo | `INTENT` | 0.2 photo |
| Furthest the row can be pushed past an end | `EDGE_MAX` | 0.35 photo |
| Furthest a glide may carry past an end | `EDGE_BOUNCE` | 0.1 photo |
| Edge print color | `EDGE_INK` | `#f28c28` |
| Light leak frequency | `r() < 0.4` in `draw` | 40% |
| Dust count | the `70` in the dust loop | 70 |
| Grain strength | `globalAlpha = 0.5` before the grain fill | 0.5 |
| Hole bloom | `shadowBlur = 20` | 20 |

## Things to know before changing it

- Photos are cropped to fill a 2:3 window. Full-frame 35mm scans fit as is. Other ratios
  lose a little off two sides.
- Photos are drawn to a canvas, so images from another domain need CORS headers. Files
  served from the site itself are fine.
- The edge print is a plain-text approximation in amber, not a copy of real rebate markings.
- The gap beside a landscape frame comes out a few pixels wider than the others, because
  the center frame's push uses the average frame width. Known and accepted for now.
- `theme="auto"` follows the system setting. If the site has its own theme toggle, pass
  `theme` explicitly.

## On the site

- Lives at `/film-roll` (`app/film-roll/page.tsx`). `FilmRoll.tsx` is the client wrapper:
  it loads the gallery with `ssr: false` and pins `theme="light"`. Avto wants the page to be
  a lightbox, so it stays light even when the site is dark: `globals.css` swaps in the light
  tokens and `color-scheme` while the page is open, and the logo doesn't invert. The
  homepage card shows the light video in both themes to match.
- Photos live at the top level of the **private** Vercel Blob store `portfolio-film`, which
  holds nothing else (`FILM_FOLDER` in `app/film-roll/folder.ts` is empty). Other site
  assets go in separate stores. Auth prefers `BLOB_READ_WRITE_TOKEN` when set, since the
  store's OIDC access isn't enabled for Development. The page lists the store,
  keeps jpg/png/webp/avif, and sorts by filename **newest first**: higher numbers are later
  photos, so `31.jpg` opens the roll and `01.jpg` ends it. Numeric ordering, so `10` sorts
  above `9`. Avto chose this over Apple Photos' order (newest at the far end) so the first
  scroll goes forward instead of hitting the end.
  It revalidates hourly, so an upload goes live within the hour with no deploy.
- Upload with `vercel blob put <file> --access private` into the portfolio-film store.
- Visitors never get the originals. `app/film-roll/photos/[...path]/route.ts` reads the
  private blob, applies EXIF rotation, resizes with sharp to fit 1200 x 1200 and returns a
  JPEG. Photo URLs carry `?v=<upload time>`, so responses are cached forever by the CDN and
  replacing a file busts the cache. Same-origin, so no CORS. Full-res scans can be uploaded as is.
  Don't route these through the Next image optimizer: it would need a public source URL,
  which would expose the originals.
- Without `BLOB_READ_WRITE_TOKEN` (e.g. local dev before `vercel env pull`) the page
  shows the gray placeholder frames.
- The counter font reads `--font-geist-sans`, the site's next/font Geist.
- The repo's tsconfig has `noUncheckedIndexedAccess`, hence the `!` on array reads.

## Not yet verified

- Runs in the Next.js 16 dev server and production build, checked in headless Chrome at
  desktop size in light and dark.
- Not tested on a real touch device or a phone-sized screen.
- Not tested with a large roll (36 frames or more). Each frame is an 840 x 936 canvas
  texture, so memory is the thing to watch.

## Working with Avto on this

- Ask before making design calls. On his interactive pieces he wants to be asked
  questions, not handed assumptions.
- When he wants options, he asks for a numbered set from tame to wild and picks one.
- Keep changes small and say exactly what changed.
