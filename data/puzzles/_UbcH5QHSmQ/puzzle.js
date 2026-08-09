// Title: Two Given Digits
// Author: DipakR
// Video: https://www.youtube.com/watch?v=_UbcH5QHSmQ
// Source: https://app.crackingthecryptic.com/sudoku/bGfJrMGPtR

// Normal sudoku rules apply. Cells separated by an X sum to 10, cells
// separated by a V sum to 5; not every valid X/V pair is marked, so absent
// marks carry no information (plain X/V, not the exhaustively-marked
// negative variant). Digits along an arrow sum to the circled value. The
// diagonal running R1C1-R9C9 has no repeated digits.

// Arrow paths transcribed bulb-first (circled sum cell first, then the arm)
// from the six grey circle overlays and their attached waypoint strokes.
const arrows = [
  ['R4C7', 'R4C8', 'R5C8'],
  ['R5C9', 'R6C9', 'R5C8'],
  ['R6C5', 'R6C4', 'R5C4', 'R4C4'],
  ['R7C3', 'R8C3', 'R8C2', 'R9C2'],
  ['R7C1', 'R7C2', 'R8C1'],
  ['R8C8', 'R9C7', 'R9C6'],
];

// V (sum-to-5) edge marks, transcribed from the small "V" overlays.
const vPairs = [
  ['R1C1', 'R1C2'],
  ['R1C5', 'R1C6'],
  ['R3C5', 'R3C6'],
  ['R2C7', 'R2C8'],
  ['R2C9', 'R3C9'],
  ['R5C7', 'R5C8'],
  ['R4C4', 'R5C4'],
  ['R6C4', 'R7C4'],
  ['R7C4', 'R7C5'],
  ['R9C2', 'R9C3'],
  ['R9C7', 'R9C8'],
];

// X (sum-to-10) edge marks, transcribed from the small "X" overlays.
const xPairs = [
  ['R8C8', 'R9C8'],
  ['R7C9', 'R8C9'],
  ['R5C8', 'R6C8'],
  ['R1C9', 'R2C9'],
  ['R2C2', 'R3C2'],
  ['R2C3', 'R3C3'],
  ['R3C3', 'R3C4'],
  ['R4C2', 'R5C2'],
  ['R6C2', 'R6C3'],
  ['R8C4', 'R8C5'],
];

return [
  new Shape('9x9'),
  new Given('R2C1', 6),
  new Given('R8C7', 5),
  new Diagonal(-1),
  ...arrows.map(cells => new Arrow(...cells)),
  ...vPairs.map(cells => new V(...cells)),
  ...xPairs.map(cells => new X(...cells)),
];
