// Title: August 12, 2023: Diagonal
// Author: clover!
// Video: https://www.youtube.com/watch?v=_GhriaUFlH4
// Source: https://tinyurl.com/5xxmya5d

// Normal sudoku rules apply. Each marked diagonal contains the digits 1-9
// exactly once each. The payload marks both diagonals active
// (diagonal+ and diagonal- both true): Diagonal(1) is the '/' diagonal
// (R9C1-R1C9), Diagonal(-1) is the '\' diagonal (R1C1-R9C9).

return [
  new Shape('9x9'),

  // Givens, transcribed from the payload's grid array.
  new Given('R1C6', 8), new Given('R1C7', 5), new Given('R1C8', 6),
  new Given('R2C1', 1), new Given('R2C9', 2),
  new Given('R3C2', 2), new Given('R3C3', 3), new Given('R3C9', 7),
  new Given('R4C4', 4),
  new Given('R5C2', 7), new Given('R5C5', 5), new Given('R5C8', 3),
  new Given('R6C6', 6),
  new Given('R7C1', 5), new Given('R7C7', 7), new Given('R7C8', 8),
  new Given('R8C1', 8), new Given('R8C9', 9),
  new Given('R9C2', 3), new Given('R9C3', 4), new Given('R9C4', 2),

  new Diagonal(1),
  new Diagonal(-1),
];
