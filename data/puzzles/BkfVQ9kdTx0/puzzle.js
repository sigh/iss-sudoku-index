// Title: A Sudoku Genius: See what David McNeill's time was for this puzzle!
// Author: Unknown
// Video: https://www.youtube.com/watch?v=BkfVQ9kdTx0

// Rules: no online source exists for this puzzle (0 recorded sources, no
// payload). Normal sudoku rules apply; Shape('9x9') supplies the row/column/box
// groups. No cages, lines, arrows or other overlays are drawn in any archived
// frame.

// Givens: the 26 digits shown in the archived on-screen grid, identical at
// external-video-frame-15s.jpg, -35s.jpg and -90s.jpg.
return [
  new Shape('9x9'),

  new Given('R1C2', 7),
  new Given('R1C6', 3),
  new Given('R2C3', 2),
  new Given('R2C6', 6),
  new Given('R2C8', 7),
  new Given('R3C3', 5),
  new Given('R3C4', 7),
  new Given('R3C9', 4),
  new Given('R4C1', 4),
  new Given('R4C4', 9),
  new Given('R4C7', 2),
  new Given('R4C8', 8),
  new Given('R5C1', 2),
  new Given('R5C9', 9),
  new Given('R6C2', 8),
  new Given('R6C3', 6),
  new Given('R6C6', 1),
  new Given('R6C9', 5),
  new Given('R7C1', 3),
  new Given('R7C6', 8),
  new Given('R7C7', 7),
  new Given('R8C2', 2),
  new Given('R8C4', 1),
  new Given('R8C7', 9),
  new Given('R9C4', 3),
  new Given('R9C8', 4),
];
