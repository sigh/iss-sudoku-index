// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=YaUH9EnMOVE
// Source: https://cracking-the-cryptic.web.app/sudoku/jHFDQq6BtT

// Classic 9x9 Sudoku. No rules text, no cages, lines, arrows, or other
// overlays -- only 24 givens and the standard nine 3x3 box regions (so no
// explicit region constraint is needed). Standard row/column/box
// all-different rules apply.

return [
  new Shape('9x9'),

  // Givens, row-major.
  new Given('R1C6', 1),
  new Given('R1C9', 2),
  new Given('R2C3', 3),
  new Given('R2C8', 4),
  new Given('R3C2', 5),
  new Given('R3C5', 6),
  new Given('R3C7', 7),
  new Given('R4C4', 8),
  new Given('R4C8', 7),
  new Given('R5C3', 7),
  new Given('R5C6', 3),
  new Given('R5C7', 8),
  new Given('R6C1', 9),
  new Given('R6C5', 5),
  new Given('R6C9', 1),
  new Given('R7C3', 6),
  new Given('R7C5', 8),
  new Given('R7C7', 2),
  new Given('R8C2', 4),
  new Given('R8C4', 6),
  new Given('R8C9', 7),
  new Given('R9C1', 2),
  new Given('R9C6', 9),
  new Given('R9C8', 6),
];
