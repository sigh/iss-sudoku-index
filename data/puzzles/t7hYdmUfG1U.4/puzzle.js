// Title: Such Great Heights
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=t7hYdmUfG1U
// Source: https://tinyurl.com/pnszz24r

// Normal sudoku rules apply. Each Quad marks a digit that must appear
// somewhere in the surrounding 2x2 square. Top-left cell and digit list
// transcribed from the puzzle's quadruple clue markers.
return [
  new Shape('9x9'),
  new Quad('R1C1', 2, 3, 4),
  new Quad('R2C2', 5, 6, 7),
  new Quad('R3C3', 1, 2, 3, 4),
  new Quad('R4C4', 4, 5, 6),
  new Quad('R5C5', 1, 2, 3),
  new Quad('R6C6', 4, 5, 6, 7),
  new Quad('R7C7', 7, 8, 9),
  new Quad('R8C8', 1, 4, 5),
  new Quad('R3C6', 1, 5, 6),
  new Quad('R2C7', 2, 3, 4),
  new Quad('R3C8', 3, 6, 9),
  new Quad('R6C3', 1, 3, 6),
  new Quad('R7C2', 2, 4, 8),
  new Quad('R6C1', 1, 5, 9),
];
