// Title: A Classic Technique
// Author: 
// Video: https://www.youtube.com/watch?v=EciHY-dxIIE
// Source: https://cracking-the-cryptic.web.app/sudoku/j62Rm8qq9j

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C2', 2],
  ['R1C3', 1],
  ['R1C6', 4],
  ['R1C7', 9],
  ['R1C8', 8],
  ['R2C1', 4],
  ['R2C6', 2],
  ['R2C8', 6],
  ['R3C3', 5],
  ['R3C5', 3],
  ['R3C7', 2],
  ['R4C6', 7],
  ['R5C2', 5],
  ['R5C5', 1],
  ['R5C8', 9],
  ['R6C4', 2],
  ['R7C3', 4],
  ['R7C5', 2],
  ['R7C7', 1],
  ['R8C2', 9],
  ['R8C4', 8],
  ['R8C9', 7],
  ['R9C2', 1],
  ['R9C3', 6],
  ['R9C4', 9],
  ['R9C7', 8],
  ['R9C8', 3],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
