// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=QVeJ5_Y4ANs
// Source: https://cracking-the-cryptic.web.app/sudoku/497rhdJp27

// Plain classic sudoku: normal rows/columns/boxes rules apply, no other
// clues. ISS's default 9x9 Shape already enforces row, column, and box
// all-different, so only the givens need stating.
//
// Givens transcribed from the puzzle payload's cell grid (0-indexed
// [row, col], converted here to 1-indexed R#C#):
return [
  new Shape('9x9'),

  new Given('R1C3', 4),
  new Given('R1C4', 7),
  new Given('R1C9', 3),

  new Given('R2C2', 3),
  new Given('R2C5', 6),
  new Given('R2C8', 9),

  new Given('R3C1', 9),
  new Given('R3C6', 1),
  new Given('R3C7', 8),

  new Given('R4C1', 8),
  new Given('R4C6', 2),
  new Given('R4C7', 5),

  new Given('R5C2', 2),
  new Given('R5C5', 7),
  new Given('R5C8', 8),

  new Given('R6C3', 1),
  new Given('R6C4', 4),
  new Given('R6C9', 7),

  new Given('R7C3', 9),
  new Given('R7C4', 5),
  new Given('R7C9', 1),

  new Given('R8C2', 5),
  new Given('R8C5', 1),
  new Given('R8C8', 3),

  new Given('R9C1', 2),
  new Given('R9C6', 6),
  new Given('R9C7', 7),
];
