// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=_j3nbFmTSOY

// Rules (video description): Simon steps through The Sunday Times "Very
// Hard" Sudoku (on-screen titled "Sudoku No 1277 Very hard"). No online
// source exists for this puzzle; Shape('9x9') supplies the row/column/box
// groups for standard sudoku rules.

// Givens: the 24 digits shown in the archived on-screen grid, matching at
// both external-video-frame-35s.jpg and external-video-frame-90s.jpg (no
// digit has yet been placed beyond these).
return [
  new Shape('9x9'),

  new Given('R1C1', 4),
  new Given('R1C6', 6),
  new Given('R2C4', 2),
  new Given('R2C7', 3),
  new Given('R3C5', 5),
  new Given('R3C6', 3),
  new Given('R3C7', 8),
  new Given('R4C2', 2),
  new Given('R4C5', 9),
  new Given('R4C9', 6),
  new Given('R5C3', 7),
  new Given('R5C4', 8),
  new Given('R5C9', 9),
  new Given('R6C1', 1),
  new Given('R6C3', 9),
  new Given('R6C7', 5),
  new Given('R6C9', 7),
  new Given('R7C2', 7),
  new Given('R7C3', 1),
  new Given('R7C6', 4),
  new Given('R8C8', 5),
  new Given('R9C4', 5),
  new Given('R9C5', 8),
  new Given('R9C6', 1),
];
