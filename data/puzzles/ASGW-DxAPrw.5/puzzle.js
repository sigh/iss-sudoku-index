// Title: After The Earthquake
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=ASGW-DxAPrw
// Source: https://tinyurl.com/569rd48z

// Normal Sudoku rules apply. The given table is transcribed from the puzzle data.
const givens = [
  ['R1C4', 8], ['R1C5', 9], ['R2C3', 6], ['R2C4', 7], ['R2C9', 3],
  ['R3C2', 4], ['R3C3', 5], ['R4C1', 2], ['R4C2', 3], ['R4C4', 6],
  ['R4C8', 4], ['R5C1', 1], ['R5C9', 9], ['R6C2', 6], ['R6C6', 4],
  ['R6C8', 7], ['R6C9', 8], ['R7C7', 5], ['R7C8', 6], ['R8C1', 7],
  ['R8C6', 3], ['R8C7', 4], ['R9C5', 1], ['R9C6', 2],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
