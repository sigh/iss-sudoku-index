// Title: Feb. 16, 2022: B1G3 Diagonal
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=lDlym71OqIg
// Source: https://tinyurl.com/2r7wkc56

// Standard 6x6 sudoku: 1-6 in every row, column, and 2x3 box (the default
// box tiling for a plain 6x6 Shape). Digits cannot repeat along the two
// drawn diagonals (length 6 == the value range, so all-different is exact;
// payload has both diagonal+ and diagonal- true).

const givens = [
  ['R1C2', 6],
  ['R1C5', 3],
  ['R2C3', 1],
  ['R3C3', 5],
  ['R3C4', 2],
  ['R6C1', 1],
  ['R6C6', 4],
];

return [
  new Shape('6x6'),
  // '/'-oriented diagonal R1C6-R2C5-R3C4-R4C3-R5C2-R6C1.
  new Diagonal(1),
  // '\'-oriented diagonal R1C1-R2C2-R3C3-R4C4-R5C5-R6C6.
  new Diagonal(-1),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
