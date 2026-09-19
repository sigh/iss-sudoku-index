// Title: Diabolical Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=yO3KUV-ZhLg

// Rules (video description): "the 'Diabolical' Sudoku from The Daily
// Telegraph of 5 Oct 18". No online source exists for this print puzzle;
// Shape('9x9') supplies the row/column/box groups for standard sudoku rules.

// Givens: the 27 digits shown in black (i.e. not yet solved) in the
// archived on-screen grid at 90s, external-video-frame-90s.jpg.
return [
  new Shape('9x9'),

  new Given('R1C3', 9),
  new Given('R1C5', 1),
  new Given('R1C7', 7),
  new Given('R1C8', 8),
  new Given('R2C7', 9),
  new Given('R2C9', 4),
  new Given('R3C4', 3),
  new Given('R3C7', 2),
  new Given('R4C2', 4),
  new Given('R4C3', 1),
  new Given('R4C4', 8),
  new Given('R4C6', 6),
  new Given('R4C8', 9),
  new Given('R5C5', 7),
  new Given('R6C2', 7),
  new Given('R6C4', 9),
  new Given('R6C6', 3),
  new Given('R6C7', 4),
  new Given('R6C8', 2),
  new Given('R7C3', 7),
  new Given('R7C6', 1),
  new Given('R8C1', 6),
  new Given('R8C3', 2),
  new Given('R9C2', 1),
  new Given('R9C3', 8),
  new Given('R9C5', 6),
  new Given('R9C7', 5),
];
