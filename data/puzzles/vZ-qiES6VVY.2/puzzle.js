// Title: Sept. 23, 2022: Easy, Killer
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=vZ-qiES6VVY
// Source: https://tinyurl.com/3xjytfst

// Normal sudoku plus the 14 givens.
//
// Killer cages: each cage's digits sum to its stated total and cannot
// repeat within the cage (Cage enforces both). All twelve drawn cages have
// a stated total (from the `killercage` array); none are single-cell or
// no-total stubs.

const GIVENS = [
  ['R1C1', 7], ['R1C9', 9],
  ['R2C2', 9], ['R2C4', 7], ['R2C8', 8],
  ['R3C3', 6], ['R3C7', 7],
  ['R4C8', 6],
  ['R6C2', 8],
  ['R7C3', 8], ['R7C7', 9],
  ['R8C2', 6], ['R8C6', 9], ['R8C8', 7],
];
const givens = GIVENS.map(([cell, digit]) => new Given(cell, digit));

// --- Killer cages (from the drawn killer-cage clues). ----------------------
const CAGES = [
  { total: 6, cells: ['R9C7', 'R9C8', 'R9C9'] },
  { total: 3, cells: ['R1C2', 'R1C3'] },
  { total: 4, cells: ['R2C9', 'R3C9'] },
  { total: 7, cells: ['R7C1', 'R8C1', 'R9C1'] },
  { total: 10, cells: ['R4C1', 'R4C2', 'R4C3', 'R4C4'] },
  { total: 11, cells: ['R1C6', 'R2C6', 'R3C6', 'R4C6'] },
  { total: 15, cells: ['R6C5', 'R6C6', 'R6C7', 'R6C8', 'R6C9'] },
  { total: 19, cells: ['R5C4', 'R6C4', 'R7C4', 'R8C4', 'R9C4'] },
  { total: 31, cells: ['R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9'] },
  { total: 24, cells: ['R1C5', 'R2C5', 'R3C5', 'R4C5'] },
  { total: 10, cells: ['R8C5', 'R9C5'] },
  { total: 11, cells: ['R5C1', 'R5C2'] },
];
const killerCages = CAGES.map(({ total, cells }) => new Cage(total, ...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...killerCages,
];
