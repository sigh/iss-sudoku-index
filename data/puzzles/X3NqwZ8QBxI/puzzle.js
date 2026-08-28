// Title: The Magic Puzzle That Grades YOU!
// Author: Unknown
// Video: https://www.youtube.com/watch?v=X3NqwZ8QBxI
// Source: https://cracking-the-cryptic.web.app/sudoku/nn468RjnbB

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. The payload carries no rules text; the
// video description's only rule sentence ("put a digit in the grey cell: 1
// if you are capable, 2 if you are advanced, 3 if you are expert. Honestly!")
// tells the solver how to interpret whichever digit lands in R5C5 -- it does
// not relate that cell to any other cell, so it adds no grid constraint and
// is omitted. The puzzle is fully determined by its 27 givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C1', 2),
  new Given('R1C3', 1),
  new Given('R1C5', 7),
  new Given('R1C7', 8),
  new Given('R2C2', 4),
  new Given('R2C8', 3),
  new Given('R3C1', 8),
  new Given('R3C4', 2),
  new Given('R3C9', 5),
  new Given('R4C1', 4),
  new Given('R4C2', 7),
  new Given('R4C5', 6),
  new Given('R4C6', 5),
  new Given('R4C8', 9),
  new Given('R4C9', 3),
  new Given('R5C1', 6),
  new Given('R5C3', 5),
  new Given('R7C4', 3),
  new Given('R7C5', 4),
  new Given('R7C7', 6),
  new Given('R8C3', 4),
  new Given('R8C4', 7),
  new Given('R8C8', 1),
  new Given('R9C1', 7),
  new Given('R9C2', 9),
  new Given('R9C5', 5),
  new Given('R9C9', 8),
];
