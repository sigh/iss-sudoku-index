// Title: Viewer Request: We explain how to solve this one
// Author: Unknown
// Video: https://www.youtube.com/watch?v=krLdszh7GUE

// Rules (video description): Mark talks through one way to solve a tough
// sudoku, at the request of a viewer. No online source exists for this
// puzzle; Shape('9x9') supplies the row/column/box groups for standard
// sudoku rules.

// Givens: the 25 digits shown in the archived pristine starting grid
// (external-video-frame-35s.jpg, a photographed handwritten sheet headed
// "Class 11"), cross-checked against the identical digit set rendered by
// the on-screen solving app at external-video-frame-90s.jpg.
return [
  new Shape('9x9'),

  new Given('R1C4', 6),
  new Given('R1C7', 4),
  new Given('R2C1', 7),
  new Given('R2C6', 3),
  new Given('R2C7', 6),
  new Given('R3C5', 9),
  new Given('R3C6', 1),
  new Given('R3C8', 8),
  new Given('R4C8', 1),
  new Given('R4C9', 6),
  new Given('R5C2', 5),
  new Given('R5C4', 1),
  new Given('R5C5', 8),
  new Given('R5C9', 3),
  new Given('R6C4', 3),
  new Given('R6C6', 6),
  new Given('R6C8', 4),
  new Given('R6C9', 5),
  new Given('R7C2', 4),
  new Given('R7C4', 2),
  new Given('R7C8', 6),
  new Given('R8C1', 9),
  new Given('R8C3', 3),
  new Given('R9C2', 2),
  new Given('R9C7', 1),
];
