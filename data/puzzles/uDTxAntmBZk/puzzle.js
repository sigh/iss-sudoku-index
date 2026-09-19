// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=uDTxAntmBZk

// Standard Sudoku: rows, columns, and boxes each contain 1-9 once. The video
// names no source or rules text, and every archived on-screen frame (25s,
// 35s, 90s) is the same paused mid-solve instant with no cage, line, or
// other overlay drawn, so no other clue is encoded. The 26 givens below are
// the clue set read from the previous day's video
// (https://www.youtube.com/watch?v=BkfVQ9kdTx0), which shows the same
// puzzle solved from its own start: every one of that puzzle's givens
// appears at the same cell with the same value in this video's own paused
// frame, including R9C8=4, confirmed a printed given there by a frame
// showing it present before any digit was entered (mouse cursor off the
// grid entirely).
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
