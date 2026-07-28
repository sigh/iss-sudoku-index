// Title: Mission Impossible 2
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=ZjDbulule5A
// Source: https://sudokupad.app/n5c2fyb55l

// Normal Sudoku rules apply. The four white circles and their grey arms are
// arrows; both blue main diagonals have no repeats; a single king's move may
// not join equal digits.
return [
  new Shape('9x9'),
  // Givens transcribed from the grid.
  new Given('R2C7', 3),
  new Given('R3C1', 1),
  new Given('R3C2', 6),
  new Given('R6C5', 3),
  new Given('R9C4', 7),
  new Diagonal(1),
  new Diagonal(-1),
  new AntiKing(),
  // Arrow circles and arms transcribed from the four grey arrow drawings.
  new Arrow('R7C1', 'R6C2', 'R5C2', 'R4C2'),
  new Arrow('R1C7', 'R2C6', 'R2C5', 'R2C4'),
  new Arrow('R3C9', 'R4C8', 'R5C8', 'R6C8'),
  new Arrow('R9C3', 'R8C4', 'R8C5', 'R8C6'),
];
