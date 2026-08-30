// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=FVW2a42vRu0
// Source: https://cracking-the-cryptic.web.app/sudoku/8bTGTt4mMT

// Normal sudoku rules apply. Standard 3x3 box regions; no other constraints.
// The payload carries no rules text and no cages, lines, arrows, or
// overlays -- givens transcribed from the payload's `cells` array.
return [
  new Shape('9x9'),

  new Given('R1C1', 9),
  new Given('R1C2', 7),
  new Given('R1C7', 6),
  new Given('R2C2', 1),
  new Given('R2C5', 2),
  new Given('R2C6', 6),
  new Given('R2C7', 9),
  new Given('R2C9', 5),
  new Given('R3C4', 3),
  new Given('R3C8', 1),
  new Given('R4C1', 1),
  new Given('R4C4', 9),
  new Given('R4C6', 4),
  new Given('R4C7', 5),
  new Given('R5C2', 4),
  new Given('R5C5', 5),
  new Given('R5C8', 9),
  new Given('R5C9', 1),
  new Given('R6C3', 9),
  new Given('R6C6', 8),
  new Given('R6C9', 4),
  new Given('R7C5', 4),
  new Given('R7C9', 3),
  new Given('R8C4', 5),
  new Given('R8C7', 1),
  new Given('R8C8', 2),
  new Given('R9C2', 6),
  new Given('R9C3', 1),
  new Given('R9C6', 7),
];
