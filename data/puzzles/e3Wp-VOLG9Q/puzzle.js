// Title: Pencilmark Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=e3Wp-VOLG9Q
// Source: https://tinyurl.com/bapbrvp3

// Normal sudoku rules apply. There are no given digits; instead, some cells
// are pencilmarked with a set of candidate digits, meaning the cell's digit
// must be one of that set. Each such cell is encoded as a multi-value Given
// restricting it to its drawn candidates. Cells with no pencilmark carry no
// restriction beyond normal sudoku rules.

return [
  new Shape('9x9'),

  new Given('R1C1', 1, 2),
  new Given('R1C4', 2, 5, 6),
  new Given('R1C6', 2, 6, 7),
  new Given('R1C9', 2, 3),

  new Given('R2C2', 2, 3, 4),
  new Given('R2C5', 1, 2, 3, 4, 5, 6),
  new Given('R2C8', 1, 3, 4),

  new Given('R3C3', 2, 3, 4),
  new Given('R3C4', 2, 5, 7),
  new Given('R3C5', 1, 2, 4, 8),
  new Given('R3C6', 2, 3, 7),
  new Given('R3C7', 2, 4, 5),

  new Given('R4C1', 1, 5, 8),
  new Given('R4C2', 4, 6, 8),
  new Given('R4C8', 1, 6, 8),
  new Given('R4C9', 3, 7, 8),

  new Given('R5C3', 2, 3, 4, 5, 9),
  new Given('R5C4', 1, 2, 6, 8, 9),
  new Given('R5C5', 8, 9),
  new Given('R5C6', 1, 2, 6, 8, 9),
  new Given('R5C7', 1, 2, 5, 7, 9),

  new Given('R6C1', 1, 5, 6),
  new Given('R6C2', 4, 6, 9),
  new Given('R6C8', 1, 6, 9),
  new Given('R6C9', 3, 6, 7),

  new Given('R7C3', 3, 6, 9),
  new Given('R7C4', 5, 7, 9),
  new Given('R7C5', 1, 4, 6, 8),
  new Given('R7C6', 3, 7, 9),
  new Given('R7C7', 5, 6, 9),

  new Given('R8C2', 2, 4, 5),
  new Given('R8C5', 1, 4, 5, 6, 8, 9),
  new Given('R8C8', 1, 4, 5),

  new Given('R9C1', 1, 4),
  new Given('R9C4', 4, 5, 8),
  new Given('R9C6', 4, 7, 8),
  new Given('R9C9', 3, 4),
];
