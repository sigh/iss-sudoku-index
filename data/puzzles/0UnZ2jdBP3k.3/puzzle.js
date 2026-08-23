// Title: personal Space
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=0UnZ2jdBP3k
// Source: https://app.crackingthecryptic.com/sudoku/7dBBqHR3MP

// Standard 9x9 sudoku (Shape covers rows/columns/boxes; the payload's
// regions are the plain 3x3 boxes). Orthogonally adjacent cells cannot hold
// consecutive digits (AntiConsecutive, global -- the class only ever binds
// orthogonally-adjacent cells). No lines, cages, or other overlay clues are
// drawn.

// Givens, transcribed from the drawn grid:
const GIVENS = [
  ['R1C4', 2], ['R1C6', 5],
  ['R2C2', 5], ['R2C8', 4],
  ['R3C5', 1],
  ['R4C1', 5], ['R4C6', 9], ['R4C9', 4],
  ['R5C2', 7], ['R5C8', 3],
  ['R6C1', 6], ['R6C4', 1], ['R6C9', 5],
  ['R7C5', 9],
  ['R8C2', 6], ['R8C8', 5],
  ['R9C4', 5], ['R9C6', 8],
];

return [
  new Shape('9x9'),
  new AntiConsecutive(),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
];
