// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=DyLYMmFeyuI

// No payload JSON and no rules text exist for this row; the video's title
// and description name it as a straightforward championship puzzle, and the
// on-screen grid carries no cages, lines, arrows or other overlays --
// normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes. The puzzle
// is fully determined by its 31 givens below.

// Givens, as transcribed from the on-screen grid (cell ids below are
// 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C1', 6),
  new Given('R1C3', 8),
  new Given('R1C7', 4),
  new Given('R1C9', 5),
  new Given('R2C5', 6),
  new Given('R2C8', 1),
  new Given('R3C1', 9),
  new Given('R3C9', 3),
  new Given('R4C5', 2),
  new Given('R5C2', 2),
  new Given('R5C4', 6),
  new Given('R5C6', 7),
  new Given('R5C8', 3),
  new Given('R6C1', 7),
  new Given('R6C5', 9),
  new Given('R6C6', 3),
  new Given('R6C7', 1),
  new Given('R6C8', 4),
  new Given('R6C9', 2),
  new Given('R7C1', 5),
  new Given('R7C6', 6),
  new Given('R7C9', 7),
  new Given('R8C1', 2),
  new Given('R8C2', 3),
  new Given('R8C5', 4),
  new Given('R8C6', 9),
  new Given('R8C9', 1),
  new Given('R9C1', 8),
  new Given('R9C3', 1),
  new Given('R9C7', 3),
  new Given('R9C9', 4),
];
