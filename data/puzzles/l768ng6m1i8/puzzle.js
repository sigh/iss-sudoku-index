// Title: Drop Bear
// Author: starwarigami
// Video: https://www.youtube.com/watch?v=l768ng6m1i8
// Source: https://sudokupad.app/qj5fmj2art

// Standard sudoku with anti-knight and two region-sum lines. No givens.
// Two rectangles/circle drawn in the payload are decorative (they sketch
// the "Drop Bear" artwork) and are not encoded -- the rules text names no
// cages or shaded cells.

// Region-sum line cell paths, taken directly from the payload's
// regionsum/line arrays (both agree on the same cell lists).
const lineA = [
  'R5C5', 'R5C6', 'R5C7', 'R4C8', 'R3C9', 'R2C8', 'R1C7', 'R2C6',
  'R3C6', 'R4C6', 'R4C5', 'R3C5', 'R3C4', 'R4C4', 'R5C4', 'R5C3',
  'R6C3', 'R6C4', 'R6C5', 'R7C5', 'R8C4', 'R8C3', 'R9C3', 'R9C4',
  'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R8C9', 'R7C9', 'R6C9', 'R5C8',
];
const lineB = ['R6C1', 'R6C2', 'R7C2', 'R8C2', 'R9C2'];

return [
  new Shape('9x9'),
  new AntiKnight(),
  new RegionSumLine(...lineA),
  new RegionSumLine(...lineB),
];
