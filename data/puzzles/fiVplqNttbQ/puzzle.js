// Title: Goldilocks and the Renbans
// Author: Qodec
// Video: https://www.youtube.com/watch?v=fiVplqNttbQ
// Source: https://sudokupad.app/w12tyqmvs0

// Standard sudoku (rows, columns, 3x3 boxes) plus killer cages (no repeats,
// sum to the corner total) and Renban lines (non-repeating consecutive
// digits, any order). No givens.
//
// The payload draws R6C5-R5C5 and R5C6-R5C5 as two separate single-segment
// entries, both purple, same width, sharing the endpoint R5C5 with no gap.
// Read as one continuous bent (L-shaped) Renban line over the 3 cells
// R6C5, R5C5, R5C6, split into two straight sub-paths only for storage
// (the shared-endpoint/no-other-distinguishing-feature case the decode
// guide calls out) -- not two independent 2-cell Renban pairs.

const cages = [
  new Cage(18, 'R1C1', 'R1C2', 'R2C1'),
  new Cage(18, 'R1C7', 'R1C8', 'R1C9'),
  new Cage(15, 'R7C1', 'R8C1', 'R9C1'),
  new Cage(7, 'R2C4', 'R3C4'),
  new Cage(8, 'R4C2', 'R4C3'),
  new Cage(12, 'R5C4', 'R6C4', 'R7C4'),
  new Cage(12, 'R4C5', 'R4C6', 'R4C7'),
  new Cage(15, 'R6C6', 'R6C7', 'R7C6'),
  new Cage(10, 'R8C7', 'R8C8'),
];

const renbans = [
  new Renban('R1C6', 'R1C5', 'R1C4'),
  new Renban('R6C1', 'R5C1', 'R4C1'),
  new Renban('R6C5', 'R5C5', 'R5C6'),
  new Renban('R9C2', 'R9C3', 'R9C4'),
  new Renban('R2C9', 'R3C9', 'R4C9'),
  new Renban('R9C7', 'R9C8', 'R9C9', 'R8C9', 'R7C9'),
  new Renban('R3C3', 'R4C4'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...renbans,
];
