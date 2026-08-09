// Title: Singing in the Rain
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=4F5j2oRYgqc
// Source: https://app.crackingthecryptic.com/sudoku/djBQ6LpQng

// Normal sudoku rules apply (standard 9x9 boxes, unchanged).
// Cells joined by a black dot have a ratio of 1:2 (BlackDot). "Not all
// possible dots are shown" -- absence of a dot is not information, so no
// negative constraint is added between undotted adjacent cells.
// Identical digits cannot be a chess knight's move apart (AntiKnight).
// Neighbouring digits along the orange line have a difference of at least
// four (Whisper(4)); the line's own cells are all-different by row/column/box
// as usual, no extra rule for the line itself.

const blackDots = [
  ['R1C9', 'R2C9'],
  ['R2C6', 'R3C6'],
  ['R1C5', 'R1C6'],
  ['R5C5', 'R6C5'],
  ['R4C5', 'R5C5'],
  ['R4C3', 'R4C4'],
  ['R6C2', 'R6C3'],
  ['R2C1', 'R2C2'],
];

// Orange line waypoints, in drawn order (source lines[0].wayPoints, mapped to
// cell ids). The path revisits R6C5, so it crosses itself there; each drawn
// segment still binds only its own consecutive pair, which is what Whisper
// enforces cell-list-order, so the revisit needs no special handling.
const orangeLine = [
  'R7C8', 'R8C9', 'R9C8', 'R8C7', 'R7C6', 'R6C5', 'R5C5', 'R5C6', 'R4C6',
  'R4C7', 'R3C6', 'R4C5', 'R5C4', 'R6C3', 'R7C2', 'R8C3', 'R7C3', 'R7C4',
  'R6C4', 'R6C5',
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  new Whisper(4, ...orangeLine),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
];
