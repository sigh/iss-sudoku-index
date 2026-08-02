// Title: Breakout
// Author: BremSter
// Video: https://www.youtube.com/watch?v=vNOPtS1pjgQ
// Source: https://app.crackingthecryptic.com/sudoku/w0jq5h9rti

// Standard Sudoku, column indexing for 1s, 5s, and 9s, and the drawn quadruple circles.
return [
  new Shape('9x9'),
  new Indexing('C', ...['R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1']),
  new Indexing('C', ...['R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5']),
  new Indexing('C', ...['R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9']),
  // Quadruple-circle data transcribed from the fourteen drawn 2x2 circles.
  new Quad('R1C2', 1, 2), new Quad('R2C1', 3), new Quad('R3C5', 3),
  new Quad('R1C7', 1, 2), new Quad('R2C8', 3), new Quad('R4C1', 4),
  new Quad('R5C2', 1, 5), new Quad('R4C7', 5, 9), new Quad('R6C4', 8),
  new Quad('R5C8', 7), new Quad('R7C1', 2), new Quad('R8C2', 8, 9),
  new Quad('R8C7', 8, 9), new Quad('R7C8', 2),
];
