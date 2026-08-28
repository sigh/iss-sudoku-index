// Title: 21/12/2: Asking For A Friend
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=tT3tiN5GBvQ
// Source: https://tinyurl.com/yckpuaxx

// Normal sudoku rules apply. Green ("friendly") cells must hold a digit
// equal to their own row number, column number, or box number (at least
// one of the three; ties are fine). Boxes are numbered 1-9 in reading
// order, which is ISS's default 3x3 box layout.

// Given digits: cells and values from the payload's grid[row][col].value.
// Every given cell is also a green cell (verified against the green list
// below), so fixing its digit already satisfies the friendly rule for it;
// no separate candidate-set constraint is added for these nine.
const givens = [
  new Given('R2C6', 2),
  new Given('R2C7', 3),
  new Given('R3C3', 1),
  new Given('R4C6', 5),
  new Given('R4C8', 6),
  new Given('R5C3', 4),
  new Given('R8C1', 7),
  new Given('R8C6', 8),
  new Given('R8C7', 9),
];

// Green (friendly) cells with no given digit: cells from the payload's
// grid[row][col].c === "#B0FFB0" shading, excluding the nine given above.
// Each is restricted to the set {row, col, box} (deduplicated), which is
// exactly the "matches row-, column-, or box-number" rule.
const friendlyCells = [
  'R1C8',
  'R2C8', 'R2C9',
  'R3C4', 'R3C5',
  'R4C3', 'R4C7', 'R4C9',
  'R5C7',
  'R6C1',
  'R7C1', 'R7C2', 'R7C5', 'R7C6',
  'R8C5',
  'R9C1',
];

const friendlyRestrictions = friendlyCells.map((cell) => {
  const { row, col } = parseCellId(cell);
  const box = 3 * Math.floor((row - 1) / 3) + Math.floor((col - 1) / 3) + 1;
  const candidates = [...new Set([row, col, box])];
  return new Given(cell, ...candidates);
});

return [
  new Shape('9x9'),

  ...givens,
  ...friendlyRestrictions,
];
