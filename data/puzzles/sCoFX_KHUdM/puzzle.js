// Title: What To Do When A Sudoku Has A Sting In The Tail...
// Author: 
// Video: https://www.youtube.com/watch?v=sCoFX_KHUdM
// Source: https://cracking-the-cryptic.web.app/sudoku/jqm8hjD9pq

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C3', 5],
  ['R1C6', 4],
  ['R2C2', 6],
  ['R2C5', 1],
  ['R2C8', 3],
  ['R3C2', 7],
  ['R3C4', 8],
  ['R3C7', 9],
  ['R3C9', 2],
  ['R4C2', 4],
  ['R4C9', 8],
  ['R5C3', 3],
  ['R5C7', 2],
  ['R6C1', 2],
  ['R6C8', 1],
  ['R7C1', 8],
  ['R7C3', 9],
  ['R7C6', 3],
  ['R7C8', 4],
  ['R8C2', 1],
  ['R8C5', 5],
  ['R8C8', 9],
  ['R9C4', 7],
  ['R9C7', 5],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
