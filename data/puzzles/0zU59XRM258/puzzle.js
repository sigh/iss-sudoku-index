// Title: How To Solve Like The World Sudoku Champion
// Author: Unknown
// Video: https://www.youtube.com/watch?v=0zU59XRM258

// Rules (video description): Simon analyses a recent Sudoku solve by Kota
// Morinishi, the reigning World Sudoku Champion. No online source exists for
// this puzzle; Shape('9x9') supplies the row/column/box groups for standard
// sudoku rules.

// Givens: the 24 digits shown in the archived on-screen replay grid, matching
// at both external-video-frame-35s.jpg and external-video-frame-90s.jpg (no
// digit has yet been placed beyond these).
return [
  new Shape('9x9'),

  new Given('R1C3', 2),
  new Given('R1C6', 3),
  new Given('R1C7', 8),
  new Given('R2C6', 8),
  new Given('R2C7', 5),
  new Given('R3C1', 6),
  new Given('R3C2', 9),
  new Given('R3C4', 4),
  new Given('R3C9', 1),
  new Given('R4C1', 5),
  new Given('R4C2', 7),
  new Given('R4C7', 9),
  new Given('R6C3', 9),
  new Given('R6C8', 8),
  new Given('R6C9', 4),
  new Given('R7C1', 8),
  new Given('R7C6', 1),
  new Given('R7C8', 9),
  new Given('R7C9', 2),
  new Given('R8C3', 6),
  new Given('R8C4', 2),
  new Given('R9C3', 1),
  new Given('R9C4', 8),
  new Given('R9C7', 7),
];
