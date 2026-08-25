// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=mma8xJcMfTQ
// Source: https://sudokupad.app/Md74JbqTDm

// Standard Sudoku: rows, columns and 3x3 boxes as all-different groups.
// No other overlays are present in the payload.
return [
  new Shape('9x9'),

  new Given('R1C3', 6), new Given('R1C5', 9),
  new Given('R2C1', 1), new Given('R2C2', 7), new Given('R2C6', 3), new Given('R2C8', 9),
  new Given('R3C4', 7), new Given('R3C9', 5),
  new Given('R4C4', 5), new Given('R4C7', 6),
  new Given('R5C2', 9), new Given('R5C5', 3), new Given('R5C7', 2),
  new Given('R6C3', 4), new Given('R6C6', 2), new Given('R6C7', 1),
  new Given('R7C4', 9), new Given('R7C5', 7), new Given('R7C6', 8),
  new Given('R8C2', 4), new Given('R8C6', 5), new Given('R8C8', 8),
  new Given('R9C6', 6),
];
