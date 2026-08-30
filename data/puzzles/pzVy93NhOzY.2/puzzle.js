// Title: The Schizophrenic Sudoku (all circles even)
// Author: Unknown
// Video: https://www.youtube.com/watch?v=pzVy93NhOzY
// Source: https://cracking-the-cryptic.web.app/sudoku/TPHt967Npg

// Rules encoded here:
//   - Normal Sudoku: digits 1-9 once each per row, column and 3x3 box.
//   - Every grey circle contains an even digit.
// The video offers the same grid under two readings, all circles odd or all
// circles even; this script is the all-even reading. Nothing else is drawn on
// the grid, and no rule is omitted.

// Transcribed from the 20 printed digits in the grid.
const givens = [
  ['R1C5', 4], ['R1C8', 9],
  ['R2C6', 9], ['R2C9', 6],
  ['R3C3', 9], ['R3C7', 7],
  ['R4C4', 7], ['R4C8', 6],
  ['R5C1', 1], ['R5C5', 6], ['R5C9', 5],
  ['R6C2', 2], ['R6C6', 5],
  ['R7C3', 3], ['R7C7', 4],
  ['R8C1', 2], ['R8C4', 4], ['R8C8', 5],
  ['R9C2', 7], ['R9C5', 5],
];

// Transcribed from the 16 grey discs drawn in the grid.
const circles = [
  'R1C4',
  'R2C3', 'R2C5',
  'R3C2', 'R3C6',
  'R4C1', 'R4C7',
  'R5C2', 'R5C8',
  'R6C3', 'R6C9',
  'R7C4', 'R7C8',
  'R8C5', 'R8C7',
  'R9C6',
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  // Parity clue as a candidate restriction: the circled cell is 2, 4, 6 or 8.
  ...circles.map((cell) => new Given(cell, 2, 4, 6, 8)),
];
