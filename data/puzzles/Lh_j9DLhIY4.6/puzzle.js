// Title: April 1, 2022: Classy Sudoku
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=Lh_j9DLhIY4
// Source: https://tinyurl.com/3u8yvp3p

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C1', 9],
  ['R1C7', 8],
  ['R2C3', 7],
  ['R2C4', 9],
  ['R2C9', 6],
  ['R3C2', 5],
  ['R3C5', 4],
  ['R3C8', 3],
  ['R4C2', 2],
  ['R4C5', 5],
  ['R4C8', 4],
  ['R5C3', 1],
  ['R5C4', 2],
  ['R5C9', 9],
  ['R7C1', 8],
  ['R7C7', 2],
  ['R8C3', 6],
  ['R8C4', 1],
  ['R8C9', 7],
  ['R9C2', 3],
  ['R9C5', 2],
  ['R9C8', 5],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
