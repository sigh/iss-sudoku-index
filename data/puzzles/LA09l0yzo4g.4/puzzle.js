// Title: Oct 16, 2021: Exclusion Sudoku
// Author: Clover
// Video: https://www.youtube.com/watch?v=LA09l0yzo4g
// Source: https://app.crackingthecryptic.com/sudoku/R24FdmrfLt

// Normal sudoku rules apply. A digit printed in a white circle may NOT appear
// in any of the four cells surrounding that circle. Each circle is encoded as
// a Given restricting its four cells' candidates to every digit except the
// circled one; Given constraints on the same cell intersect, so cells shared
// by two circles get both exclusions automatically.

const givens = [
  ['R1C3', 2], ['R1C5', 5], ['R1C7', 4],
  ['R2C2', 8], ['R2C8', 2],
  ['R3C1', 3], ['R3C9', 7],
  ['R4C4', 5], ['R4C6', 6],
  ['R5C1', 2], ['R5C9', 8],
  ['R6C4', 8], ['R6C6', 7],
  ['R7C1', 8], ['R7C9', 6],
  ['R8C2', 4], ['R8C8', 7],
  ['R9C3', 7], ['R9C5', 6], ['R9C7', 5],
];

// Exclusion circles: digit + the four cells around it, transcribed from the
// circle text and 2x2 corner coordinates drawn at each intersection.
const exclusionCircles = [
  [5, ['R2C3', 'R2C4', 'R3C3', 'R3C4']],
  [5, ['R5C2', 'R5C3', 'R6C2', 'R6C3']],
  [1, ['R2C4', 'R2C5', 'R3C4', 'R3C5']],
  [1, ['R4C4', 'R4C5', 'R5C4', 'R5C5']],
  [3, ['R2C5', 'R2C6', 'R3C5', 'R3C6']],
  [3, ['R3C7', 'R3C8', 'R4C7', 'R4C8']],
  [3, ['R4C7', 'R4C8', 'R5C7', 'R5C8']],
  [3, ['R5C5', 'R5C6', 'R6C5', 'R6C6']],
  [4, ['R5C7', 'R5C8', 'R6C7', 'R6C8']],
  [4, ['R5C4', 'R5C5', 'R6C4', 'R6C5']],
  [4, ['R2C6', 'R2C7', 'R3C6', 'R3C7']],
  [2, ['R7C3', 'R7C4', 'R8C3', 'R8C4']],
  [2, ['R4C5', 'R4C6', 'R5C5', 'R5C6']],
  [2, ['R7C4', 'R7C5', 'R8C4', 'R8C5']],
  [8, ['R7C5', 'R7C6', 'R8C5', 'R8C6']],
  [8, ['R6C7', 'R6C8', 'R7C7', 'R7C8']],
  [7, ['R4C2', 'R4C3', 'R5C2', 'R5C3']],
  [9, ['R6C2', 'R6C3', 'R7C2', 'R7C3']],
];

const ALL_DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const exclusionGivens = exclusionCircles.flatMap(([value, cells]) =>
  cells.map(cell => new Given(cell, ...ALL_DIGITS.filter(v => v !== value))));

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...exclusionGivens,
];
