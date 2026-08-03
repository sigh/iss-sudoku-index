// Title: 6/7/23: A
// Author: Unknown
// Video: https://www.youtube.com/watch?v=PZ1W_HIMqdI
// Source: https://tinyurl.com/bddjvmyz

// Normal Sudoku rules apply. Cells a chess king's move apart cannot contain
// the same digit (AntiKing).
// Givens transcribed from the payload's `grid` array.
return [
  new Shape('9x9'),
  new AntiKing(),
  new Given('R2C4', 1),
  new Given('R2C5', 2),
  new Given('R2C6', 3),
  new Given('R3C3', 4),
  new Given('R3C4', 5),
  new Given('R3C6', 6),
  new Given('R3C7', 7),
  new Given('R4C3', 8),
  new Given('R4C7', 9),
  new Given('R5C2', 1),
  new Given('R5C3', 2),
  new Given('R5C7', 3),
  new Given('R5C8', 4),
  new Given('R6C2', 5),
  new Given('R6C3', 6),
  new Given('R6C4', 7),
  new Given('R6C5', 3),
  new Given('R6C6', 4),
  new Given('R6C7', 8),
  new Given('R6C8', 2),
  new Given('R7C2', 8),
  new Given('R7C8', 9),
  new Given('R8C2', 7),
  new Given('R8C8', 3),
];
