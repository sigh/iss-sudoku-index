// Title: Patto Patto
// Author: shye
// Video: https://www.youtube.com/watch?v=SDTtcipqw7M
// Source: https://app.crackingthecryptic.com/sudoku/Qj4P74ThNd
//
// Normal sudoku rules apply (standard 3x3 boxes). No other rules or
// geometry are drawn or stated; the payload's `cages` entries are all
// metadata stubs, not real cages.
const givens = [
  ['R1C2', 2], ['R1C3', 3], ['R1C5', 6], ['R1C6', 5], ['R1C8', 8], ['R1C9', 9],
  ['R2C1', 9], ['R2C6', 4], ['R2C9', 5],
  ['R3C1', 5], ['R3C4', 9],
  ['R4C1', 6], ['R4C4', 3], ['R4C8', 1], ['R4C9', 8],
  ['R5C1', 3], ['R5C2', 8], ['R5C4', 5], ['R5C5', 9], ['R5C9', 2],
  ['R6C5', 8], ['R6C6', 6], ['R6C7', 3],
  ['R7C1', 2], ['R7C2', 3], ['R7C9', 6],
  ['R8C1', 8], ['R8C3', 7], ['R8C5', 2], ['R8C9', 3],
  ['R9C2', 9], ['R9C3', 6], ['R9C5', 5], ['R9C6', 3], ['R9C7', 8], ['R9C8', 2],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, v]) => new Given(cell, v)),
];
