// Title: Advanced Sudoku: When Triples Bend
// Author: Mike Halderman
// Video: https://www.youtube.com/watch?v=_e0vWBEP-I0
// Source: https://cracking-the-cryptic.web.app/sudoku/b8QdtH6tr7

// Classic Sudoku: place the digits 1-9 once each in every row, column, and
// box. No additional rules are stated in the source.

const givens = [
  ['R1C2', 5], ['R1C3', 2], ['R1C7', 6], ['R1C8', 4],
  ['R2C4', 7], ['R2C6', 2],
  ['R3C2', 8], ['R3C5', 3], ['R3C8', 5],
  ['R4C1', 8], ['R4C9', 5],
  ['R5C4', 3], ['R5C5', 6], ['R5C6', 8],
  ['R6C1', 1], ['R6C9', 4],
  ['R7C5', 9], ['R7C8', 2],
  ['R8C4', 6], ['R8C6', 5],
  ['R9C2', 1], ['R9C3', 6], ['R9C7', 9], ['R9C8', 3],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
