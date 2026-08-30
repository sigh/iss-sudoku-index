// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=f-o2RxvdZvw
// Source: https://cracking-the-cryptic.web.app/sudoku/LGFL83r67M

// Standard Sudoku: rows, columns and 3x3 boxes each contain 1-9 once.
// The payload carries no rules text and no geometry beyond the 28 givens
// and the standard 3x3 box regions, so rows/columns/boxes (the ISS default
// for Shape('9x9')) plus the givens is the whole rule set.
return [
  new Shape('9x9'),
  new Given('R1C8', 1),
  new Given('R2C1', 2),
  new Given('R2C2', 1),
  new Given('R2C6', 3),
  new Given('R2C7', 4),
  new Given('R2C8', 8),
  new Given('R3C2', 3),
  new Given('R3C3', 9),
  new Given('R3C4', 8),
  new Given('R3C7', 2),
  new Given('R4C2', 6),
  new Given('R4C4', 3),
  new Given('R4C6', 4),
  new Given('R4C7', 9),
  new Given('R6C3', 1),
  new Given('R6C4', 6),
  new Given('R6C6', 7),
  new Given('R6C8', 4),
  new Given('R7C3', 8),
  new Given('R7C6', 2),
  new Given('R7C7', 1),
  new Given('R7C8', 7),
  new Given('R8C2', 2),
  new Given('R8C3', 6),
  new Given('R8C4', 7),
  new Given('R8C8', 9),
  new Given('R8C9', 8),
  new Given('R9C2', 9),
];
