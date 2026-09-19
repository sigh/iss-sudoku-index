// Title: What Number Did The World Sudoku Champion Place Next?
// Author: Casty
// Video: https://www.youtube.com/watch?v=BV_sfQdgtF4

// Rules: standard sudoku (Shape('9x9') supplies the row/column/box groups).
// No online source exists for this puzzle -- it is a replay of Kota
// Morinishi's competition solve, so the 23 givens below are transcribed from
// the on-screen viewer's grey/black colour coding (grey = original given,
// black = Kota's own entry), read from the archived video frames.
return [
  new Shape('9x9'),

  new Given('R1C2', 5),
  new Given('R1C5', 6),
  new Given('R1C9', 1),
  new Given('R2C3', 8),
  new Given('R2C4', 9),
  new Given('R2C8', 2),
  new Given('R3C1', 1),
  new Given('R3C7', 3),
  new Given('R4C1', 2),
  new Given('R4C4', 4),
  new Given('R5C2', 4),
  new Given('R5C5', 5),
  new Given('R5C8', 6),
  new Given('R6C6', 6),
  new Given('R6C9', 9),
  new Given('R7C3', 7),
  new Given('R7C9', 2),
  new Given('R8C2', 8),
  new Given('R8C6', 4),
  new Given('R8C7', 5),
  new Given('R9C1', 9),
  new Given('R9C5', 3),
  new Given('R9C8', 4),
];
