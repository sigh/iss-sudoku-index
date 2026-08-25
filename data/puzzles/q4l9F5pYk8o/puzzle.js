// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=q4l9F5pYk8o
// Source: https://sudokupad.app/gBG692Hh8h

// Normal sudoku rules apply (standard 3x3 boxes, per the payload's
// `regions`, which coincide with the default boxes). No other constraints.
// Givens transcribed from the drawn grid values.
return [
  new Shape('9x9'),

  new Given('R1C6', 3), new Given('R1C9', 8),
  new Given('R2C2', 6), new Given('R2C7', 1),
  new Given('R3C1', 4), new Given('R3C4', 7), new Given('R3C5', 9), new Given('R3C9', 2),
  new Given('R4C3', 1), new Given('R4C5', 6), new Given('R4C9', 4),
  new Given('R5C2', 5), new Given('R5C8', 7),
  new Given('R6C1', 8), new Given('R6C5', 2), new Given('R6C7', 9),
  new Given('R7C1', 6), new Given('R7C5', 4), new Given('R7C6', 9), new Given('R7C9', 1),
  new Given('R8C3', 7), new Given('R8C8', 5),
  new Given('R9C1', 3), new Given('R9C4', 5),
];
