// Title: A 'Hard' Puzzle - Solved with a Neat Trick
// Author: 
// Video: https://www.youtube.com/watch?v=t62Y3pOjEvw
// Source: https://cracking-the-cryptic.web.app/sudoku/2tMJ2BhrH3

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C3', 6],
  ['R1C4', 8],
  ['R1C6', 2],
  ['R1C9', 5],
  ['R2C5', 3],
  ['R2C7', 7],
  ['R3C7', 8],
  ['R3C8', 2],
  ['R3C9', 4],
  ['R4C1', 1],
  ['R4C4', 4],
  ['R4C5', 8],
  ['R5C2', 9],
  ['R6C2', 3],
  ['R6C5', 1],
  ['R6C7', 2],
  ['R6C8', 5],
  ['R7C1', 4],
  ['R7C2', 5],
  ['R8C8', 6],
  ['R9C4', 1],
  ['R9C5', 7],
  ['R9C8', 3],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
