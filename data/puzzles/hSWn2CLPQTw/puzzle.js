// Title: "Hard" Sudoku Masterclass:  2 Minutes 26 Seconds!
// Author: 
// Video: https://www.youtube.com/watch?v=hSWn2CLPQTw
// Source: https://cracking-the-cryptic.web.app/sudoku/QM8q4DTQFM

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C2', 1],
  ['R1C5', 8],
  ['R1C8', 7],
  ['R2C1', 8],
  ['R2C5', 3],
  ['R2C9', 9],
  ['R3C4', 9],
  ['R3C6', 1],
  ['R4C3', 3],
  ['R4C7', 6],
  ['R5C1', 9],
  ['R5C2', 4],
  ['R5C8', 5],
  ['R5C9', 3],
  ['R6C3', 8],
  ['R6C7', 9],
  ['R7C4', 5],
  ['R7C6', 6],
  ['R8C1', 7],
  ['R8C5', 1],
  ['R8C9', 2],
  ['R9C2', 5],
  ['R9C5', 2],
  ['R9C8', 1],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
