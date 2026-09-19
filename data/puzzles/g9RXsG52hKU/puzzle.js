// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=g9RXsG52hKU

// No payload JSON and no rules text exist for this row; the video's title
// and description name it as an unsourced race puzzle, and the on-screen
// grid carries no cages, lines, arrows or other overlays -- normal sudoku
// rules apply (1-9 in each row, column and 3x3 box). Standard 3x3 box
// regions -- Shape('9x9') supplies rows/columns/boxes. The puzzle is fully
// determined by its 26 givens below, cross-checked cell-for-cell across two
// independent video frames (35s and 90s) of the same pristine grid.
return [
  new Shape('9x9'),

  new Given('R1C3', 4),
  new Given('R1C7', 6),
  new Given('R2C3', 7),
  new Given('R2C7', 9),
  new Given('R3C1', 8),
  new Given('R3C9', 3),
  new Given('R4C2', 4),
  new Given('R4C3', 2),
  new Given('R4C5', 5),
  new Given('R4C7', 8),
  new Given('R4C8', 1),
  new Given('R5C1', 3),
  new Given('R5C9', 5),
  new Given('R6C1', 5),
  new Given('R6C4', 6),
  new Given('R6C5', 1),
  new Given('R6C6', 9),
  new Given('R6C9', 2),
  new Given('R7C4', 4),
  new Given('R7C6', 3),
  new Given('R8C1', 4),
  new Given('R8C2', 6),
  new Given('R8C8', 2),
  new Given('R8C9', 8),
  new Given('R9C4', 2),
  new Given('R9C6', 8),
];
