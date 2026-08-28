// Title: Jan 31, 2022: Diagonal Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=gZRw1oD5eck
// Source: https://tinyurl.com/2p8v578u

// Normal sudoku rules apply (default row/col/box all-different; no
// `regions` override in the payload, so the 9 boxes are the default 3x3
// tiling). Both diagonals are marked (`diagonal+` and `diagonal-` are both
// true in the payload) and each must contain 1-9 exactly once.

return [
  new Shape('9x9'),
  new Given('R1C3', 7),
  new Given('R1C5', 6),
  new Given('R1C7', 4),
  new Given('R2C2', 1),
  new Given('R2C8', 6),
  new Given('R3C1', 6),
  new Given('R3C9', 3),
  new Given('R4C4', 2),
  new Given('R4C6', 7),
  new Given('R4C7', 5),
  new Given('R4C8', 1),
  new Given('R5C1', 1),
  new Given('R5C9', 4),
  new Given('R6C2', 2),
  new Given('R6C3', 4),
  new Given('R6C4', 8),
  new Given('R6C6', 3),
  new Given('R7C1', 2),
  new Given('R7C9', 5),
  new Given('R8C2', 5),
  new Given('R8C8', 4),
  new Given('R9C3', 1),
  new Given('R9C5', 5),
  new Given('R9C7', 8),
  // '/'-oriented diagonal R1C9-R9C1 (payload's diagonal+).
  new Diagonal(1),
  // '\'-oriented diagonal R1C1-R9C9 (payload's diagonal-).
  new Diagonal(-1),
];
