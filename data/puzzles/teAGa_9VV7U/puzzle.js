// Title: Renban Squares
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=teAGa_9VV7U
// Source: https://sudokupad.app/190rj9itty

// Normal sudoku rules apply.
// Purple lines and grey lines each contain consecutive digits in any order,
// without repeats. Each line is drawn in the shape of a square (some lines
// trace only the four corners of the square, others also pass through the
// midpoint of each side).
// Cells separated by an X sum to 10. Cells separated by a black dot have one
// digit double the other.

return [
  new Shape('9x9'),

  // Purple renban squares (small, 4 cells)
  new Renban('R8C3', 'R9C3', 'R9C4', 'R8C4'),
  new Renban('R6C2', 'R7C1', 'R8C2', 'R7C3'),
  new Renban('R7C6', 'R8C7', 'R9C6', 'R8C5'),
  new Renban('R4C8', 'R5C7', 'R6C8', 'R5C9'),
  new Renban('R4C5', 'R5C4', 'R6C5', 'R5C6'),

  // Purple renban square (large, 8 cells)
  new Renban('R1C3', 'R2C2', 'R3C1', 'R4C2', 'R5C3', 'R4C4', 'R3C5', 'R2C4'),

  // Grey renban squares (4 cells each)
  new Renban('R2C7', 'R3C7', 'R3C8', 'R2C8'),
  new Renban('R2C3', 'R3C2', 'R4C3', 'R3C4'),
  new Renban('R7C7', 'R8C6', 'R9C7', 'R8C8'),
  new Renban('R5C8', 'R6C8', 'R6C9', 'R5C9'),
  new Renban('R5C5', 'R6C5', 'R6C6', 'R5C6'),

  // X (sum to 10)
  new X('R6C4', 'R6C5'),
  new X('R8C7', 'R8C8'),
  new X('R9C7', 'R9C8'),

  // Black dot (one digit double the other)
  new BlackDot('R4C5', 'R5C5'),
  new BlackDot('R4C8', 'R5C8'),
  new BlackDot('R8C5', 'R8C6'),
  new BlackDot('R3C4', 'R3C5'),
  new BlackDot('R3C6', 'R4C6'),
];
