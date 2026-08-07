// Title: September 28, 2022: Antiking
// Author: clover!
// Video: https://www.youtube.com/watch?v=IbyFPWoj7JA
// Source: https://tinyurl.com/m6jwcbmw

// Normal sudoku rules apply (rows, columns, boxes all-different -- ISS
// defaults). Additionally, identical digits must never touch diagonally:
// AntiKing forbids equal values on cells a diagonal king's-step apart, which
// is exactly the stated rule (ISS's AntiKing handler only excludes the two
// diagonal offsets, not the orthogonal ones, despite the class name).
return [
  new Shape('9x9'),
  new AntiKing(),

  // Givens, transcribed from the puzzle grid (row, col: value), 1-indexed.
  new Given('R2C4', 2), new Given('R2C5', 8), new Given('R2C6', 4),
  new Given('R3C3', 6), new Given('R3C7', 8), new Given('R3C8', 5),
  new Given('R4C3', 3), new Given('R4C4', 4), new Given('R4C5', 5), new Given('R4C7', 1),
  new Given('R5C3', 2), new Given('R5C7', 6),
  new Given('R6C3', 1), new Given('R6C5', 9), new Given('R6C6', 8), new Given('R6C7', 7),
  new Given('R7C2', 8), new Given('R7C3', 4), new Given('R7C7', 2),
  new Given('R8C4', 9), new Given('R8C5', 4), new Given('R8C6', 1),
];
