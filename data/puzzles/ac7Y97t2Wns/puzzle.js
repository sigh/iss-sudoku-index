// Title: Shining Mirror
// Author: Mauricio
// Video: https://www.youtube.com/watch?v=ac7Y97t2Wns
// Source: https://cracking-the-cryptic.web.app/sudoku/jHFDQq6BtT

// Standard 9x9 sudoku: default row, column, and 3x3-box all-different
// constraints (Shape('9x9')), plus the given digits. The payload carries no
// rules text and no geometry other than the nine standard boxes -- no cages,
// lines, arrows, or overlays -- so nothing else is encoded.
// Givens transcribed from the puzzle's given-digit cells.

return [
  new Shape('9x9'),

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
