// Title: Sudoku X
// Author: jovi_al
// Video: https://www.youtube.com/watch?v=BW4QRK9yB5k
// Source: https://tinyurl.com/ywrwyvpf

// Rules encoded: normal sudoku; both marked principal diagonals no-repeat
// (payload's `diagonal+` and `diagonal-` are both true).

// Givens, from the payload's `grid` array (row-major).
const givens = [
  ['R1C1', 1], ['R1C2', 2], ['R1C3', 3], ['R1C6', 9], ['R1C7', 4],
  ['R1C8', 8], ['R1C9', 5],
  ['R2C1', 4], ['R2C9', 7],
  ['R3C1', 5], ['R3C9', 2],
  ['R4C9', 1],
  ['R6C1', 7],
  ['R7C1', 3], ['R7C9', 8],
  ['R8C1', 9], ['R8C9', 4],
  ['R9C1', 2], ['R9C2', 8], ['R9C3', 7], ['R9C4', 4], ['R9C7', 9],
  ['R9C8', 1], ['R9C9', 6],
];

return [
  new Shape('9x9'),
  new Diagonal(1),
  new Diagonal(-1),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
