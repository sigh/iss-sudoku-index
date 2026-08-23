// Title: The Witness
// Author: Sktx
// Video: https://www.youtube.com/watch?v=g_6-8khph-0
// Source: https://app.crackingthecryptic.com/sudoku/DrDLbHmj6h

// Normal sudoku, no givens. A single 43-cell grey stroke carries five large
// circle bulb markers (R7C4, R2C2, R2C6, R3C8, R9C9); the drawn stroke has
// no other end-of-thermo marker. "Digits increase from the bulb to the tip,
// but where the thermo tips are must be determined" reads as: the bulbs are
// given, the tip of each bulb's run is not, so the stroke is cut into five
// pieces at the bulb cells. One piece (R7C4..R9C1) has only one bulb, so it
// is a plain increasing Thermo. The other four pieces each have a bulb at
// both ends, so each is a strict rise from its left bulb to an unmarked,
// solver-determined turning point, then a strict fall into its right bulb
// -- a "hill" shape, encoded below with a small adjacent-pair NFA.

// Hill NFA: phase 'rise' allows an increase or a single switch to 'fall' on
// a decrease; phase 'fall' allows only further decreases. Accepting only in
// phase 'fall' forces at least one rise-to-fall switch, so the final cell
// (the right bulb) is always reached by a strict decrease, as its own
// bulb-ness requires; ties are rejected outright since every step of a
// thermometer is strict.
const hillSpec = NFA.encodeSpec({
  startState: { phase: 'rise', prev: null },
  transition: ({ phase, prev }, value) => {
    if (prev === null) return { phase, prev: value };
    if (phase === 'rise') {
      if (value > prev) return { phase: 'rise', prev: value };
      if (value < prev) return { phase: 'fall', prev: value };
      return undefined;
    }
    // phase === 'fall'
    return value < prev ? { phase: 'fall', prev: value } : undefined;
  },
  accept: ({ phase }) => phase === 'fall',
}, 9);

const hills = [
  ['R7C4', 'R6C4', 'R6C3', 'R6C2', 'R6C1', 'R5C1', 'R5C2', 'R4C2', 'R3C2', 'R2C2'],
  ['R2C2', 'R1C2', 'R1C3', 'R2C3', 'R3C3', 'R3C4', 'R2C4', 'R2C5', 'R2C6'],
  ['R2C6', 'R3C6', 'R3C7', 'R2C7', 'R1C7', 'R1C8', 'R2C8', 'R3C8'],
  ['R3C8', 'R4C8', 'R5C8', 'R5C9', 'R6C9', 'R6C8', 'R6C7', 'R6C6', 'R7C6',
    'R8C6', 'R8C7', 'R9C7', 'R9C8', 'R9C9'],
];

const whiteDots = [
  ['R1C3', 'R1C4'],
  ['R6C9', 'R7C9'],
  ['R7C8', 'R8C8'],
  ['R7C7', 'R8C7'],
  ['R6C2', 'R7C2'],
];

const blackDots = [
  ['R3C4', 'R4C4'],
  ['R4C4', 'R4C5'],
  ['R5C5', 'R5C6'],
  ['R4C7', 'R5C7'],
];

return [
  new Shape('9x9'),

  // Single-bulb piece: forced increasing from the bulb R7C4 to the plain
  // stroke end R9C1.
  new Thermo('R7C4', 'R8C4', 'R8C3', 'R9C3', 'R9C2', 'R9C1'),

  // Two-bulb pieces: rise from the left bulb to an undetermined turn, then
  // fall into the right bulb.
  ...hills.map((cells, i) => new NFA(hillSpec, `hill${i}`, cells)),

  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
