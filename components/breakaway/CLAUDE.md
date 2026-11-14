# Breakaway (pixel-art soccer game)

An isometric pixel-art soccer mini game for Avto's portfolio (avtogrigolia.com, Next.js). Final third only: a striker against the keeper, plus a free kick mode. It keeps a streak, and gets harder as the streak grows.

Keep this file next to `SoccerBreakaway.tsx`. If the repo already has a root `CLAUDE.md`, leave this one in the component's folder so it only applies when working on the game.

## Files

- `SoccerBreakaway.tsx`: the whole game. One client component, no dependencies, no image assets. This is the source of truth.
- The site renders it at `/breakaway` (`app/breakaway/page.tsx`). The old standalone `preview.html` was removed; test on that page instead.

## Using it

```tsx
import SoccerBreakaway from './SoccerBreakaway';

<SoccerBreakaway />                      // fills its container, max 984px wide
<SoccerBreakaway className="..." style={{ maxWidth: 720 }} />
```

- The file starts with `'use client'`. It can be imported from a server component.
- The component renders one wrapper `div`. `mount(root)` builds the canvas and the touch controls inside it and returns a cleanup function. React does not manage those children, so do not render children into the wrapper.
- Text is drawn in the wrapper's computed `font-family` and `color`. The wrapper asks for `var(--font-geist-mono), "Geist Mono", ui-monospace, ...`. If the site exposes Geist Mono under a different variable or family name, change that one line in the component or pass `style={{ fontFamily: ... }}`.
- The background is transparent. The scene is a floating island, so it sits on any page colour.
- Best streaks are saved in `localStorage` under `breakaway-best` and `breakaway-best-fk`. All storage access is wrapped in try/catch.
- Keyboard input only works while the canvas has focus (click it first). This is on purpose so the game never hijacks page scrolling.
- The loop pauses while the canvas is off screen (IntersectionObserver).

## Design rules Avto set

These came from him directly. Do not change them without asking.

- Style reference is a gritty isometric pixel-art basketball court: dithered texture, ragged island edges, small chunky players. The pitch itself is clean striped stadium grass.
- Floating island on a transparent background. Only the final third, never the full pitch.
- Goal and penalty box are about 10% larger than the first version. He asked for "not too much".
- In-canvas text is Geist Mono, drawn crisp at full resolution, in sentence case ("Click to start", "Off the post"). Never all caps. No stylized or pixel fonts for text. Two exceptions stay pixel art: the scoreboard, and the gold GOAL lettering.
- Scoring shows no text. A chunky gold pixel GOAL bounces in over the middle of the pitch, letter by letter, with a shine sweep. The old "Goal" and "Sweet strike" text was removed on purpose.
- The 5th goal sets the goal on fire, and it stays lit until a miss. Between goals it sits at low embers along the crossbar. Every goal while lit makes it flare up again: goals 6 to 9 get a normal burst of about 1.5 seconds, and every 5th goal gets a really big one (1.5x taller, flames down both posts, more sparks, about 2.4 seconds). Colours change on the 5th goals: orange (5), green (10), blue (15), purple (20), then back to orange (25). Four colours only.
- Desktop: WASD (arrows also work) to move. The cursor only aims and is a small target icon. There is no space-to-shoot; he found it clunky in isometric.
- Shooting: hold to charge one bar, release to shoot. The bar sets both pace and height. Too much power skies it over the bar. A dotted preview line shows the path before release.
- Curl on desktop: dragging sideways while holding bends the ball that way (drag right, the ball bows left and finishes moving right). No vertical drag.
- The curl also nudges the landing spot the way the ball finishes, by an eighth of the goal width at full drag. Half the goal was tried and rejected: it read as moving the target, not curving the ball. A grey ghost marker stays on the original aim so the bend reads as a bend.
- Mobile: joystick circle bottom left, shoot button bottom right. Hold the button to charge. The slide is measured along the goal line (up-left is the far post, down-right the near post, flat left or right works but weaker).
- Curl on mobile is the opposite of desktop, on purpose: the ball swings out toward the side you slide and cuts back. Slide left and it bows out left, then comes back right. The eighth-of-the-goal nudge follows the finish, so it goes right in that case.
- Mobile aim comes from the joystick. In a breakaway the shot starts along the direction the striker is running, steered inside the posts. In a free kick the joystick slides an aim marker along the goal line. Avto likes this.
- One miss ends the streak.
- Two modes as tabs: Breakaway (every fourth round is a free kick) and Free kicks (free kicks only, own streak and best).
- No "toggle background" or other debug UI in what ships.
- Player movement was slowed 15% from the first version (striker speed 47.6).

## How Avto likes to work on this

- Ask questions before building. Do not make assumptions on mechanics, look, or scope.
- Workshop mechanics with him first when he says so, and give one direct recommendation when he asks for an opinion.
- Casual, direct writing. No em dashes. No overclaiming: say what was tested and what was not.

## How the code is laid out

Top to bottom in `SoccerBreakaway.tsx`:

1. **Constants.** Logical canvas is 328 x 180 (`LW`, `LH`). The field is 160 x 112 world units (`FW`, `FD`). Goal runs `GL` 58 to `GR` 102 on the goal line, `GH` 19 high, `GDEP` 9 deep.
2. **Colours and kits.** `C` palette and three `Kit` objects. Colours are stored as ABGR uint32 via `col(0xRRGGBB)`.
3. **Helpers.** `put` (set a pixel), `mix` (blend, used for shadows), `line3`, `netPlane`, a 3x5 pixel font used only by the scoreboard.
4. **Background.** `buildBackground()` runs once: grass, stripes, pitch lines, ragged edge, soil slab.
5. **Sprites.** `drawPlayer`, `drawDive`, `drawBall`, `drawFlag`, goal back and front, scoreboard.
6. **Goal lettering and fire.** `drawGoalText`, `drawFire`, `drawPostFire`.
7. **Difficulty.** `params(streak)`.
8. **Shot shaping.** `shotFromPower`, `makeArc`, `arcAt`, `arcToLine`, `flightTime`.
9. **Engine.** `createEngine()`: all game state and rules, no DOM. Exposes `step`, `render`, `press`, `release`, `setCurl`, `setTouch`, `setKeys`, `setStick`, `setMode`, `hud`.
10. **Mount.** `mount(root)`: canvas, touch controls, input, resize, HUD text, the frame loop.
11. **Component.** A thin wrapper that calls `mount` in an effect.

### Coordinates

- World `x` runs along the goal line, `y` runs away from the goal (goal line is `y = 0`), `z` is height.
- Projection: `screenX = OX + x - y`, `screenY = OY + (x + y) / 2 - z`. The goal sits on the upper right edge of the island.
- Draw order is by `x + y`. The goal is drawn in two layers so a ball in the net sits behind the front netting.

### Rendering

- Everything in the scene is written pixel by pixel into a `Uint32Array` (328 x 180), then scaled up with nearest neighbour onto the visible canvas at an integer multiple of the device resolution. Do not use canvas drawing calls for scene art; add pixels with `put` and `mix`.
- HUD text (tabs, miss messages, hints) is the only thing drawn with `ctx.fillText`, on top, at full resolution.
- The gold GOAL lettering, the fire, the kick poses and the sparks are all pixel art in the buffer.
- The power bar, preview line and aim marker are pixel art in the buffer.

## Game rules

- **Breakaway round:** striker starts deep with the ball. The keeper narrows the angle, then rushes when you get close or stall. Defenders start goal side and try to cut you off. Touching the keeper or a defender with the ball loses it.
- **Free kick round:** dead ball from a random spot outside the box. A wall guards the near post, the keeper takes the far side. Nobody moves until the ball is struck.
- **Power bar zones** (`shotFromPower`): below 0.35 is a soft roller. 0.35 up to the sweet spot is a driven shot that gets faster and a little higher. The sweet spot starts at 0.76 (`SWEET_LO`). Past it is an overhit that goes over the bar. A full bar fires on its own as an overhit.
- **Sweet strike:** rises early and dips, so it clears a wall and comes down under the bar. A keeper at full stretch covers less height, so it beats him in the corners but not when hit near him.
- **Curl:** the path is a circular arc that ends on the target. Full curl is 0.6 radians off the straight line at the start, and it nudges the target `AIM_SHIFT` (an eighth of the goal width) along the goal line in the direction the ball finishes. Positive curl bends toward the near post. The mouse drag passes its direction straight through; the touch slide passes it negated. The keeper only reads 60% of the curl.
- **Aim modes** (`aimMode` in the engine): `point` is a mouse click, `facing` is along the striker's run (touch, breakaway), `marker` is the free kick aim marker (touch, free kick).
- **Kick animation:** the striker draws a leg back while charging (when standing still), swings through on release, and holds a follow-through. A sweet strike adds a gold burst off the boot, a short gold trail on the ball, and arms thrown up. It is all in the `Pose` argument to `drawPlayer`, `kickT` in the engine, and the particle pushes in `shoot` and `sub`. Avto asked for this to stay simple.
- **Goal lettering:** `drawGoalText`, with the 5x7 glyphs in `BIG` and colours in `GOLD`. Drawn last in `render` while the state is `goal`.
- **Fire:** `drawFire` (crossbar), `drawPostFire` (posts, big burst only) and the `FIRE` colour ramps. In the engine, `fireBurst` is the seconds of burst left and `fireBig` marks the tier goals; both are set in `goal()`. `render` works out the tier from the streak and draws embers whenever the streak is 5 or more.
- **Outcomes:** a goal, or one of Saved, Blocked, Tackled, Smothered, Wide, Over the bar, Off the post, Off the bar, No goal.

## Tuning

Almost everything is in `params(streak)`. Values ramp over the first 12 goals, then hold.

| Knob | Start | At 12+ | What it does |
| --- | --- | --- | --- |
| `react` | 0.28s | 0.10s | Keeper reaction time (randomised by 25% each shot) |
| `diveSp` / `diveMax` | 85 / 11 | 130 / 19 | Dive speed and reach |
| `offLine` | 5 | 17 | How far he comes out to narrow the angle |
| `rushR` / `rushSp` | 26 / 31 | 40 / 41 | When and how fast he charges the ball |
| `stall` | 8s | 5s | He charges anyway after this long |
| `defN` | 0 | 3 | Defenders: one at streak 2, two at 6, three at 11 |
| `defSp` | 52% | 70% | Defender speed as a share of the striker's |
| `spread` | 8 | 62 | How wide the start spot can be |
| `sweetW` | 0.13 | 0.075 | Width of the sweet spot on the bar |
| `chargeT` | 1.15s | 0.9s | Time for the bar to fill |
| `wallN` | 2 | 4 | Wall size: three at streak 3, four at 8 |

Other knobs: `STRIKER_SPEED`, pace and height per zone in `shotFromPower`, the free kick cadence (`streak % 4 === 3` in `newRound`), curl strength (`curl * 0.6` in `makeArc`), how far the drag moves the landing spot (`AIM_SHIFT`), mouse drag distance for full curl (45 logical pixels in `onPointerMove`), thumb slide distance (70 CSS pixels in `btnDrag`), free kick marker speed (34 units per second in `playStep`).

## What has and has not been tested

- Typechecks under `tsc --strict`.
- Ran in headless Chrome at desktop size and a 390px touch viewport with no console errors: start, move, charge, curl, score, switch tabs, joystick and shoot button.
- Difficulty was tuned with scripted bots, not by a person playing. Expect to adjust it after real play.
- Known soft spot: a perfectly timed sweet strike to a corner scores at every level in bot runs. The only thing that gets harder for it is the timing window. If long streaks feel too easy, let the keeper reach some high shots at high streaks.
- Geist Mono rendering was not verified. The test browser could not load the web font and showed the fallback.
- The kick animation, GOAL lettering and fire were checked as still frames, not watched in motion at full speed.
- Not tested on a real phone or in Safari.

## Rules for changes

- Keep it one file with no dependencies and no image assets.
- Keep game logic inside `createEngine` free of DOM access so it can be run headlessly.
- New scene art goes through the pixel buffer. New text goes through the HUD in the page font.
- If the logical size, origin or field constants change, check the HUD text still clears the island (top left and bottom left corners are the only empty areas). Below 520px wide the tabs stack and messages move to the bottom left corner.
- Ask Avto before changing anything under "Design rules Avto set".
