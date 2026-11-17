# Strata

An interactive three.js piece for avtogrigolia.com. A stack of nested half-sphere shells floats over a pedestal in a dark room and wobbles in a staggered loop. Visitors drag to turn the room, and an Adjust panel lets them change the form, the loop and the finish.

It is a rebuild of an old Maya scene of Avto's (`final2.0.mb`). Comments marked `(mb)` in the code are values read out of that file. Leave them unless asked. Its working name was Nested Shells.

The look is finished and approved. Do not restyle the scene.

## Files

```
components/strata/
  Strata.jsx        client component: canvas, caption, panel. This is what a page imports.
  StrataPanel.jsx   the Adjust panel. Values in, changes out.
  scene.js          the whole three.js scene. No React. createStrata(canvas) returns an API.
  config.js         defaults, fixed look values, finishes, slider ranges.
  strata.css        plain CSS, scoped under .strata, colors and fonts as --strata-* tokens.
```

The site renders it at `/strata` (`app/strata/page.tsx`): full screen, public and in the sitemap, but nothing links to it yet. The page is always black and the logo is forced white; it ignores the site's light/dark theme on purpose.

The only dependency is `three` (the repo's version, not the 0.160 it was first built on). No React Three Fiber, no drei.

## Use

```jsx
import Strata from '@/components/strata/Strata';

export default function Page() {
  return <Strata />;
}
```

Props: `panel` (default `true`), `caption` (default `true`), `className`.

The component fills its parent's width and is `100svh` tall. To change the height, set `--strata-height` on it or on a wrapper:

```css
.home-strata { --strata-height: 80svh; }
```

## Things that must stay true

- **Client only.** `Strata.jsx` is a client component and loads `scene.js` with a dynamic `import()` inside an effect, so three.js stays out of the first bundle and never runs on the server. Keep it that way. Do not import `scene.js` from a server component or at the top of a file.
- **Black background.** The scene fades to pure black at its edges. `--strata-bg` has to stay `#000` or the edge of the canvas will show. The piece is dark only; there is no light mode and none is wanted.
- **Plain CSS.** Avto uses plain CSS with tokens. Do not convert this to Tailwind or CSS Modules.
- **`strata.css` is a global stylesheet** imported from the component.
- **The panel stays minimal.** Avto cut the light and wall controls on purpose. Do not add controls, a "copy settings" button, or extra caption text. The panel starts closed on every screen size. The caption reads "Strata" over "Digital sculpture. Adjust to suit your mood."; Avto picked that line over one that kept a drag hint.
- **Spelling is "color"**, in the UI and in code.
- **One instance per page.** Each one creates its own WebGL context.

## Fitting it to the site

- **Tokens.** Every color and font in the CSS comes from the `--strata-*` custom properties at the top of `strata.css`. The colors are fixed rather than pointed at the site tokens, because the site tokens flip with the theme and this piece does not. `--strata-mono` uses Geist Mono, which the root layout loads.
- **JavaScript.** The files stay `.jsx` and `.js`, like `components/proximity-field`. The API returned by `createStrata` is small and documented with doc comments at the bottom of `scene.js`.
- **Avto plans to design his own slider UI in Figma.** `StrataPanel.jsx` is the only file that would change. It gets `params`, `onChange(key, value)`, `onFinish({ color, metal, rough })` and `onReset()`.

## How it works

- **Shell.** One geometry: a thick half-sphere band with a hole cut at the pole, built by revolving a profile (`lathe` and `shellGeometry` in `scene.js`). Every shell reuses it at a different scale, 3x down to 0.75x.
- **Loop.** Each shell tips on two axes, a cosine on X and a sine on Z, so its axis traces a cone. Each shell runs the same loop slightly later than the one outside it (`stagger`). The whole stack also spins slowly.
- **Light.** One soft key light overhead, made of seven small shadow-casting spotlights spread over a disc so shadow edges blur. A hemisphere light lifts the shadows. Two rim lights behind the piece pick out the edges.
- **Reflections.** A small hand-built environment (overhead disc, tall softboxes at the sides, a floor glow) is what the glossy finishes reflect. This is why black reads as a shape at all. Changing it changes every finish.
- **Finishes.** Black is a lacquer: a dark base under a clear coat. Every other finish is a true metal. Pale non-metal colors wash out in this room, which is why the free color picker also renders as a metal.
- **Post.** Ambient occlusion for the creases, ACES tone mapping, a little film grain and a vignette.

To change a default, edit `config.js`. `DEFAULTS` are the values a visitor can adjust. `LOOK` is the fixed lighting and wall thickness.

## Performance

This is a heavy scene: seven shadow maps, an ambient occlusion pass and 4x MSAA every frame.

- It already pauses when scrolled out of view (IntersectionObserver in `scene.js`) and when the tab is hidden.
- On touch devices it drops to four shadow lights and fewer samples (`coarse` in `scene.js`).
- Pixel ratio is capped at 2.
- It has **not** been profiled on real hardware. It was only checked as still frames in a software renderer. Test it on a laptop on battery and on a phone before shipping.
- If it stutters, cut in this order: `KEY_N` (7 to 4), shadow `mapSize` (1024 to 512), GTAO `samples` (16 to 8), then the pixel ratio cap (2 to 1.5).

## Not verified

Be straight with Avto about these rather than assuming they work:

- Frame rate on real devices (see above).
- Touch. `scene.js` sets `touch-action: pan-y` on the canvas so vertical swipes scroll the page and sideways drags turn the piece. This was not tested on a phone.
- The Gunmetal, Copper and Midnight finishes were not checked visually. Black, Chrome, Gold, Bronze and Deep red were.
- three.js versions. On 0.182 the default Black finish was checked as a still frame against the 0.160 prototype at 1440 x 900 and matches. The other finishes were not rechecked on 0.182.

## Working with Avto

- Ask before making design decisions. On these interactive pieces he wants to talk through the approach first, not see assumptions.
- Keep writing casual and direct. No em dashes.
