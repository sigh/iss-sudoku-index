// Title: Fire Medallion
// Author: Wei-Hwa Huang
// Video: https://www.youtube.com/watch?v=5VkYjh1iVaM
// Source: https://sudokupad.app/DRqjhqR9dn

// Plain 9x9 sudoku (rows, columns, 3x3 boxes) with 22 givens. The rules text
// is only "Normal sudoku rules apply"; the source payload's regions are the
// standard 3x3-box partition, and it carries no other clue geometry, so
// nothing beyond the givens is encoded.
return [
  new Shape('9x9'),

  new Given('R2C4', 2),
  new Given('R2C5', 5),
  new Given('R2C8', 8),
  new Given('R3C2', 8),
  new Given('R3C3', 7),
  new Given('R3C7', 4),
  new Given('R4C2', 2),
  new Given('R4C6', 3),
  new Given('R5C2', 4),
  new Given('R5C5', 7),
  new Given('R5C8', 5),
  new Given('R6C2', 6),
  new Given('R6C3', 9),
  new Given('R6C4', 8),
  new Given('R6C8', 3),
  new Given('R7C3', 8),
  new Given('R7C4', 6),
  new Given('R7C7', 7),
  new Given('R8C4', 9),
  new Given('R8C5', 1),
  new Given('R8C6', 4),
  new Given('R8C7', 6),
];
