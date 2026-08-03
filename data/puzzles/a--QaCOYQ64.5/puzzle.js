// Title: The Middle
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=a--QaCOYQ64
// Source: https://tinyurl.com/2r33kjzu
//
// Normal Sudoku rules apply. Digits marked in cells are all possible
// candidates for that cell: every marked cell below is restricted to its
// printed set of 2-3 digits (encoded as a multi-value Given, which fixes a
// cell's candidate set without fixing its digit). Cells with no printed
// marks keep the default 1-9 range and carry no constraint here.
//
// Candidate sets transcribed from the puzzle's printed center pencil marks.
return [
  new Shape('9x9'),

  new Given('R1C4', 1, 9),

  new Given('R2C2', 5, 6, 7),
  new Given('R2C3', 6, 7, 8),
  new Given('R2C5', 7, 9),
  new Given('R2C7', 4, 5),

  new Given('R3C2', 4, 5, 6),
  new Given('R3C6', 4, 6),
  new Given('R3C7', 2, 5),
  new Given('R3C8', 6, 7),

  new Given('R4C3', 2, 4),
  new Given('R4C4', 1, 2),
  new Given('R4C5', 2, 3),
  new Given('R4C6', 3, 4),
  new Given('R4C9', 3, 9),

  new Given('R5C2', 5, 9),
  new Given('R5C4', 1, 8),
  new Given('R5C6', 4, 5),
  new Given('R5C8', 1, 9),

  new Given('R6C1', 7, 9),
  new Given('R6C4', 7, 8),
  new Given('R6C5', 6, 7),
  new Given('R6C6', 5, 6),
  new Given('R6C7', 6, 8),

  new Given('R7C2', 7, 8),
  new Given('R7C3', 5, 8),
  new Given('R7C4', 2, 8),
  new Given('R7C8', 1, 2, 8),

  new Given('R8C3', 6, 9),
  new Given('R8C5', 3, 9),
  new Given('R8C7', 2, 3, 4),
  new Given('R8C8', 1, 2, 3),

  new Given('R9C6', 5, 9),
];
