// Title: January 14, 2022: Egg
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=0sOQm77GSSA
// Source: https://tinyurl.com/mpphbryw

// Rules encoded here:
//   * Normal sudoku rules apply (default row/column/box all-different).
//   * Digits in grey circles must be odd -- each grey-circle cell (from the
//     payload's `odd` array) is a Given restricted to the odd digits, since
//     there is no dedicated odd/even class.
// Nothing is omitted.
return [
  new Shape('9x9'),

  new Given('R2C4', 1),
  new Given('R2C5', 2),
  new Given('R3C2', 3),
  new Given('R3C6', 4),
  new Given('R3C8', 1),
  new Given('R4C2', 2),
  new Given('R4C3', 3),
  new Given('R4C4', 4),
  new Given('R5C3', 4),
  new Given('R5C4', 5),
  new Given('R5C6', 6),
  new Given('R5C7', 7),
  new Given('R6C6', 7),
  new Given('R6C7', 8),
  new Given('R6C8', 4),
  new Given('R7C2', 5),
  new Given('R7C4', 6),
  new Given('R7C8', 7),
  new Given('R8C5', 8),
  new Given('R8C6', 9),

  // Grey (odd) circles -- transcribed from the payload's `odd` array.
  new Given('R1C4', 1, 3, 5, 7, 9),
  new Given('R1C5', 1, 3, 5, 7, 9),
  new Given('R1C6', 1, 3, 5, 7, 9),
  new Given('R1C7', 1, 3, 5, 7, 9),
  new Given('R2C3', 1, 3, 5, 7, 9),
  new Given('R2C4', 1, 3, 5, 7, 9),
  new Given('R2C7', 1, 3, 5, 7, 9),
  new Given('R2C8', 1, 3, 5, 7, 9),
  new Given('R3C1', 1, 3, 5, 7, 9),
  new Given('R3C2', 1, 3, 5, 7, 9),
  new Given('R3C3', 1, 3, 5, 7, 9),
  new Given('R3C8', 1, 3, 5, 7, 9),
  new Given('R4C1', 1, 3, 5, 7, 9),
  new Given('R4C8', 1, 3, 5, 7, 9),
  new Given('R4C9', 1, 3, 5, 7, 9),
  new Given('R5C1', 1, 3, 5, 7, 9),
  new Given('R5C9', 1, 3, 5, 7, 9),
  new Given('R6C1', 1, 3, 5, 7, 9),
  new Given('R6C2', 1, 3, 5, 7, 9),
  new Given('R6C9', 1, 3, 5, 7, 9),
  new Given('R7C2', 1, 3, 5, 7, 9),
  new Given('R7C7', 1, 3, 5, 7, 9),
  new Given('R7C8', 1, 3, 5, 7, 9),
  new Given('R7C9', 1, 3, 5, 7, 9),
  new Given('R8C2', 1, 3, 5, 7, 9),
  new Given('R8C3', 1, 3, 5, 7, 9),
  new Given('R8C6', 1, 3, 5, 7, 9),
  new Given('R8C7', 1, 3, 5, 7, 9),
  new Given('R9C3', 1, 3, 5, 7, 9),
  new Given('R9C4', 1, 3, 5, 7, 9),
  new Given('R9C5', 1, 3, 5, 7, 9),
  new Given('R9C6', 1, 3, 5, 7, 9),
];
