// Title: A Disjointed Killer
// Author: Jonny Kaufman
// Video: https://www.youtube.com/watch?v=oawhIxPpbyo
// Source: https://app.crackingthecryptic.com/sudoku/9F9jMN8ntn

// Normal sudoku rules apply (rows, columns, boxes all-different -- ISS
// default). Killer cages: digits in each cage sum to the labelled total and
// do not repeat within the cage (`Cage`). "Each digit appears in every
// possible position within a 3x3 box" is exactly ISS's `DisjointSets` rule
// (no digit may repeat in the same within-box position across two boxes).
// The one inequality sign is decoded from its drawn chevron: it sits
// between R1C8 and R2C8, and its rules text says the sign points to the
// lower digit, so R1C8 < R2C8, i.e. R2C8 > R1C8.
// Cages transcribed from the payload's `cages` array.

const cages = [
  [26, ['R1C1', 'R1C2', 'R2C2', 'R2C1']],
  [22, ['R1C4', 'R2C4', 'R2C5', 'R2C6']],
  [5, ['R1C5', 'R1C6']],
  [7, ['R4C1', 'R5C1']],
  [20, ['R4C2', 'R5C2', 'R6C2', 'R6C1']],
  [27, ['R8C1', 'R8C2', 'R9C2', 'R9C1']],
  [22, ['R8C4', 'R9C4', 'R9C5', 'R9C6']],
  [5, ['R8C5', 'R8C6']],
  [20, ['R4C6', 'R5C6', 'R6C6', 'R6C5']],
  [18, ['R4C5', 'R4C4', 'R5C4']],
  [27, ['R1C8', 'R1C9', 'R2C9', 'R2C8']],
  [5, ['R4C8', 'R4C9']],
  [22, ['R5C8', 'R5C9', 'R6C9', 'R6C8']],
  [22, ['R4C3', 'R3C3', 'R3C4']],
  [21, ['R3C6', 'R3C7', 'R4C7']],
  [22, ['R6C7', 'R7C7', 'R7C6']],
  [26, ['R8C8', 'R8C9', 'R9C9', 'R9C8']],
].map(([sum, cells]) => new Cage(sum, ...cells));

return [
  new Shape('9x9'),
  ...cages,
  new DisjointSets(),
  new GreaterThan('R2C8', 'R1C8'),
];
