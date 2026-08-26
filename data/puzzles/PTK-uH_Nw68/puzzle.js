// Title: The Last Sudoku Of The Decade
// Author: 
// Video: https://www.youtube.com/watch?v=PTK-uH_Nw68
// Source: https://cracking-the-cryptic.web.app/sudoku/LR7M2Jq8PG

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C1', 6],
  ['R1C5', 3],
  ['R1C8', 4],
  ['R2C6', 2],
  ['R2C7', 7],
  ['R2C9', 8],
  ['R3C4', 1],
  ['R3C8', 6],
  ['R4C3', 5],
  ['R4C4', 6],
  ['R4C8', 9],
  ['R5C1', 8],
  ['R5C5', 7],
  ['R5C9', 4],
  ['R6C2', 7],
  ['R6C6', 1],
  ['R6C7', 3],
  ['R7C2', 2],
  ['R7C6', 7],
  ['R8C1', 9],
  ['R8C3', 3],
  ['R8C4', 4],
  ['R9C2', 8],
  ['R9C5', 2],
  ['R9C9', 9],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
