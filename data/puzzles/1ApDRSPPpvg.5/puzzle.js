// Title: 6/27/23: Windows of the Solve
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=1ApDRSPPpvg
// Source: https://tinyurl.com/45wuvuxz

// Normal sudoku rules apply. Windoku: each of the four marked 3x3 window
// regions must also contain 1-9 without repeats. The windows match the
// solver's default Windoku layout exactly (rows/cols 2-4 and 6-8), so the
// built-in Windoku constraint is used rather than four explicit regions.
const givens = [
  ['R1C1', 1], ['R1C5', 3], ['R1C9', 2],
  ['R2C2', 2], ['R2C4', 5], ['R2C8', 4],
  ['R3C3', 3], ['R3C7', 1],
  ['R4C4', 4], ['R4C6', 3],
  ['R5C1', 6], ['R5C5', 5], ['R5C9', 4],
  ['R6C4', 7], ['R6C6', 6],
  ['R7C3', 9], ['R7C7', 7],
  ['R8C2', 6], ['R8C6', 5], ['R8C8', 8],
  ['R9C1', 8], ['R9C5', 7], ['R9C9', 9],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  new Windoku(),
];
