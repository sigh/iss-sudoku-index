// Title: Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=moOOtzjEErY
// Source: https://sudokupad.app/9Dp74d7pmb

// Normal sudoku rules apply (rows, columns, boxes all-different -- ISS
// default). Killer cages: digits in each cage sum to the labelled total and
// do not repeat within the cage. Cages are transcribed from the payload's
// `cages` array; they partition the grid, so no givens are present.

const cages = [
  [16, ['R1C1', 'R2C1', 'R3C1']],
  [24, ['R1C2', 'R1C3', 'R1C4', 'R2C2']],
  [10, ['R2C3', 'R2C4', 'R3C2', 'R3C3']],
  [15, ['R1C5', 'R2C5']],
  [22, ['R1C6', 'R1C7', 'R2C6', 'R2C7']],
  [18, ['R1C8', 'R1C9', 'R2C8', 'R2C9']],
  [23, ['R3C4', 'R4C4', 'R5C4', 'R6C4']],
  [9, ['R3C5', 'R4C5']],
  [20, ['R3C6', 'R4C6', 'R5C5', 'R5C6']],
  [15, ['R3C7', 'R3C8', 'R3C9', 'R4C9']],
  [9, ['R4C1', 'R4C2']],
  [28, ['R5C1', 'R5C2', 'R6C1', 'R6C2']],
  [8, ['R4C3', 'R5C3', 'R6C3']],
  [19, ['R6C5', 'R7C5', 'R8C5', 'R9C5']],
  [8, ['R6C6', 'R6C7']],
  [13, ['R4C7', 'R5C7']],
  [8, ['R4C8', 'R5C8', 'R6C8']],
  [17, ['R5C9', 'R6C9']],
  [15, ['R7C1', 'R7C2', 'R7C3', 'R7C4']],
  [12, ['R8C1', 'R8C2']],
  [18, ['R9C1', 'R9C2', 'R9C3', 'R9C4']],
  [17, ['R8C3', 'R8C4']],
  [11, ['R7C6', 'R8C6']],
  [19, ['R7C7', 'R7C8', 'R8C7', 'R8C8']],
  [7, ['R7C9', 'R8C9']],
  [9, ['R9C6', 'R9C7']],
  [15, ['R9C8', 'R9C9']],
].map(([sum, cells]) => new Cage(sum, ...cells));

return [
  new Shape('9x9'),
  ...cages,
];
