// Title: Classic Sudoku
// Author: jovi_al
// Video: https://www.youtube.com/watch?v=gCiYtS3A_F4
// Source: https://app.crackingthecryptic.com/sudoku/6qfQQDq6jQ

// Normal sudoku rules apply. Standard 3x3 box regions (default Shape('9x9')
// regions match the payload's own `regions` array). No other clue types are
// present in the payload.

// Givens as drawn in the payload's `cells` array.
const givens = [
  ['R1C3', 3], ['R1C5', 4], ['R1C6', 7], ['R1C7', 5],
  ['R3C1', 6], ['R3C7', 1], ['R3C9', 9],
  ['R4C1', 7], ['R4C4', 9], ['R4C6', 6], ['R4C9', 8],
  ['R5C2', 2], ['R5C5', 8], ['R5C8', 7],
  ['R6C1', 8], ['R6C4', 3], ['R6C6', 1], ['R6C9', 5],
  ['R7C1', 9], ['R7C3', 1], ['R7C9', 4],
  ['R9C3', 6], ['R9C4', 5], ['R9C5', 3], ['R9C7', 7],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
