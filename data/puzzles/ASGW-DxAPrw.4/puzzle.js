// Title: 10/16/23: Procrastination
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=ASGW-DxAPrw
// Source: https://tinyurl.com/yvep35jt

// Normal Sudoku rules apply and there are no additional variant clues. The given
// table is transcribed from the source puzzle data.
const givens = [
  ['R1C2', 2], ['R1C4', 1], ['R1C6', 3], ['R1C8', 6],
  ['R2C1', 3], ['R2C3', 4], ['R2C7', 2], ['R2C9', 9],
  ['R3C2', 7], ['R3C4', 5], ['R3C8', 1],
  ['R4C1', 7], ['R4C7', 9], ['R4C9', 5],
  ['R6C1', 5], ['R6C3', 1], ['R6C9', 3],
  ['R7C2', 9], ['R7C6', 5], ['R7C8', 3],
  ['R8C1', 1], ['R8C3', 8], ['R8C7', 6], ['R8C9', 7],
  ['R9C2', 4], ['R9C4', 7], ['R9C6', 9], ['R9C8', 8],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
