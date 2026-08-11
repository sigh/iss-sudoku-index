// Title: Lines 11
// Author: Jjesper
// Video: https://www.youtube.com/watch?v=N8ahqrqpKv0
// Source: https://app.crackingthecryptic.com/sudoku/Rqr2gJgQMr

// Normal sudoku rules apply. The digits along each line must sum to 11.
// Digits may repeat along lines if allowed by other rules -- so each line is
// Sum (not Cage): it adds no distinctness of its own beyond what the
// standard row/column/box groups already provide.
//
// There are 15 freeform lines. Two of the cell paths bend through a
// diagonally adjacent cell rather than staying orthogonal (the
// R2C3->R3C2 step in the first line, and the single-diagonal-step
// two-cell lines R2C8-R1C9 and R4C6-R5C5).
const lines = [
  new Sum(11, 'R1C3', 'R1C4', 'R2C4', 'R2C3', 'R3C2'),
  new Sum(11, 'R1C5', 'R2C5', 'R3C5', 'R4C5'),
  new Sum(11, 'R1C6', 'R1C7'),
  new Sum(11, 'R2C7', 'R3C7'),
  new Sum(11, 'R2C8', 'R1C9'),
  new Sum(11, 'R4C8', 'R4C9'),
  new Sum(11, 'R5C7', 'R6C7'),
  new Sum(11, 'R4C6', 'R5C5'),
  new Sum(11, 'R4C2', 'R5C2'),
  new Sum(11, 'R5C3', 'R6C3', 'R7C3'),
  new Sum(11, 'R7C5', 'R8C5'),
  new Sum(11, 'R8C6', 'R9C6'),
  new Sum(11, 'R8C7', 'R8C8'),
  new Sum(11, 'R7C7', 'R7C8', 'R7C9'),
  new Sum(11, 'R3C3', 'R3C4'),
];

return [
  new Shape('9x9'),
  ...lines,
];
