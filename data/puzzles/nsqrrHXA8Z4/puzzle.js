// Title: One Trick That Keeps Coming Up in The NYT Hard Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=nsqrrHXA8Z4

// Rules (video description): Simon live-solves the NYT "Hard" Sudoku on
// 11 Sep 18. No online source exists for this puzzle; Shape('9x9') supplies
// the row/column/box groups for standard sudoku rules.

// Givens: the 22 digits shown in the archived pristine starting grid
// (external-video-frame-35s.jpg), cross-checked against the same bold
// digits still visible at external-video-frame-90s.jpg (no digit has been
// placed beyond these).
return [
  new Shape('9x9'),

  new Given('R1C1', 8),
  new Given('R1C2', 9),
  new Given('R1C8', 6),
  new Given('R2C6', 4),
  new Given('R2C7', 2),
  new Given('R2C9', 1),
  new Given('R3C3', 4),
  new Given('R3C9', 3),
  new Given('R4C1', 9),
  new Given('R4C2', 7),
  new Given('R4C5', 8),
  new Given('R5C4', 5),
  new Given('R6C2', 5),
  new Given('R6C5', 6),
  new Given('R6C8', 1),
  new Given('R7C1', 7),
  new Given('R7C2', 3),
  new Given('R7C6', 9),
  new Given('R7C7', 6),
  new Given('R8C8', 5),
  new Given('R9C1', 1),
  new Given('R9C6', 2),
];
