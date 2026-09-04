// Title: King Sudoku
// Author: Cracking The Cryptic
// Video: https://www.youtube.com/watch?v=5DlMEgPnxRs
// Source: https://cracking-the-cryptic.web.app/sudoku/3dqHL3pjfr

// Normal Sudoku rules apply. A digit cannot be placed in a cell that is
// within a chess king's move of a cell holding that same digit.

// Givens, transcribed from the puzzle's drawn digits.
const givens = [
  ['R1C1', 9], ['R1C9', 5],
  ['R2C3', 7], ['R2C4', 9], ['R2C6', 1], ['R2C7', 4], ['R2C8', 2],
  ['R3C2', 8], ['R3C8', 1],
  ['R4C2', 2], ['R4C5', 7], ['R4C8', 3],
  ['R5C4', 6], ['R5C6', 4],
  ['R6C2', 3], ['R6C5', 2], ['R6C8', 7],
  ['R7C2', 5], ['R7C8', 9],
  ['R8C3', 9], ['R8C4', 5], ['R8C6', 6], ['R8C7', 2],
  ['R9C1', 1], ['R9C9', 6],
].map(([cell, value]) => new Given(cell, value));

return [
  new Shape('9x9'),
  new AntiKing(),
  ...givens,
];
