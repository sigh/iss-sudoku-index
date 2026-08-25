// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=DXyuUIgl3ec
// Source: https://app.crackingthecryptic.com/qhHjDLm4Tp

// Standard Sudoku only (rows, columns, 3x3 boxes -- Shape('9x9') supplies
// all three; the payload's 9 regions are exactly the default boxes). No
// cages, lines or other overlays in the payload.
return [
  new Shape('9x9'),

  new Given('R1C3', 9), new Given('R1C4', 7), new Given('R1C9', 3),
  new Given('R2C3', 4), new Given('R2C4', 5), new Given('R2C8', 9),
  new Given('R3C1', 1), new Given('R3C2', 5), new Given('R3C5', 9),
  new Given('R4C6', 1),
  new Given('R5C5', 8), new Given('R5C8', 6), new Given('R5C9', 1),
  new Given('R6C3', 2), new Given('R6C7', 8),
  new Given('R7C2', 6), new Given('R7C4', 2), new Given('R7C6', 4),
  new Given('R8C7', 7),
  new Given('R9C1', 7), new Given('R9C2', 9), new Given('R9C8', 5),
];
