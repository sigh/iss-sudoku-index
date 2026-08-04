// Title: Doppel
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=WlxWJ3pPtLY
// Source: https://tinyurl.com/3efj5ash

// Normal sudoku rules apply (default row/column/box all-different).
// Purple lines: cells along the line hold a set of consecutive,
// non-repeating digits in any order -- a Renban line.

// Givens transcribed from the drawn grid.
const givens = [
  new Given('R1C3', 6), new Given('R1C4', 7),
  new Given('R2C1', 2), new Given('R2C2', 4), new Given('R2C5', 5),
  new Given('R3C1', 1), new Given('R3C6', 8),
  new Given('R4C1', 6), new Given('R4C6', 3), new Given('R4C7', 9),
  new Given('R5C2', 7), new Given('R5C5', 1), new Given('R5C8', 4),
  new Given('R6C4', 2), new Given('R6C9', 6),
  new Given('R7C4', 8), new Given('R7C9', 2),
  new Given('R8C5', 6), new Given('R8C8', 3),
  new Given('R9C6', 2), new Given('R9C7', 5),
];

// Purple (Renban) lines, transcribed from the drawn line geometry.
const renbanLines = [
  ['R3C2', 'R3C3', 'R2C3'],
  ['R2C4', 'R3C4', 'R3C5'],
  ['R4C2', 'R4C3', 'R5C3'],
  ['R5C4', 'R4C4', 'R4C5'],
  ['R7C5', 'R7C6', 'R8C6'],
  ['R6C5', 'R6C6', 'R5C6'],
  ['R5C7', 'R6C7', 'R6C8'],
  ['R7C8', 'R7C7', 'R8C7'],
].map(cells => new Renban(...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...renbanLines,
];
