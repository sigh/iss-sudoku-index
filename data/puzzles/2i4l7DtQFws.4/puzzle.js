// Title: Hourglass
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=2i4l7DtQFws
// Source: https://app.crackingthecryptic.com/sudoku/rHF7grr29B

// Normal sudoku rules (default rows/cols/boxes). Circles mark odd digits;
// squares mark even digits, per the rules text. Encoded as a candidate
// restriction on each marked cell (there is no dedicated Odd/Even class).

// Given digits, transcribed from the payload's `cells` values.
const givens = [
  ['R1C2', 1], ['R1C3', 2], ['R1C4', 3], ['R1C7', 4], ['R1C8', 5],
  ['R2C8', 6],
  ['R3C7', 7],
  ['R4C5', 8],
  ['R5C3', 9], ['R5C7', 1],
  ['R6C5', 2],
  ['R7C3', 3],
  ['R8C2', 4],
  ['R9C2', 5], ['R9C3', 6], ['R9C6', 7], ['R9C7', 8], ['R9C8', 9],
];

// Circle overlays (`rounded: true` in the payload) -> odd-digit cells.
const oddCells = ['R1C5', 'R3C3', 'R3C5', 'R5C5', 'R7C5', 'R7C7', 'R9C5'];

// Square overlays (`rounded: false` in the payload) -> even-digit cells.
const evenCells = ['R2C2', 'R2C6', 'R8C4', 'R8C8'];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...oddCells.map((cell) => new Given(cell, 1, 3, 5, 7, 9)),
  ...evenCells.map((cell) => new Given(cell, 2, 4, 6, 8)),
];
