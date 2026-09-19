// Title: NYT Hard Sudoku: one way through it
// Author: Unknown
// Video: https://www.youtube.com/watch?v=x3CVGXkRBjM

// Rules (video description): Mark has a go at a New York Times "Hard"
// puzzle. No online source exists for this puzzle; Shape('9x9') supplies
// the row/column/box groups for standard sudoku rules.

// Givens: the 25 digits shown in the archived pristine starting grid
// (external-video-frame-35s.jpg), cross-checked against the same bold
// digits still visible at external-video-frame-90s.jpg (no digit has been
// placed beyond these -- only small pencil marks have been added).
return [
  new Shape('9x9'),

  new Given('R1C2', 7),
  new Given('R1C4', 4),
  new Given('R1C5', 8),
  new Given('R1C7', 1),
  new Given('R1C8', 3),
  new Given('R3C4', 5),
  new Given('R3C5', 6),
  new Given('R3C8', 8),
  new Given('R4C2', 6),
  new Given('R4C6', 8),
  new Given('R4C8', 7),
  new Given('R5C2', 4),
  new Given('R5C3', 1),
  new Given('R5C6', 6),
  new Given('R6C3', 8),
  new Given('R6C8', 1),
  new Given('R7C2', 9),
  new Given('R7C4', 3),
  new Given('R7C7', 2),
  new Given('R7C9', 8),
  new Given('R8C3', 5),
  new Given('R8C6', 2),
  new Given('R9C1', 4),
  new Given('R9C5', 7),
  new Given('R9C7', 5),
];
