// Title: 3/9/22: You Can Count On Us
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=XUQkX8NiRXw
// Source: https://tinyurl.com/yejwx73f

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C1', 5],
  ['R1C5', 1],
  ['R2C4', 7],
  ['R2C6', 2],
  ['R3C3', 6],
  ['R3C5', 8],
  ['R3C7', 3],
  ['R4C2', 5],
  ['R4C4', 9],
  ['R4C6', 1],
  ['R4C8', 4],
  ['R5C1', 4],
  ['R5C3', 1],
  ['R5C7', 2],
  ['R5C9', 5],
  ['R6C2', 3],
  ['R6C4', 2],
  ['R6C6', 4],
  ['R6C8', 6],
  ['R7C3', 2],
  ['R7C5', 3],
  ['R7C7', 7],
  ['R8C4', 1],
  ['R8C6', 8],
  ['R9C5', 9],
  ['R9C9', 6],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
