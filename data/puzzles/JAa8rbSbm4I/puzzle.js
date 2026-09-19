// Title: The New York Times "Hard" Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=JAa8rbSbm4I

// Rules: no rules panel is visible on screen. Plain classic sudoku: digits
// 1-9 in every row, column and 3x3 box; Shape('9x9') supplies all three
// groups.

// Givens: the 24 digits visible in an early frame of the video, taken before
// the presenter has placed any digit (the top-left cell is still empty).
// Cross-checked against a later mid-solve frame: every given here still
// reads the same value there, and the mid-solve frame's one additional
// filled cell (R1C1=6, shown selected) plus pencil-mark candidates are
// absent from the early frame, confirming R1C1 is a solved cell, not a
// given.
return [
  new Shape('9x9'),

  new Given('R1C2', 1),
  new Given('R1C3', 2),
  new Given('R1C9', 9),
  new Given('R2C7', 5),
  new Given('R2C9', 6),
  new Given('R3C3', 4),
  new Given('R3C5', 9),
  new Given('R3C8', 8),
  new Given('R4C5', 6),
  new Given('R4C7', 7),
  new Given('R5C2', 2),
  new Given('R5C5', 4),
  new Given('R5C6', 5),
  new Given('R5C7', 1),
  new Given('R6C1', 1),
  new Given('R6C4', 2),
  new Given('R7C2', 3),
  new Given('R7C3', 6),
  new Given('R7C4', 4),
  new Given('R7C6', 7),
  new Given('R7C8', 5),
  new Given('R8C4', 5),
  new Given('R9C3', 1),
  new Given('R9C6', 3),
];
