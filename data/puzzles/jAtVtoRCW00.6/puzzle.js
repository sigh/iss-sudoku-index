// Title: Nov 15, 2021: Windoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=jAtVtoRCW00
// Source: https://tinyurl.com/2j6akzkh

// Normal sudoku rules apply. Windoku: each of the four marked 3x3 window
// regions must also contain 1-9 without repeats. The four drawn regions
// (R2-4C2-4, R2-4C6-8, R6-8C2-4, R6-8C6-8) match the solver's default
// Windoku layout exactly, so the built-in Windoku constraint is used rather
// than four explicit regions.
const givens = [
  ['R1C2', 1], ['R1C3', 2], ['R1C4', 3],
  ['R2C2', 5], ['R2C5', 4],
  ['R3C1', 3], ['R3C5', 5], ['R3C7', 1], ['R3C9', 6],
  ['R4C1', 2], ['R4C9', 7],
  ['R6C1', 9], ['R6C9', 3],
  ['R7C1', 5], ['R7C5', 7], ['R7C7', 8], ['R7C9', 4],
  ['R8C2', 3], ['R8C5', 8],
  ['R9C6', 4], ['R9C7', 5], ['R9C8', 6],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  new Windoku(),
];
