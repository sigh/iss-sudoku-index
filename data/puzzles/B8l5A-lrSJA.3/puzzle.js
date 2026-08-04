// Title: 1/5/23: Another Sill-y Title
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=B8l5A-lrSJA
// Source: https://tinyurl.com/yc5xw73j

// Normal sudoku rules apply. Windoku: each of the four marked 3x3 window
// regions must also contain 1-9 without repeats. The four drawn regions
// (R2-4C2-4, R2-4C6-8, R6-8C2-4, R6-8C6-8) match the solver's default
// Windoku layout exactly, so the built-in Windoku constraint is used rather
// than four explicit regions.
const givens = [
  ['R2C5', 2],
  ['R3C3', 1], ['R3C6', 4], ['R3C7', 3],
  ['R4C4', 3], ['R4C5', 9], ['R4C7', 8],
  ['R5C2', 4], ['R5C5', 5], ['R5C8', 6],
  ['R6C3', 2], ['R6C5', 1], ['R6C6', 7],
  ['R7C3', 7], ['R7C4', 6], ['R7C7', 9],
  ['R8C5', 8],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  new Windoku(),
];
