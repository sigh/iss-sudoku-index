// Title: Classic Sudoku 83
// Author: Akash Doulani
// Video: https://www.youtube.com/watch?v=RyqPkIpRmao
// Source: https://app.crackingthecryptic.com/sudoku/MNB42J2RDL

// Normal sudoku rules apply (default rows/cols/boxes). No other constraints
// are present: the payload carries only 26 given digits and the standard
// 9x9 region partition; no cages, lines, or overlays.

// Given digits transcribed from the payload's `cells` array.
const givens = [
  ['R1C1', 1], ['R1C5', 7], ['R1C6', 2],
  ['R2C1', 5], ['R2C2', 2], ['R2C7', 8],
  ['R3C3', 3], ['R3C8', 9],
  ['R4C4', 9], ['R4C6', 1], ['R4C9', 3],
  ['R5C2', 4], ['R5C3', 1], ['R5C7', 6], ['R5C8', 2],
  ['R6C4', 6], ['R6C6', 3], ['R6C9', 5],
  ['R7C3', 5], ['R7C8', 7],
  ['R8C1', 6], ['R8C2', 3], ['R8C7', 1],
  ['R9C1', 2], ['R9C5', 3], ['R9C6', 4],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
