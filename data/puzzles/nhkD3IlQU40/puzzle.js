// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=nhkD3IlQU40
// Source: https://app.crackingthecryptic.com/webapp/Tbff7DQgHt

// Plain classic sudoku: normal rows/columns/boxes rules apply, no other
// clues. ISS's default 9x9 Shape already enforces row, column, and box
// all-different, so only the givens need stating.
//
// Givens transcribed from the puzzle payload's cell grid (0-indexed
// [row, col], converted here to 1-indexed R#C#):
return [
  new Shape('9x9'),

  new Given('R1C2', 5),
  new Given('R1C5', 4),
  new Given('R1C8', 8),

  new Given('R2C1', 6),
  new Given('R2C3', 9),
  new Given('R2C8', 7),

  new Given('R3C1', 8),
  new Given('R3C3', 4),
  new Given('R3C8', 6),
  new Given('R3C9', 2),

  new Given('R4C1', 3),
  new Given('R4C3', 1),
  new Given('R4C7', 9),

  new Given('R5C2', 9),
  new Given('R5C3', 5),
  new Given('R5C5', 2),
  new Given('R5C6', 8),

  new Given('R6C4', 3),
  new Given('R6C6', 1),

  new Given('R7C4', 5),
  new Given('R7C5', 7),
  new Given('R7C8', 9),
  new Given('R7C9', 6),

  new Given('R8C6', 9),
  new Given('R8C9', 7),

  new Given('R9C2', 8),
  new Given('R9C5', 1),
  new Given('R9C7', 2),
  new Given('R9C9', 3),
];
