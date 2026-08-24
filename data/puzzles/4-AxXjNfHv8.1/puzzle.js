// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=4-AxXjNfHv8
// Source: https://app.crackingthecryptic.com/sudoku/MpBD3DHffF

// Plain classic sudoku: normal rows/columns/boxes rules apply, no other
// clues. ISS's default 9x9 Shape already enforces row, column, and box
// all-different, so only the givens need stating.
//
// Givens transcribed from the puzzle payload's cell grid (0-indexed
// [row, col], converted here to 1-indexed R#C#):
return [
  new Shape('9x9'),

  new Given('R1C2', 4),
  new Given('R1C4', 3),
  new Given('R1C6', 7),
  new Given('R1C8', 8),

  new Given('R3C4', 5),
  new Given('R3C5', 2),
  new Given('R3C6', 1),

  new Given('R4C1', 9),
  new Given('R4C3', 1),
  new Given('R4C7', 5),
  new Given('R4C9', 2),

  new Given('R5C3', 2),
  new Given('R5C7', 6),

  new Given('R6C1', 6),
  new Given('R6C3', 5),
  new Given('R6C7', 8),
  new Given('R6C9', 3),

  new Given('R7C4', 6),
  new Given('R7C5', 1),
  new Given('R7C6', 9),

  new Given('R9C2', 5),
  new Given('R9C4', 8),
  new Given('R9C6', 3),
  new Given('R9C8', 1),
];
