// Title: Mousetrap?
// Author: Tallcat
// Video: https://www.youtube.com/watch?v=8HMKBbVQJHs
// Source: https://sudokupad.app/06vt5y9nwu

// Normal sudoku rules apply.
//
// Omitted: Mus's and Felix's solver-discovered, self-avoiding maze paths
// (walls, diagonal 2x2 moves, round wall-spots, one-way arrow doors, the
// even-digit crossing rule) and each path's PATH CONSTRAINTS (per-box
// thermometer for Mus, alternating parity for Felix). Only the two static
// digit-pair clues below are path-independent and are encoded.

// BLACKCURRANTS: 1:2 ratio. Drawn as black edge dots.
const blackcurrants = [
  ['R6C3', 'R7C3'],
  ['R6C9', 'R7C9'],
  ['R5C9', 'R6C9'],
  ['R5C4', 'R5C5'],
];

// GRAPES. Drawn as limegreen edge dots.
const grapes = [
  ['R1C1', 'R1C2'],
  ['R7C5', 'R8C5'],
  ['R4C7', 'R5C7'],
];

return [
  new Shape('9x9'),
  ...blackcurrants.map(([a, b]) => new BlackDot(a, b)),
  ...grapes.map(([a, b]) => new Whisper(5, a, b)),
];
