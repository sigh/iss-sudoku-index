// Title: 2008 World Sudoku Championship Semifinal
// Author: Hendrik Hardeman
// Video: https://www.youtube.com/watch?v=VXHKsJix42E

// Rules: no rules panel is visible on screen, and no cage, line, arrow, dot
// or other overlay is drawn on the grid in either archived frame. Plain
// classic sudoku: digits 1-9 in every row, column and 3x3 box; Shape('9x9')
// supplies all three groups.

// Givens: the 27 digits visible on the grid, transcribed from
// external-video-frame-35s.jpg and cross-checked against
// external-video-frame-90s.jpg -- both frames show the identical grid state,
// confirming no digit was added between the two captures.
return [
  new Shape('9x9'),

  new Given('R1C2', 2),
  new Given('R1C4', 7),
  new Given('R1C6', 1),
  new Given('R2C1', 1),
  new Given('R2C4', 3),
  new Given('R2C8', 5),
  new Given('R2C9', 7),
  new Given('R3C5', 5),
  new Given('R3C9', 1),
  new Given('R4C1', 5),
  new Given('R4C2', 4),
  new Given('R5C3', 2),
  new Given('R5C6', 9),
  new Given('R5C7', 6),
  new Given('R5C8', 1),
  new Given('R6C1', 6),
  new Given('R6C5', 2),
  new Given('R6C7', 4),
  new Given('R6C9', 5),
  new Given('R7C5', 7),
  new Given('R7C6', 4),
  new Given('R8C2', 5),
  new Given('R8C5', 1),
  new Given('R8C8', 3),
  new Given('R9C2', 6),
  new Given('R9C3', 9),
  new Given('R9C6', 5),
];
