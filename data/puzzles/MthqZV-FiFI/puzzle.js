// Title: Bubbling Entropic Whirlpool
// Author: FractalJim
// Video: https://www.youtube.com/watch?v=MthqZV-FiFI
// Source: https://sudokupad.app/pd3iu03kvk

// Normal sudoku (rows/cols/boxes default). Entropic lines: every run of 3
// consecutive cells on a line has one low (1-3), one mid (4-6) and one high
// (7-9) digit. Circles: the digit placed in a circle states how many times
// that same digit appears across all circled cells (one shared count over
// the whole set, not per line) -- `CountingCircles` implements exactly this.
// Kropki: black dot = one cell double the other, white dot = consecutive;
// the rules say not every dot is drawn, so these are positive-only clues
// (no inferred absence elsewhere) -- plain BlackDot/WhiteDot, not the
// exhaustive-dot StrictKropki.

// Entropic line cell paths, transcribed from the source's entropic-line
// clue data (its render layer draws the same 9 paths).
const entropicLines = [
  ['R5C5', 'R6C5', 'R6C4', 'R5C4', 'R4C4', 'R4C5', 'R4C6', 'R5C6', 'R6C6',
   'R7C6', 'R7C5', 'R7C4', 'R7C3', 'R6C3', 'R5C3', 'R4C3', 'R3C3', 'R3C4',
   'R3C5', 'R3C6', 'R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7'],
  ['R9C8', 'R9C9', 'R8C9', 'R7C9', 'R7C8', 'R8C8'],
  ['R1C8', 'R1C9', 'R2C9', 'R3C9', 'R3C8', 'R2C8'],
  ['R1C2', 'R1C1', 'R2C1', 'R3C1', 'R3C2', 'R2C2'],
  ['R2C4', 'R1C5', 'R1C6'],
  ['R4C8', 'R5C9', 'R6C9'],
  ['R8C6', 'R9C5', 'R9C4'],
  ['R6C1', 'R5C1', 'R4C2'],
  ['R7C2', 'R8C1', 'R8C2', 'R8C3', 'R9C2'],
];

// Circled cells, transcribed from the source's circle clue data (23 cells,
// no per-cell digit is stored -- the clue is purely the self-referential rule).
const circleCells = [
  'R1C1', 'R1C5',
  'R2C1', 'R2C9',
  'R3C2', 'R3C5', 'R3C6', 'R3C8',
  'R4C2', 'R4C3', 'R4C6',
  'R5C1', 'R5C4', 'R5C5', 'R5C9',
  'R6C3', 'R6C5',
  'R7C4', 'R7C6', 'R7C9',
  'R8C3',
  'R9C7', 'R9C8',
];

// Black-dot (ratio, double) pairs, transcribed from the source's dot clue data.
const blackDotPairs = [
  ['R3C2', 'R4C2'],
  ['R6C6', 'R6C5'],
  ['R1C5', 'R1C6'],
  ['R4C6', 'R4C7'],
  ['R9C4', 'R9C3'],
  ['R2C4', 'R2C3'],
];

// White-dot (consecutive) pairs, transcribed from the source's dot clue data.
const whiteDotPairs = [
  ['R8C5', 'R9C5'],
  ['R1C7', 'R2C7'],
];

return [
  new Shape('9x9'),

  ...entropicLines.map(cells => new Entropic(...cells)),

  new CountingCircles(...circleCells),

  ...blackDotPairs.map(([a, b]) => new BlackDot(a, b)),
  ...whiteDotPairs.map(([a, b]) => new WhiteDot(a, b)),
];
