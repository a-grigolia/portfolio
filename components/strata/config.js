// Everything a designer might want to change lives here, not in scene.js.
// Numbers marked (mb) were read straight out of the original Maya file, final2.0.mb.

/** What a visitor can change in the Adjust panel, and where each value starts. */
export const DEFAULTS = {
  shells: 12,     // the Maya file has 16; 12 reads cleaner at portfolio size
  cut: 36,        // (mb) three rows of faces deleted at the pole = 36 degrees
  tilt: 30,       // (mb) rotateX / rotateZ keys swing +-30 degrees
  stagger: 0.6,   // phase offset across the stack, in turns
  loop: 4,        // (mb) 96 frames at 24fps
  spin: 7.5,      // (mb) 180 degrees per 96 frames = 7.5 rev/min
  drift: true,    // play the loop. Starts false for visitors who prefer reduced motion
  color: '#121216', metal: 0, rough: 0.38,   // black lacquer
};

/** The fixed look. Not in the panel on purpose. */
export const LOOK = {
  wall: 0.05,     // shell thickness on a unit sphere. Under 0.052 the shells nest without cutting into each other
  angle: 0,       // key light, degrees around the piece (0 = toward the camera)
  height: 76,     // key light elevation: nearly overhead
  key: 1,         // key light strength
  soft: 3.2,      // size of the key light: bigger = softer shadow edges
  fill: 0.8,      // how far the shadows are lifted off black
  ao: 0.85,       // contact shading in the creases
};

export const MAX_SHELLS = 28;

/**
 * Finishes for the color row. Metals have no flat surface color of their own: everything
 * you see is tinted reflection, which is why they hold up in this dark room where a pale
 * paint would wash out. Black is the exception: a lacquer, not a metal.
 */
export const FINISHES = [
  { name: 'Black', color: '#121216', metal: 0, rough: 0.38 },
  { name: 'Gunmetal', color: '#474b55', metal: 1, rough: 0.24 },
  { name: 'Chrome', color: '#eceef2', metal: 1, rough: 0.07 },
  { name: 'Gold', color: '#e2b04a', metal: 1, rough: 0.18 },
  { name: 'Copper', color: '#c9764e', metal: 1, rough: 0.2 },
  { name: 'Bronze', color: '#8a5a2c', metal: 1, rough: 0.3 },
  { name: 'Deep red', color: '#7d0d14', metal: 1, rough: 0.22 },
  { name: 'Midnight', color: '#12205a', metal: 1, rough: 0.22 },
];

/** A color from the free picker is rendered as a metal with this polish. */
export const CUSTOM_FINISH = { metal: 1, rough: 0.2 };

/** Sliders in the Adjust panel, grouped. */
export const CONTROLS = [
  { group: 'Form', items: [
    { key: 'shells', label: 'Shells', min: 4, max: MAX_SHELLS, step: 1, unit: '' },
    { key: 'cut', label: 'Cut-out', min: 0, max: 80, step: 1, unit: '°' },
  ] },
  { group: 'Loop', items: [
    { key: 'tilt', label: 'Tilt', min: 0, max: 60, step: 1, unit: '°' },
    { key: 'stagger', label: 'Stagger', min: 0, max: 2, step: 0.01, unit: ' turns' },
    { key: 'loop', label: 'Loop', min: 1, max: 12, step: 0.1, unit: ' s' },
    { key: 'spin', label: 'Spin', min: 0, max: 20, step: 0.5, unit: ' rpm' },
  ] },
];
