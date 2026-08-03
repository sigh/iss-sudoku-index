// Title: 7/9: Amongst Our Variantry
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=-SbL3gEtxaM
// Source: https://tinyurl.com/5at8mjye
//
// Normal sudoku rules (default row/column/box all-different, no givens).
// Killer: each cage's digits are distinct and sum to the printed total.
// Renban: each purple line's digits form a non-repeating consecutive run, in
// any order.
// Several cages and lines are drawn over the same cells; both constraint
// types still apply independently and simultaneously there, per the source.

// Killer cages: [sum, ...cells], transcribed from the source's cage list
// (cell order and totals as drawn).
const cages = [
  [9, 'R1C1', 'R1C2', 'R1C3'],
  [12, 'R1C4', 'R2C4', 'R3C4'],
  [21, 'R9C7', 'R9C8', 'R9C9'],
  [18, 'R7C6', 'R8C6', 'R9C6'],
  [18, 'R2C1', 'R3C1', 'R4C1'],
  [15, 'R4C2', 'R4C3', 'R4C4'],
  [15, 'R6C6', 'R6C7', 'R6C8'],
  [12, 'R6C9', 'R7C9', 'R8C9'],
  [16, 'R1C9', 'R2C9', 'R3C9'],
  [14, 'R7C1', 'R8C1', 'R9C1'],
  [18, 'R4C7', 'R4C8', 'R4C9'],
  [14, 'R2C6', 'R3C6', 'R4C6'],
  [23, 'R1C6', 'R1C7', 'R1C8'],
  [7, 'R9C2', 'R9C3', 'R9C4'],
  [16, 'R6C4', 'R7C4', 'R8C4'],
  [12, 'R6C1', 'R6C2', 'R6C3'],
];

// Renban lines: transcribed from the source's line list (cell order as
// drawn).
const renbanLines = [
  ['R1C1', 'R1C2', 'R1C3'],
  ['R1C4', 'R2C4', 'R3C4'],
  ['R4C4', 'R4C3', 'R4C2'],
  ['R4C1', 'R3C1', 'R2C1'],
  ['R1C6', 'R1C7'],
  ['R1C9', 'R2C9'],
  ['R4C9', 'R4C8'],
  ['R4C6', 'R3C6'],
  ['R6C6', 'R6C7', 'R6C8'],
  ['R6C9', 'R7C9', 'R8C9'],
  ['R9C9', 'R9C8', 'R9C7'],
  ['R9C6', 'R8C6', 'R7C6'],
  ['R6C4', 'R7C4'],
  ['R9C4', 'R9C3'],
  ['R9C1', 'R8C1'],
  ['R6C1', 'R6C2'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...renbanLines.map((cells) => new Renban(...cells)),
];
