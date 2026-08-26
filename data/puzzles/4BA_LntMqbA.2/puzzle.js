// Title: Nov 25, 2021: Easy as 1, 2, 3
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=4BA_LntMqbA
// Source: https://tinyurl.com/25kkcrfn

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C3', 8],
  ['R1C7', 7],
  ['R1C9', 4],
  ['R2C2', 3],
  ['R2C4', 1],
  ['R2C6', 2],
  ['R3C1', 5],
  ['R3C5', 8],
  ['R3C9', 6],
  ['R4C1', 2],
  ['R4C8', 1],
  ['R5C3', 4],
  ['R5C5', 5],
  ['R5C7', 8],
  ['R6C2', 1],
  ['R6C9', 5],
  ['R7C1', 3],
  ['R7C5', 1],
  ['R7C9', 7],
  ['R8C4', 2],
  ['R8C6', 4],
  ['R8C8', 6],
  ['R9C1', 6],
  ['R9C3', 5],
  ['R9C7', 3],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
