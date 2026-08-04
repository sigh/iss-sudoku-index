// Title: The Goblin King
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=ZJvrVG4XJn4
// Source: https://tinyurl.com/3uckpzcd

// Normal Sudoku rules apply. Cells a king's move apart (diagonally adjacent,
// including across box borders) cannot repeat a digit.

return [
  new Shape('9x9'),

  new AntiKing(),

  // Givens, transcribed from the grid payload.
  new Given('R2C2', 6),
  new Given('R2C8', 3),
  new Given('R3C4', 1),
  new Given('R3C5', 4),
  new Given('R3C6', 7),
  new Given('R4C1', 1),
  new Given('R4C2', 2),
  new Given('R4C3', 3),
  new Given('R5C4', 4),
  new Given('R5C5', 5),
  new Given('R5C6', 6),
  new Given('R6C7', 7),
  new Given('R6C8', 8),
  new Given('R6C9', 9),
  new Given('R7C4', 3),
  new Given('R7C5', 6),
  new Given('R7C6', 9),
  new Given('R8C2', 7),
  new Given('R8C8', 1),
];
