// Title: Tic Tac Toe Sudoku
// Author: Akash Doulani
// Video: https://www.youtube.com/watch?v=YwZCkdi94kk
// Source: https://cracking-the-cryptic.web.app/sudoku/Gf2M6rQgFJ

// The source states no rules, so only the drawn clues are encoded:
//   - normal Sudoku on the standard 3x3 boxes;
//   - 20 given digits.
// Omitted: nine light-grey 3-cell diagonal lines, one along a diagonal of
// each box. Nothing on the board or in any metadata field states what a
// grey line means, so they carry no constraint here.

const givens = [
  // From the 20 printed digits.
  new Given('R1C1', 8),
  new Given('R1C5', 7),
  new Given('R1C7', 9),
  new Given('R2C6', 5),
  new Given('R3C3', 7),
  new Given('R3C4', 6),
  new Given('R3C9', 3),
  new Given('R4C3', 2),
  new Given('R4C4', 7),
  new Given('R4C8', 1),
  new Given('R5C1', 5),
  new Given('R5C9', 6),
  new Given('R6C2', 1),
  new Given('R6C6', 6),
  new Given('R7C1', 9),
  new Given('R7C7', 2),
  new Given('R8C4', 1),
  new Given('R9C3', 8),
  new Given('R9C5', 5),
  new Given('R9C9', 7),
];

return [
  new Shape('9x9'),
  ...givens,
];
