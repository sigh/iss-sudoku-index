// Title: X Marks the Spot
// Author: Travis
// Video: https://www.youtube.com/watch?v=OCAQVwoJolQ
// Source: https://app.crackingthecryptic.com/4gBr4Dj3Rm

// Normal Sudoku rules apply. The givens below are transcribed from the grid.
return [
  new Shape('9x9'),
  new Given('R1C1', 1), new Given('R1C5', 3), new Given('R1C9', 9),
  new Given('R2C2', 2), new Given('R2C5', 4), new Given('R2C8', 8),
  new Given('R3C3', 3), new Given('R3C7', 7),
  new Given('R4C4', 4), new Given('R4C6', 3), new Given('R4C7', 5),
  new Given('R5C1', 2), new Given('R5C2', 3), new Given('R5C5', 5),
  new Given('R5C8', 7), new Given('R5C9', 8),
  new Given('R6C4', 6), new Given('R6C6', 7),
  new Given('R7C3', 7), new Given('R7C7', 3), new Given('R7C9', 5),
  new Given('R8C2', 8), new Given('R8C5', 6), new Given('R8C8', 2),
  new Given('R9C1', 9), new Given('R9C5', 7), new Given('R9C9', 1),
];
