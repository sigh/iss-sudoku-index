// Title: Christmas Star
// Author: Riffclown
// Video: https://www.youtube.com/watch?v=RTKFCzHR9E8
// Source: https://sudokupad.app/9pbr75sftp

// Normal sudoku rules apply (rows, columns, boxes all-different -- ISS
// default). Killer cages: digits in each cage sum to the labelled total and
// do not repeat within the cage. Cages and givens are transcribed from the
// payload's `killercage` array and `grid[*].given` cells.

const givens = [
  ['R2C5', 4], ['R3C5', 2], ['R4C4', 4], ['R4C6', 8],
  ['R5C2', 7], ['R5C3', 4], ['R5C7', 2], ['R5C8', 3],
  ['R6C4', 3], ['R6C6', 2], ['R7C5', 3], ['R8C5', 8],
].map(([cell, digit]) => new Given(cell, digit));

const cages = [
  [40, ['R1C3', 'R1C4', 'R2C3', 'R3C1', 'R3C2', 'R3C3', 'R4C1']],
  [40, ['R6C1', 'R7C1', 'R7C2', 'R7C3', 'R8C3', 'R9C3', 'R9C4']],
  [40, ['R6C9', 'R7C7', 'R7C8', 'R7C9', 'R8C7', 'R9C6', 'R9C7']],
  [40, ['R1C6', 'R1C7', 'R2C7', 'R3C7', 'R3C8', 'R3C9', 'R4C9']],
  [31, ['R4C2', 'R4C3', 'R5C2', 'R5C3', 'R5C4', 'R6C2', 'R6C3']],
  [31, ['R2C4', 'R2C5', 'R2C6', 'R3C4', 'R3C5', 'R3C6', 'R4C5']],
  [31, ['R4C7', 'R4C8', 'R5C6', 'R5C7', 'R5C8', 'R6C7', 'R6C8']],
  [31, ['R6C5', 'R7C4', 'R7C5', 'R7C6', 'R8C4', 'R8C5', 'R8C6']],
  [10, ['R1C8', 'R1C9', 'R2C8']],
  [12, ['R1C1', 'R1C2', 'R2C1']],
  [15, ['R8C8', 'R8C9', 'R9C8']],
  [16, ['R8C1', 'R8C2', 'R9C1']],
].map(([sum, cells]) => new Cage(sum, ...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...cages,
];
