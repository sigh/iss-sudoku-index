// Title: Diagonal Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=TS0B01gqNpM
// Source: https://tinyurl.com/mr39fy8k

// Normal Sudoku rules apply. Both main diagonals are marked (payload
// `diagonal+`/`diagonal-`), so digits cannot repeat on either.

return [
  new Shape('9x9'),

  new Given('R1C2', 1),
  new Given('R1C3', 2),
  new Given('R1C8', 3),
  new Given('R2C1', 4),
  new Given('R2C3', 3),
  new Given('R3C1', 5),
  new Given('R3C2', 6),
  new Given('R3C5', 2),
  new Given('R3C6', 3),
  new Given('R3C9', 4),
  new Given('R4C5', 1),
  new Given('R4C7', 3),
  new Given('R5C3', 5),
  new Given('R5C4', 7),
  new Given('R5C6', 2),
  new Given('R5C7', 4),
  new Given('R6C3', 6),
  new Given('R6C5', 8),
  new Given('R7C1', 6),
  new Given('R7C4', 1),
  new Given('R7C5', 9),
  new Given('R7C8', 4),
  new Given('R7C9', 5),
  new Given('R8C7', 7),
  new Given('R8C9', 6),
  new Given('R9C2', 5),
  new Given('R9C7', 8),
  new Given('R9C8', 9),

  // diagonal+ (payload) is the '/' diagonal, R9C1-R1C9.
  new Diagonal(1),
  // diagonal- (payload) is the '\' diagonal, R1C1-R9C9.
  new Diagonal(-1),
];
