// Title: A Sudoku Puzzle That WILL Improve Your Solving!
// Author: Oku-Yama
// Video: https://www.youtube.com/watch?v=XRfFPaUxTfM

// Rules (video description): an "Extra" difficulty Nikoli.com puzzle. No
// online source exists for this puzzle; Shape('9x9') supplies the
// row/column/box groups for standard sudoku rules.

// Givens: the 28 digits shown in the archived on-screen widget at
// external-video-frame-35s.jpg (pristine, before any digit is placed),
// cross-checked against external-video-frame-90s.jpg (mid-solve; matches on
// every still-blank-at-35s cell the presenter has since filled).
return [
  new Shape('9x9'),

  new Given('R1C2', 3),
  new Given('R1C3', 4),
  new Given('R2C1', 2),
  new Given('R2C4', 5),
  new Given('R2C8', 4),
  new Given('R3C1', 1),
  new Given('R3C5', 4),
  new Given('R3C9', 8),
  new Given('R4C6', 6),
  new Given('R4C9', 5),
  new Given('R5C2', 4),
  new Given('R5C3', 3),
  new Given('R5C7', 6),
  new Given('R5C8', 7),
  new Given('R6C1', 9),
  new Given('R6C4', 7),
  new Given('R7C1', 4),
  new Given('R7C5', 3),
  new Given('R7C9', 1),
  new Given('R8C2', 6),
  new Given('R8C6', 2),
  new Given('R8C9', 7),
  new Given('R9C7', 3),
  new Given('R9C8', 5),
];
