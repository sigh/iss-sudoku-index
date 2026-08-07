// Title: Oct 1, 2022: Pencilmark Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=xL75pjM7j9c
// Source: https://tinyurl.com/2rj68935

// Standard sudoku (Shape gives rows/cols/boxes; no givens). Each pre-filled
// center pencil mark restricts that cell's candidates to exactly the marked
// digits -- a candidate-restricting multi-value `Given`. Cells transcribed
// from the drawn center pencil marks; unmarked cells carry no restriction.
// All clauses of the rules text are represented; no omissions.

return [
  new Shape('9x9'),

  new Given('R1C1', 1, 2, 3),
  new Given('R1C2', 1, 2, 3),
  new Given('R1C3', 1, 2, 3),
  new Given('R1C7', 6, 7),
  new Given('R1C8', 7, 8),
  new Given('R1C9', 2, 3, 4),
  new Given('R2C1', 7, 8),
  new Given('R2C5', 6, 7),
  new Given('R2C9', 2, 3, 4),
  new Given('R3C1', 5, 6),
  new Given('R3C4', 3, 6),
  new Given('R3C5', 1, 7),
  new Given('R3C6', 2, 3),
  new Given('R3C9', 2, 3, 4),
  new Given('R4C3', 1, 2),
  new Given('R4C4', 7, 9),
  new Given('R4C6', 1, 3),
  new Given('R4C7', 1, 3),
  new Given('R5C2', 3, 4),
  new Given('R5C3', 7, 8),
  new Given('R5C7', 7, 8),
  new Given('R5C8', 4, 5),
  new Given('R6C3', 2, 4),
  new Given('R6C4', 3, 5),
  new Given('R6C6', 5, 7),
  new Given('R6C7', 3, 4),
  new Given('R7C1', 1, 2, 4),
  new Given('R7C4', 1, 4),
  new Given('R7C5', 3, 6),
  new Given('R7C6', 4, 5),
  new Given('R7C9', 5, 6),
  new Given('R8C1', 1, 2, 4),
  new Given('R8C5', 5, 6),
  new Given('R8C9', 6, 7),
  new Given('R9C1', 1, 2, 4),
  new Given('R9C2', 6, 7),
  new Given('R9C3', 5, 6),
  new Given('R9C7', 1, 3, 4),
  new Given('R9C8', 1, 3, 4),
  new Given('R9C9', 1, 3, 4),
];
