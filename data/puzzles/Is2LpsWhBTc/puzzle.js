// Title: EXit Strategy
// Author: Riffclown
// Video: https://www.youtube.com/watch?v=Is2LpsWhBTc
// Source: https://app.crackingthecryptic.com/sudoku/PQh7M7fFtt
//
// Normal sudoku rules apply (default row/column/box all-different, standard
// 3x3 boxes). Twelve killer cages: digits in a cage may not repeat and must
// sum to the printed total. Digits may not repeat along either of the two
// marked diagonals.

const givens = [
  ["R3C5", 6],
  ["R5C3", 8],
  ["R5C7", 5],
  ["R7C5", 8],
];

// Killer cages, [sum, ...cells], top-left cell of each printed on the grid.
const cages = [
  [9, "R2C2", "R2C3", "R3C2"],
  [9, "R7C8", "R8C7", "R8C8"],
  [20, "R6C6", "R6C7", "R6C8", "R7C6", "R8C6"],
  [20, "R2C4", "R3C4", "R4C2", "R4C3", "R4C4"],
  [6, "R6C3", "R6C4", "R7C4"],
  [6, "R3C6", "R4C6", "R4C7"],
  [20, "R1C7", "R1C8", "R1C9", "R2C9", "R3C9"],
  [20, "R7C1", "R8C1", "R9C1", "R9C2", "R9C3"],
  [6, "R8C5", "R9C5"],
  [7, "R1C5", "R2C5"],
  [10, "R5C1", "R5C2"],
  [10, "R5C8", "R5C9"],
];

return [
  new Shape("9x9"),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(cage => new Cage(...cage)),
  // Anti-diagonal (top-right to bottom-left): R1C9..R9C1.
  new Diagonal(1),
  // Main diagonal (top-left to bottom-right): R1C1..R9C9.
  new Diagonal(-1),
];
