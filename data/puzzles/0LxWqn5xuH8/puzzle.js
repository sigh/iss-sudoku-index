// Title: "Warning: This is not going to be Easy"
// Author: 
// Video: https://www.youtube.com/watch?v=0LxWqn5xuH8
// Source: https://cracking-the-cryptic.web.app/sudoku/3ddhn7NF7T

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C3', 8],
  ['R1C6', 9],
  ['R1C7', 6],
  ['R1C8', 4],
  ['R2C1', 9],
  ['R2C4', 1],
  ['R2C6', 6],
  ['R3C6', 7],
  ['R4C2', 3],
  ['R4C8', 5],
  ['R5C1', 7],
  ['R5C3', 2],
  ['R5C7', 4],
  ['R5C9', 3],
  ['R6C2', 6],
  ['R6C8', 8],
  ['R7C3', 1],
  ['R7C4', 8],
  ['R7C7', 9],
  ['R8C4', 4],
  ['R8C9', 5],
  ['R9C2', 8],
  ['R9C3', 3],
  ['R9C4', 2],
  ['R9C7', 1],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
