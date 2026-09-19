// Title: Diabolical Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=s9TkT_53c_8

// Rules (video description): "this week's Diabolical Sudoku from The Daily
// Telegraph (30 Aug 18)". No online source exists for this print puzzle;
// Shape('9x9') supplies the row/column/box groups for standard sudoku rules.

// Givens: the 27 digits shown in black (i.e. not yet solved) in the
// archived on-screen grid at 90s, external-video-frame-90s.jpg.
return [
  new Shape('9x9'),

  new Given('R1C1', 1),
  new Given('R1C5', 4),
  new Given('R1C6', 3),
  new Given('R1C9', 5),
  new Given('R3C3', 4),
  new Given('R3C4', 1),
  new Given('R3C7', 9),
  new Given('R3C9', 8),
  new Given('R4C1', 9),
  new Given('R4C6', 7),
  new Given('R4C8', 3),
  new Given('R5C1', 5),
  new Given('R5C2', 2),
  new Given('R5C5', 6),
  new Given('R5C8', 7),
  new Given('R5C9', 4),
  new Given('R6C2', 6),
  new Given('R6C4', 5),
  new Given('R6C9', 1),
  new Given('R7C1', 4),
  new Given('R7C3', 5),
  new Given('R7C6', 8),
  new Given('R7C7', 6),
  new Given('R9C1', 8),
  new Given('R9C4', 7),
  new Given('R9C5', 2),
  new Given('R9C9', 9),
];
