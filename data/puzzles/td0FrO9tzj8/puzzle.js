// Title: Pencilmark Sudoku
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=td0FrO9tzj8
// Source: https://f-puzzles.com/?id=yhxamj7n

// Normal sudoku rules apply. There are no given digits; instead, some cells
// are pencilmarked with a set of candidate digits, meaning the cell's digit
// must be one of that set. Each such cell is encoded as a multi-value Given
// restricting it to its drawn candidates. Cells with no pencilmark carry no
// restriction beyond normal sudoku rules.

return [
  new Shape('9x9'),

  new Given('R1C1', 1, 2),
  new Given('R1C5', 1, 4, 6),
  new Given('R1C6', 6, 9),
  new Given('R1C8', 1, 9),
  new Given('R1C9', 1, 3),

  new Given('R2C2', 1, 2, 9),
  new Given('R2C4', 1, 3),
  new Given('R2C5', 8, 9),
  new Given('R2C8', 1, 2, 3, 5, 8, 9),

  new Given('R3C3', 5, 6, 9),
  new Given('R3C6', 5, 7),
  new Given('R3C7', 7, 9),

  new Given('R4C2', 2, 3),
  new Given('R4C4', 3, 4, 5),
  new Given('R4C5', 4, 9),
  new Given('R4C6', 6, 9),
  new Given('R4C7', 5, 6),

  new Given('R5C2', 7, 9),
  new Given('R5C5', 6, 7, 8),
  new Given('R5C9', 4, 6),

  new Given('R6C3', 6, 7),
  new Given('R6C6', 1, 4, 7),
  new Given('R6C8', 4, 8),

  new Given('R7C3', 8, 9),
  new Given('R7C4', 4, 6),
  new Given('R7C7', 6, 7, 8),

  new Given('R8C3', 1, 2, 3, 8, 9),
  new Given('R8C5', 1, 2),
  new Given('R8C6', 1, 8),
  new Given('R8C8', 2, 8, 9),

  new Given('R9C1', 2, 3),
  new Given('R9C5', 5, 6),
  new Given('R9C9', 3, 4, 5),
];
