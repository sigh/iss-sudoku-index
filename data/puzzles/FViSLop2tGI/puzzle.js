// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=FViSLop2tGI
// Source: https://app.crackingthecryptic.com/RT3gNDfh6H

// Normal sudoku rules apply. Standard 3x3 box regions; no other constraints.
// Givens transcribed from the payload's `cells` array.
return [
  new Shape('9x9'),

  new Given('R1C3', 8),
  new Given('R1C5', 9),
  new Given('R1C8', 5),
  new Given('R2C2', 3),
  new Given('R2C6', 1),
  new Given('R3C1', 4),
  new Given('R3C4', 6),
  new Given('R3C9', 7),
  new Given('R4C6', 4),
  new Given('R4C9', 8),
  new Given('R5C2', 5),
  new Given('R5C8', 1),
  new Given('R6C1', 9),
  new Given('R6C4', 7),
  new Given('R6C7', 2),
  new Given('R7C5', 5),
  new Given('R7C7', 9),
  new Given('R8C2', 1),
  new Given('R8C8', 4),
  new Given('R9C1', 6),
  new Given('R9C4', 8),
  new Given('R9C9', 3),
];
