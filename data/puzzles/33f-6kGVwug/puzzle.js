// Title: Antidiagonal sudoku - can you work with this rule?
// Author: Unknown
// Video: https://www.youtube.com/watch?v=33f-6kGVwug
// Source: https://cracking-the-cryptic.web.app/sudoku/BmjBm8P4dM

// Standard 9x9 sudoku (rows, columns, and the nine 3x3 boxes each contain
// 1-9 once), plus: no more than three different digits appear on each of
// the two grey diagonal lines drawn on the grid (video description: "No
// more than three different digits appear on each diagonal line").
//
// Each diagonal's distinct-digit count is forced into {1,2,3} by pairing it
// with an off-grid Var cell restricted to that range: CountDistinct's
// control (first) cell holds the number of distinct values among the
// remaining cells passed to it.

const mainDiagonal = [
  'R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9',
];
const antiDiagonal = [
  'R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1',
];

// Givens transcribed from the payload's `cells` array.
const givens = [
  ['R1C8', 9], ['R2C3', 1], ['R2C4', 2], ['R3C2', 8], ['R3C5', 3],
  ['R4C2', 7], ['R4C5', 4], ['R4C9', 2], ['R5C3', 6], ['R5C4', 5],
  ['R6C7', 8], ['R6C8', 7], ['R7C6', 1], ['R7C9', 5], ['R8C1', 3],
  ['R8C6', 2], ['R9C7', 3],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),

  new Var('MD', 'main diagonal distinct-digit count', '1'),
  new Given('VMD', 1, 2, 3),
  new CountDistinct('VMD', ...mainDiagonal),

  new Var('AD', 'anti-diagonal distinct-digit count', '1'),
  new Given('VAD', 1, 2, 3),
  new CountDistinct('VAD', ...antiDiagonal),
];
