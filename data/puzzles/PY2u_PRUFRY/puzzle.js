// Title: Cryptic Triptych
// Author: EliasKar
// Video: https://www.youtube.com/watch?v=PY2u_PRUFRY
// Source: https://test.crackingthecryptic.com/sudoku/694789h9m3

// Rules (from the video's description text; the payload itself carries no
// rules text):
//  - Normal sudoku rules apply (default Shape all-different rows/cols/boxes).
//  - Digits increase along each thermometer from its bulb to its end(s).
//  - One colour of dot (red or green) means a 1:2 ratio, the other means
//    consecutive digits, but which is which is not stated -- the solver must
//    discover it. The assignment is one global choice shared by every dot of
//    that colour, not decided per dot, so this is a single Or of two And
//    branches rather than a per-dot disjunction.
//  - "Not all dots are given" rules out the usual Kropki exhaustiveness
//    clause (StrictKropki): an undotted adjacent pair carries no information.
// The three-colour background panelling (red/blue/green thirds) is purely
// decorative -- matches the "Triptych" title, names no rule, and is omitted.

// Thermometers: two of the four are Y-shaped (one bulb, two increasing arms),
// each arm encoded as its own Thermo sharing the bulb (and, for one pair,
// the far end) cell -- this is exactly the six stroke entries the payload
// draws, in bulb-first order (one of the six is drawn tip-first in the
// payload and is reversed here to put the bulb first).
const thermos = [
  new Thermo('R1C1', 'R1C2', 'R1C3'),
  new Thermo('R1C9', 'R1C8', 'R1C7'),
  new Thermo('R5C5', 'R4C4', 'R3C4', 'R2C4', 'R1C5'),
  new Thermo('R5C5', 'R4C6', 'R3C6', 'R2C6', 'R1C5'),
  new Thermo('R9C5', 'R8C4', 'R7C4', 'R6C4', 'R5C4'),
  new Thermo('R9C5', 'R8C6', 'R7C6', 'R6C6', 'R5C6'),
];

// Dot edges, transcribed from the payload's overlay list (fill colour is the
// dot's drawn colour; rounded edge-sized overlays, one per dot).
const redDots = [
  ['R2C2', 'R2C3'],
  ['R3C2', 'R3C3'],
  ['R4C1', 'R4C2'],
  ['R7C3', 'R7C4'],
  ['R8C1', 'R9C1'],
  ['R9C1', 'R9C2'],
];
const greenDots = [
  ['R7C6', 'R7C7'],
  ['R9C8', 'R9C9'],
  ['R8C9', 'R9C9'],
  ['R2C7', 'R2C8'],
  ['R3C7', 'R3C8'],
  ['R4C8', 'R4C9'],
  ['R4C7', 'R4C8'],
];

// Red = black (2:1 ratio), green = white (consecutive), or vice versa: one
// global reading shared by every dot, so this is an Or of two And branches
// (each branch rebuilding every dot under that reading) rather than a
// per-dot Or -- a per-dot disjunction would let different dots of the same
// colour disagree, which the rules forbid.
const redBlackReading = new And([
  ...redDots.map(([a, b]) => new BlackDot(a, b)),
  ...greenDots.map(([a, b]) => new WhiteDot(a, b)),
]);
const redWhiteReading = new And([
  ...redDots.map(([a, b]) => new WhiteDot(a, b)),
  ...greenDots.map(([a, b]) => new BlackDot(a, b)),
]);

return [
  new Shape('9x9'),
  ...thermos,
  new Or([redBlackReading, redWhiteReading]),
];
