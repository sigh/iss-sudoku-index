// Title: How NOT To Cheat At Sudoku!
// Author: 
// Video: https://www.youtube.com/watch?v=TQ0lso4fJzk
// Source: https://cracking-the-cryptic.web.app/sudoku/jHQR32FrfP

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R2C3', 9],
  ['R2C4', 8],
  ['R2C9', 7],
  ['R3C2', 8],
  ['R3C5', 6],
  ['R3C8', 5],
  ['R4C2', 5],
  ['R4C5', 4],
  ['R4C8', 3],
  ['R5C3', 7],
  ['R5C4', 9],
  ['R5C9', 2],
  ['R7C3', 2],
  ['R7C4', 7],
  ['R7C9', 9],
  ['R8C2', 4],
  ['R8C5', 5],
  ['R8C8', 6],
  ['R9C1', 3],
  ['R9C6', 6],
  ['R9C7', 2],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
