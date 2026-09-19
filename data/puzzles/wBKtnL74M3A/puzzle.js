// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=wBKtnL74M3A

// Rules: standard sudoku (Shape('9x9') supplies the row/column/box groups).
// No online source exists for this puzzle -- the video names no link, only a
// prose description of a championship puzzle -- so the 26 givens below are
// transcribed from the archived video frames (35s and 90s), which are
// pixel-identical in the grid region, confirming a static pristine grid with
// no distinction needed between a given and a solver-placed digit.
return [
  new Shape('9x9'),

  new Given('R1C1', 7),
  new Given('R1C5', 8),
  new Given('R1C6', 4),
  new Given('R1C8', 9),
  new Given('R1C9', 1),
  new Given('R2C3', 8),
  new Given('R3C5', 6),
  new Given('R3C6', 5),
  new Given('R3C9', 8),
  new Given('R4C1', 9),
  new Given('R4C3', 1),
  new Given('R4C8', 4),
  new Given('R4C9', 6),
  new Given('R5C6', 3),
  new Given('R6C1', 8),
  new Given('R6C3', 4),
  new Given('R6C8', 7),
  new Given('R6C9', 2),
  new Given('R7C5', 1),
  new Given('R7C6', 6),
  new Given('R7C9', 5),
  new Given('R8C3', 9),
  new Given('R9C1', 2),
  new Given('R9C5', 7),
  new Given('R9C6', 8),
  new Given('R9C8', 6),
  new Given('R9C9', 4),
];
