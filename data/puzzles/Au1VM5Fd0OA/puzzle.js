// Title: Boundary Value Problem
// Author: clover!
// Video: https://www.youtube.com/watch?v=Au1VM5Fd0OA
// Source: https://tinyurl.com/793svn8v

// Normal sudoku rules apply. Cells separated by a white dot must contain
// consecutive digits. "Not all dots are necessarily given" -- so the drawn
// dots are the only consecutive constraints; no negative (StrictKropki)
// reading is encoded for the undrawn edges.

const givens = [
  ['R1C4', 8],
  ['R1C6', 9],
  ['R2C3', 1],
  ['R2C7', 2],
  ['R3C8', 9],
  ['R4C9', 1],
  ['R6C9', 2],
  ['R7C1', 3],
  ['R7C8', 8],
  ['R9C1', 4],
  ['R9C3', 7],
].map(([cell, value]) => new Given(cell, value));

// Drawn white dots (14 total).
const whiteDots = [
  ['R3C4', 'R3C5'],
  ['R3C5', 'R3C6'],
  ['R1C1', 'R1C2'],
  ['R1C2', 'R1C3'],
  ['R1C9', 'R2C9'],
  ['R2C9', 'R3C9'],
  ['R4C7', 'R5C7'],
  ['R5C7', 'R6C7'],
  ['R4C4', 'R5C4'],
  ['R5C4', 'R6C4'],
  ['R6C4', 'R6C5'],
  ['R6C5', 'R6C6'],
  ['R8C5', 'R9C5'],
  ['R5C1', 'R5C2'],
].map(cells => new WhiteDot(...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...whiteDots,
];
