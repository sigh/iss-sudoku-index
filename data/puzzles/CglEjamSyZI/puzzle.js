// Title: Untitled
// Author: Unknown
// Video: https://www.youtube.com/watch?v=CglEjamSyZI
// Source: https://cracking-the-cryptic.web.app/sudoku/m89h6Gg373

// Plain classic sudoku: standard rows, columns and 3x3 boxes, no other
// rules. The default Sudoku grid type already enforces rows/columns/boxes,
// so only the shape and the givens need to be stated.

return [
  new Shape('9x9'),

  new Given('R1C4', 2),
  new Given('R2C1', 8),
  new Given('R2C7', 9),
  new Given('R3C2', 3),
  new Given('R3C4', 5),
  new Given('R3C5', 7),
  new Given('R3C9', 8),
  new Given('R4C2', 2),
  new Given('R4C3', 9),
  new Given('R4C6', 8),
  new Given('R4C8', 1),
  new Given('R5C3', 1),
  new Given('R5C4', 6),
  new Given('R5C6', 4),
  new Given('R5C7', 8),
  new Given('R6C2', 8),
  new Given('R6C4', 9),
  new Given('R6C7', 5),
  new Given('R6C8', 2),
  new Given('R7C1', 5),
  new Given('R7C5', 9),
  new Given('R7C6', 6),
  new Given('R7C8', 3),
  new Given('R8C3', 4),
  new Given('R8C9', 6),
  new Given('R9C6', 2),
];
