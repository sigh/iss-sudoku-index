// Title: Even Odd Skyscraper Sudoku
// Author: Rishi Puri
// Video: https://www.youtube.com/watch?v=1AxVH20xhH4
// Source: https://cracking-the-cryptic.web.app/sudoku/fJbnN63gBJ

// Normal sudoku: digits 1-9 once each in every row, column and 3x3 box
// (standard-aligned boxes; the payload's own region list is nine plain
// 3x3 blocks, so no explicit Regions constraint is needed).
//
// Each number also represents a skyscraper height, and digits printed
// outside the grid count the skyscrapers visible from that direction --
// omitted below: no such digits are present anywhere in this puzzle's
// border margin (checked on all four sides), so no clue values exist to
// encode.
//
// Shaded cells hold only even digits; unshaded cells hold only odd digits.
// A parity clue has no dedicated class, so each cell's domain is restricted
// directly via a multi-value Given (a candidate-restricting Given, not a
// fixed value). Shaded/unshaded partition transcribed from the payload's
// #CFCFCF underlays inside the 9x9 board (36 shaded, 4 per row/column/box;
// the remaining 45 cells are unshaded).

const givens = [
  new Given('R4C6', 9),
  new Given('R5C5', 5),
  new Given('R6C4', 6),
];

const shadedEven = [
  'R1C1', 'R1C3', 'R1C5', 'R1C6', 'R2C5', 'R2C7', 'R2C8', 'R2C9',
  'R3C1', 'R3C3', 'R3C5', 'R3C8', 'R4C4', 'R4C7', 'R4C8', 'R4C9',
  'R5C2', 'R5C4', 'R5C6', 'R5C8', 'R6C1', 'R6C2', 'R6C3', 'R6C4',
  'R7C2', 'R7C3', 'R7C7', 'R7C9', 'R8C1', 'R8C4', 'R8C5', 'R8C6',
  'R9C2', 'R9C6', 'R9C7', 'R9C9',
].map((cell) => new Given(cell, 2, 4, 6, 8));

const unshadedOdd = [
  'R1C2', 'R1C4', 'R1C7', 'R1C8', 'R1C9', 'R2C1', 'R2C2', 'R2C3',
  'R2C4', 'R2C6', 'R3C2', 'R3C4', 'R3C6', 'R3C7', 'R3C9', 'R4C1',
  'R4C2', 'R4C3', 'R4C5', 'R4C6', 'R5C1', 'R5C3', 'R5C5', 'R5C7',
  'R5C9', 'R6C5', 'R6C6', 'R6C7', 'R6C8', 'R6C9', 'R7C1', 'R7C4',
  'R7C5', 'R7C6', 'R7C8', 'R8C2', 'R8C3', 'R8C7', 'R8C8', 'R8C9',
  'R9C1', 'R9C3', 'R9C4', 'R9C5', 'R9C8',
].map((cell) => new Given(cell, 1, 3, 5, 7, 9));

return [
  new Shape('9x9'),
  ...givens,
  ...shadedEven,
  ...unshadedOdd,
];
