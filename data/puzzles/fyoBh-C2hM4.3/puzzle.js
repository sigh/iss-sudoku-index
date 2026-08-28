// Title: Jan 25, 2021: Non-consecutive
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=fyoBh-C2hM4
// Source: https://tinyurl.com/3rjhfmnc

// Standard 9x9 sudoku (Shape covers rows/columns/boxes; the payload's
// regions are the plain 3x3 boxes). Orthogonally adjacent cells cannot hold
// consecutive digits (AntiConsecutive, global -- the class only ever binds
// orthogonally-adjacent cells). No lines, cages, or other overlay clues are
// drawn.

// Givens, transcribed from the drawn grid:
const GIVENS = [
  ['R1C4', 9], ['R1C5', 7], ['R1C6', 3], ['R1C7', 5],
  ['R2C3', 5], ['R2C4', 1], ['R2C7', 3], ['R2C8', 7],
  ['R3C1', 9], ['R3C2', 7], ['R3C3', 3], ['R3C8', 1],
  ['R4C1', 1], ['R4C8', 9], ['R4C9', 7],
  ['R5C1', 7], ['R5C9', 3],
  ['R6C1', 3], ['R6C2', 5], ['R6C9', 1],
  ['R7C2', 1], ['R7C7', 7], ['R7C8', 3], ['R7C9', 5],
  ['R8C2', 3], ['R8C3', 7], ['R8C6', 1], ['R8C7', 9],
  ['R9C3', 9], ['R9C4', 7], ['R9C5', 3], ['R9C6', 5],
];

return [
  new Shape('9x9'),
  new AntiConsecutive(),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
];
