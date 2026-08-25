// Title: Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=IU44oK-3xIU
// Source: https://sudokupad.app/hgtT6hP4GJ

// Normal sudoku rules apply (rows, columns, boxes all-different -- ISS
// default). Killer cages: digits in each cage sum to the labelled total and
// do not repeat within the cage. Cages are transcribed from the payload's
// `cages` array.

const cages = [
  [8, ['R1C1', 'R2C1']],
  [10, ['R1C2', 'R2C2']],
  [19, ['R1C3', 'R1C4', 'R1C5', 'R2C5']],
  [14, ['R2C3', 'R2C4', 'R3C3', 'R3C4']],
  [22, ['R3C1', 'R3C2', 'R4C1', 'R5C1']],
  [30, ['R4C2', 'R5C2', 'R5C3', 'R5C4']],
  [12, ['R4C3', 'R4C4']],
  [19, ['R6C1', 'R6C2', 'R6C3', 'R7C1']],
  [11, ['R7C2', 'R7C3']],
  [9, ['R8C1', 'R9C1']],
  [4, ['R8C2', 'R9C2']],
  [13, ['R8C3', 'R9C3']],
  [18, ['R1C6', 'R2C6', 'R3C6', 'R3C7']],
  [10, ['R3C5', 'R4C5', 'R5C5']],
  [8, ['R6C4', 'R7C4']],
  [17, ['R8C4', 'R9C4']],
  [23, ['R4C6', 'R5C6', 'R6C5', 'R6C6']],
  [7, ['R7C5', 'R7C6', 'R8C5']],
  [30, ['R7C7', 'R7C8', 'R8C6', 'R8C7']],
  [16, ['R9C5', 'R9C6', 'R9C7']],
  [21, ['R1C7', 'R1C8', 'R1C9']],
  [10, ['R2C7', 'R2C8', 'R2C9']],
  [15, ['R3C8', 'R3C9', 'R4C8']],
  [11, ['R4C7', 'R5C7']],
  [7, ['R5C8', 'R6C7', 'R6C8']],
  [17, ['R4C9', 'R5C9']],
  [10, ['R6C9', 'R7C9', 'R8C9']],
  [14, ['R8C8', 'R9C8', 'R9C9']],
].map(([sum, cells]) => new Cage(sum, ...cells));

return [
  new Shape('9x9'),
  ...cages,
];
