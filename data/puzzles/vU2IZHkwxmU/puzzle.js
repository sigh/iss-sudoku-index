// Title: Thin Blue Lines
// Author: Tavaritz
// Video: https://www.youtube.com/watch?v=vU2IZHkwxmU
// Source: https://sudokupad.app/bz66g9hv44

// Standard 9x9 sudoku (default row/column/box all-different). Digits do not
// repeat in cages, which show their sums (killer-cage semantics, no
// adjacency requirement) -- Cage. Digits do not repeat on a line -- no
// adjacency arithmetic is stated, so each line is encoded as AllDifferent
// over its cell set; drawn stroke order is irrelevant to that semantics.

// Cages: cells and totals as drawn.
const cages = [
  new Cage(5, 'R1C1', 'R2C1'),
  new Cage(24, 'R2C3', 'R3C3', 'R3C2'),
  new Cage(18, 'R3C7', 'R3C9', 'R3C8'),
  new Cage(11, 'R3C4', 'R4C4'),
  new Cage(29, 'R5C6', 'R5C5', 'R6C5', 'R6C6'),
  new Cage(5, 'R8C9', 'R9C9'),
  new Cage(12, 'R7C8', 'R8C8'),
  new Cage(9, 'R7C7', 'R7C6', 'R7C5'),
  new Cage(8, 'R6C4', 'R7C4'),
];

// Lines: cell sets as drawn. The nine lines happen to partition the whole
// grid into nine 9-cell sets (a drawn-geometry fact, not an additional
// rule), but each is encoded independently per the stated rule.
const lines = [
  ['R2C7', 'R3C7', 'R2C8', 'R1C9', 'R1C8', 'R1C7', 'R1C6', 'R1C5', 'R1C4'],
  ['R2C9', 'R3C8', 'R4C7', 'R5C8', 'R6C9', 'R5C9', 'R4C9', 'R3C9', 'R4C8'],
  ['R3C6', 'R2C6', 'R2C5', 'R2C4', 'R3C5', 'R4C6', 'R5C7', 'R6C8', 'R7C9'],
  ['R1C3', 'R1C2', 'R2C3', 'R3C4', 'R4C5', 'R5C6', 'R6C7', 'R7C8', 'R8C9'],
  ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'],
  ['R2C1', 'R3C2', 'R4C3', 'R5C4', 'R6C5', 'R7C6', 'R8C7', 'R9C8', 'R9C7'],
  ['R4C1', 'R3C1', 'R4C2', 'R5C3', 'R6C4', 'R7C4', 'R7C5', 'R8C5', 'R8C6'],
  ['R6C2', 'R6C3', 'R7C3', 'R8C2', 'R8C3', 'R8C4', 'R9C4', 'R9C5', 'R9C6'],
  ['R5C2', 'R5C1', 'R6C1', 'R7C2', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3'],
].map(cells => new AllDifferent(...cells));

return [
  new Shape('9x9'),
  ...cages,
  ...lines,
];
