// Title: The 2018 UK Sudoku Championship: Puzzle 3 Analysis
// Author: Unknown
// Video: https://www.youtube.com/watch?v=ZC5sPP6umfQ

// Rules: standard sudoku (Shape('9x9') supplies the row/column/box groups).
// No online source exists for this puzzle -- it is a competition puzzle from
// the 2018 UK Sudoku Championship, replayed in a generic desktop solving
// application, so the 27 givens below are transcribed from the archived
// pristine starting-grid video frame (external-video-frame-35s.jpg),
// cross-checked against the same bold digits still visible alongside the
// presenter's later entries and pencil marks in external-video-frame-90s.jpg.
return [
  new Shape('9x9'),

  new Given('R1C3', 7),
  new Given('R1C5', 5),
  new Given('R1C6', 2),
  new Given('R2C2', 3),
  new Given('R2C6', 6),
  new Given('R2C8', 9),
  new Given('R3C7', 4),
  new Given('R4C3', 5),
  new Given('R4C5', 2),
  new Given('R4C8', 1),
  new Given('R4C9', 8),
  new Given('R5C2', 6),
  new Given('R5C3', 3),
  new Given('R5C4', 1),
  new Given('R5C6', 8),
  new Given('R5C9', 7),
  new Given('R6C1', 8),
  new Given('R6C4', 5),
  new Given('R6C5', 9),
  new Given('R7C5', 3),
  new Given('R7C6', 4),
  new Given('R7C9', 2),
  new Given('R8C1', 5),
  new Given('R8C5', 1),
  new Given('R8C8', 6),
  new Given('R9C2', 8),
  new Given('R9C4', 2),
];
