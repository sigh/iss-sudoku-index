// Title: Excellent Sudoku Puzzle For Improving Your Solving!
// Author: Unknown
// Video: https://www.youtube.com/watch?v=arQb8Ytcawg

// Rules (video description): the NYT "Hard" Sudoku for 9 Oct 18. No online
// source exists for this puzzle; Shape('9x9') supplies the row/column/box
// groups for standard sudoku rules.

// Givens: the 24 digits shown in the archived pristine starting grid
// (external-video-frame-35s.jpg), cross-checked against the same bold
// digits still visible at external-video-frame-90s.jpg (only one further
// digit, R7C2, has been placed there; no given differs).
return [
  new Shape('9x9'),

  new Given('R1C1', 8),
  new Given('R1C2', 4),
  new Given('R1C5', 7),
  new Given('R1C7', 2),
  new Given('R1C8', 3),
  new Given('R2C7', 9),
  new Given('R3C3', 7),
  new Given('R3C7', 8),
  new Given('R4C3', 9),
  new Given('R4C6', 4),
  new Given('R4C7', 7),
  new Given('R4C8', 1),
  new Given('R5C5', 5),
  new Given('R5C9', 3),
  new Given('R6C1', 7),
  new Given('R6C5', 6),
  new Given('R6C6', 3),
  new Given('R7C1', 5),
  new Given('R7C3', 3),
  new Given('R8C2', 1),
  new Given('R8C6', 5),
  new Given('R8C9', 4),
  new Given('R9C2', 8),
  new Given('R9C5', 2),
];
