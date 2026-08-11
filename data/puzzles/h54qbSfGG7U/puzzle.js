// Title: Eye Of The Storm
// Author: Knickolas
// Video: https://www.youtube.com/watch?v=h54qbSfGG7U
// Source: https://app.crackingthecryptic.com/sudoku/Qtb3r7Mgt8

// Normal sudoku rules (default row/column/box all-different from the
// standard 3x3 boxes). Arrows: arm cells sum to the bulb's own digit.
// Thermometers: strictly increasing from the bulb. X marks: the two cells
// either side sum to 10; the rules state explicitly that not every pair
// summing to 10 is marked, so unmarked adjacent pairs are unconstrained
// (X is a positive-only clue here, not exhaustive). Diagonals: both main
// diagonals are marked and both forbid repeats.

const arrows = [
  new Arrow('R2C7', 'R1C6', 'R1C5', 'R1C4'),
  new Arrow('R3C8', 'R4C7'),
  new Arrow('R3C2', 'R4C1', 'R5C1', 'R6C1'),
  new Arrow('R2C3', 'R3C4'),
  new Arrow('R7C2', 'R6C3'),
  new Arrow('R8C3', 'R9C4', 'R9C5', 'R9C6'),
  new Arrow('R8C7', 'R7C6'),
  new Arrow('R7C8', 'R6C9', 'R5C9', 'R4C9'),
];

const thermos = [
  new Thermo('R3C5', 'R2C5'),
  new Thermo('R4C3', 'R5C3'),
  new Thermo('R7C5', 'R8C5'),
  new Thermo('R6C7', 'R6C8', 'R5C8'),
];

// X marks: drawn as single edges (two-cell pairs), so each is its own X
// rather than a merged multi-cell run.
const xMarks = [
  new X('R3C9', 'R4C9'),
  new X('R9C6', 'R9C7'),
];

const diagonals = [
  new Diagonal(-1), // R1C1..R9C9
  new Diagonal(1),  // R9C1..R1C9
];

return [
  new Shape('9x9'),
  ...arrows,
  ...thermos,
  ...xMarks,
  ...diagonals,
];
