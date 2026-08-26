// Title: And ... he's back!  Austrian Sudoku & Crossword News
// Author: 
// Video: https://www.youtube.com/watch?v=sWotLm9GQtY
// Source: https://cracking-the-cryptic.web.app/sudoku/NG4MnR2hTp

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C4', 8],
  ['R1C5', 3],
  ['R1C9', 2],
  ['R2C5', 6],
  ['R2C8', 7],
  ['R3C2', 9],
  ['R3C4', 5],
  ['R3C7', 6],
  ['R4C2', 8],
  ['R4C8', 6],
  ['R4C9', 4],
  ['R5C1', 3],
  ['R5C9', 1],
  ['R6C1', 6],
  ['R6C2', 4],
  ['R6C8', 5],
  ['R7C3', 2],
  ['R7C6', 4],
  ['R7C8', 1],
  ['R8C2', 7],
  ['R8C5', 8],
  ['R9C1', 8],
  ['R9C5', 5],
  ['R9C6', 9],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
