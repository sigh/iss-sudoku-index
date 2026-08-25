// Title: Windoku
// Author: Jan Mrozowski
// Video: https://www.youtube.com/watch?v=wBYYh0Uh_lY
// Source: https://app.crackingthecryptic.com/JhTTN77p7j

// Normal sudoku rules apply. Windoku: each of the four marked 3x3 window
// regions must also contain 1-9 without repeats. The four drawn regions
// (R2-4C2-4, R2-4C6-8, R6-8C2-4, R6-8C6-8) match the solver's default
// Windoku layout exactly, so the built-in Windoku constraint is used rather
// than four explicit regions.
const givens = [
  ['R1C1', 5], ['R1C7', 2],
  ['R2C4', 4], ['R2C8', 3],
  ['R3C5', 5], ['R3C6', 6], ['R3C9', 1],
  ['R4C2', 2], ['R4C7', 7],
  ['R5C3', 3], ['R5C7', 8],
  ['R6C3', 4], ['R6C8', 9],
  ['R7C1', 1], ['R7C4', 5], ['R7C5', 6],
  ['R8C2', 8],
  ['R9C3', 9], ['R9C9', 6],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  new Windoku(),
];
