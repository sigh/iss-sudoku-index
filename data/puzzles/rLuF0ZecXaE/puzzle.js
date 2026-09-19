// Title: Sudoku Mastery: X Wings, Y Wings & XY Chains
// Author: Unknown
// Video: https://www.youtube.com/watch?v=rLuF0ZecXaE

// Rules (video description): Simon attempts to live-solve a Diabolical Sudoku
// from The Daily Telegraph. No online source exists for this puzzle;
// Shape('9x9') supplies the row/column/box groups for standard sudoku rules.

// Givens: the 27 digits shown in the archived on-screen solving-tool grid,
// matching at both external-video-frame-35s.jpg and
// external-video-frame-90s.jpg (no digit has yet been placed beyond these;
// the small grey numbers visible in either frame are the tool's own
// auto-computed pencil-mark candidates, not clues).
return [
  new Shape('9x9'),

  new Given('R1C3', 2),
  new Given('R1C4', 3),
  new Given('R2C2', 9),
  new Given('R2C5', 7),
  new Given('R2C6', 4),
  new Given('R2C7', 8),
  new Given('R2C8', 2),
  new Given('R3C7', 9),
  new Given('R3C9', 6),
  new Given('R4C2', 3),
  new Given('R4C4', 8),
  new Given('R4C5', 6),
  new Given('R5C1', 2),
  new Given('R5C9', 5),
  new Given('R6C5', 4),
  new Given('R6C6', 3),
  new Given('R6C8', 6),
  new Given('R7C1', 1),
  new Given('R7C3', 9),
  new Given('R7C9', 3),
  new Given('R8C2', 6),
  new Given('R8C3', 3),
  new Given('R8C4', 1),
  new Given('R8C5', 8),
  new Given('R8C8', 9),
  new Given('R9C6', 6),
  new Given('R9C7', 7),
];
