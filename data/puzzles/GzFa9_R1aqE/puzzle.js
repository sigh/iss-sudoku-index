// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=GzFa9_R1aqE
// Source: https://cracking-the-cryptic.web.app/sudoku/2q3HrPdTMT

// Normal sudoku rules apply: 1-9 in each row, column and 3x3 box. The payload's
// nine regions are the standard boxes, which Shape('9x9') already supplies.
// One cell, R5C5, is shaded grey. The solver enters their preferred grade from
// 1 to 7 there and then solves the grid as a classic sudoku, so that cell is
// restricted to 1-7 and nothing else fixes it: the puzzle has one completion
// per grade and this encoding admits every one of them.
// No lines, cages, arrows or other clues are drawn.

// Givens, as drawn on the board (28 printed digits).
return [
  new Shape('9x9'),

  new Given('R1C1', 8),
  new Given('R1C2', 4),
  new Given('R1C4', 5),
  new Given('R1C6', 6),
  new Given('R1C8', 7),
  new Given('R1C9', 3),
  new Given('R2C1', 6),
  new Given('R2C4', 7),
  new Given('R2C6', 8),
  new Given('R2C9', 2),
  new Given('R4C1', 3),
  new Given('R4C2', 1),
  new Given('R4C8', 2),
  new Given('R4C9', 4),
  new Given('R6C1', 2),
  new Given('R6C2', 8),
  new Given('R6C8', 6),
  new Given('R6C9', 5),
  new Given('R8C1', 1),
  new Given('R8C4', 8),
  new Given('R8C6', 3),
  new Given('R8C9', 7),
  new Given('R9C1', 7),
  new Given('R9C2', 5),
  new Given('R9C4', 4),
  new Given('R9C6', 1),
  new Given('R9C8', 8),
  new Given('R9C9', 6),

  // The grade in the grey cell: a candidate restriction to the stated 1-7.
  new Given('R5C5', 1, 2, 3, 4, 5, 6, 7),
];
