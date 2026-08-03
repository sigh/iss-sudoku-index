// Title: August 24, 2023: Antiking
// Author: clover!
// Video: https://www.youtube.com/watch?v=OE0hOXftlgw
// Source: https://tinyurl.com/2s3pjzdd

// Normal sudoku rules apply (rows, columns, boxes all-different -- ISS
// defaults). Additionally, identical digits must never touch diagonally:
// AntiKing forbids equal values on cells a diagonal king's-step apart, which
// is exactly the stated rule (ISS's AntiKing handler only excludes the two
// diagonal offsets, not the orthogonal ones, despite the class name).
return [
  new Shape('9x9'),
  new AntiKing(),

  // Givens, transcribed from the puzzle grid (row, col: value), 1-indexed.
  new Given('R1C3', 1), new Given('R1C8', 2),
  new Given('R2C1', 8), new Given('R2C2', 7), new Given('R2C3', 2), new Given('R2C8', 1),
  new Given('R3C5', 7), new Given('R3C8', 4), new Given('R3C9', 3),
  new Given('R5C1', 4), new Given('R5C3', 5), new Given('R5C7', 1), new Given('R5C9', 8),
  new Given('R7C1', 7), new Given('R7C2', 8), new Given('R7C5', 3),
  new Given('R8C2', 5), new Given('R8C7', 6), new Given('R8C8', 3), new Given('R8C9', 4),
  new Given('R9C2', 6), new Given('R9C7', 5),
];
