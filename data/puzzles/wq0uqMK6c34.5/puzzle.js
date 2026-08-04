// Title: #wavy
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=wq0uqMK6c34
// Source: https://tinyurl.com/bdmahtty

// Normal sudoku rules apply. The payload carries no cages, lines, arrows,
// regions, or other variant geometry -- the title names the puzzle/series,
// not a stated rule (the payload's ruleset text is exactly "Normal sudoku
// rules apply.").

// Givens, transcribed from the payload's grid array (row-major, 1-indexed).
const givens = [
  ['R1C2', 2], ['R1C6', 6],
  ['R2C1', 1], ['R2C3', 3], ['R2C5', 5], ['R2C7', 7], ['R2C9', 9],
  ['R3C4', 4], ['R3C8', 1],
  ['R4C2', 3], ['R4C6', 9],
  ['R5C1', 4], ['R5C3', 6], ['R5C5', 8], ['R5C7', 1], ['R5C9', 3],
  ['R6C4', 7], ['R6C8', 5],
  ['R7C2', 8], ['R7C6', 3],
  ['R8C1', 7], ['R8C3', 9], ['R8C5', 6], ['R8C7', 2], ['R8C9', 5],
  ['R9C4', 1], ['R9C8', 7],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
