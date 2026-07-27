// Title: 4 Lines
// Author: Dr Logic
// Video: https://www.youtube.com/watch?v=27kcWKJ_J3M
// Source: https://sudokupad.app/eu6ibndujb

// Normal Sudoku rules apply.
//
// Each of the 4 red lines is both a region sum line (3x3 box borders split
// the line into segments that each sum to the same total, RegionSumLine's
// native semantics) and a zipper line (digits equidistant from the line's
// centre sum to the centre digit, Zipper's native semantics). Line #1 has
// only 2 cells and no drawn centre circle, so its zipper reading is
// vacuous -- Zipper on a 2-cell line just requires the single symmetric
// pair to equal itself, which is always true.
//
// Both main diagonals are marked (payload `diagonal+`/`diagonal-`), so
// digits cannot repeat on either.

return [
  new Shape('9x9'),

  new Given('R9C1', 4),

  // diagonal+ (payload) is the '/' diagonal, R9C1-R1C9.
  new Diagonal(1),
  // diagonal- (payload) is the '\' diagonal, R1C1-R9C9.
  new Diagonal(-1),

  // Line #1: R6C3-R7C4. Drawn as a red line with no centre circle.
  new RegionSumLine('R6C3', 'R7C4'),
  new Zipper('R6C3', 'R7C4'),

  // Line #2: R5C3-R4C3-R4C4-R5C5-R6C6. Centre circle at R4C4.
  new RegionSumLine('R5C3', 'R4C3', 'R4C4', 'R5C5', 'R6C6'),
  new Zipper('R5C3', 'R4C3', 'R4C4', 'R5C5', 'R6C6'),

  // Line #3: R5C7-R6C7-R6C8-R6C9-R7C9-R8C9-R7C8. Centre circle at R6C9.
  new RegionSumLine('R5C7', 'R6C7', 'R6C8', 'R6C9', 'R7C9', 'R8C9', 'R7C8'),
  new Zipper('R5C7', 'R6C7', 'R6C8', 'R6C9', 'R7C9', 'R8C9', 'R7C8'),

  // Line #4: R2C6-R1C6-R1C7-R1C8-R2C7. Centre circle at R1C7.
  new RegionSumLine('R2C6', 'R1C6', 'R1C7', 'R1C8', 'R2C7'),
  new Zipper('R2C6', 'R1C6', 'R1C7', 'R1C8', 'R2C7'),
];
