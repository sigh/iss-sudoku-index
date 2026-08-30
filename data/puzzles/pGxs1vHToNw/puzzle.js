// Title: Untitled
// Author: Unknown
// Video: https://www.youtube.com/watch?v=pGxs1vHToNw
// Source: https://cracking-the-cryptic.web.app/sudoku/mgp6LprDM8

// Plain classic sudoku: default row/column/box all-different groups only.
// The payload carries no rules text and no geometry beyond givens and the
// standard 3x3 box regions -- no lines, cages, arrows, or overlays -- so
// there is nothing else to encode. Givens transcribed from the payload's
// `cells` array (row-major, 0-indexed, converted to R#C#).

return [
  new Shape('9x9'),

  new Given('R1C1', 8),
  new Given('R1C7', 1),
  new Given('R2C2', 1),
  new Given('R2C4', 7),
  new Given('R2C5', 9),
  new Given('R2C7', 5),
  new Given('R2C8', 6),
  new Given('R3C3', 7),
  new Given('R3C4', 1),
  new Given('R3C6', 8),
  new Given('R3C8', 4),
  new Given('R4C1', 5),
  new Given('R4C2', 7),
  new Given('R4C5', 2),
  new Given('R4C7', 4),
  new Given('R5C3', 8),
  new Given('R5C5', 1),
  new Given('R5C7', 7),
  new Given('R5C8', 9),
  new Given('R5C9', 5),
  new Given('R6C1', 1),
  new Given('R6C3', 3),
  new Given('R6C5', 5),
  new Given('R6C8', 8),
  new Given('R7C1', 7),
  new Given('R7C3', 1),
  new Given('R7C6', 3),
  new Given('R7C9', 6),
  new Given('R8C8', 1),
  new Given('R9C3', 2),
  new Given('R9C6', 1),
  new Given('R9C7', 9),
];
