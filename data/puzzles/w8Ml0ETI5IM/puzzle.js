// Title: Proximity
// Author: zetamath
// Video: https://www.youtube.com/watch?v=w8Ml0ETI5IM
// Source: https://sudokupad.app/encxi3ci5i

// Normal sudoku. Arrows: digits along an arrow sum to the digit in its circle
// (repeats allowed). Quadruples: the shown digits must each appear at least once
// among the four cells around the circle.

return [
  new Shape('9x9'),

  new Given('R8C9', 4),

  // Arrows: first cell is the circle (the sum), remaining cells are the arrow.
  new Arrow('R1C1', 'R1C2', 'R2C2', 'R2C3'),
  new Arrow('R1C4', 'R2C4', 'R3C4', 'R4C4'),
  new Arrow('R1C7', 'R2C7', 'R3C7', 'R4C7'),
  new Arrow('R4C1', 'R4C2', 'R4C3'),
  new Arrow('R9C1', 'R8C1', 'R7C1'),
  new Arrow('R7C2', 'R6C2', 'R5C2'),
  new Arrow('R9C7', 'R8C6', 'R7C5'),
  new Arrow('R9C8', 'R8C7', 'R7C6'),
  new Arrow('R2C8', 'R3C9', 'R4C9'),

  // Quadruples: Quad(topLeftCell, ...requiredValues) over the 2x2 square.
  new Quad('R2C2', 1, 2, 3),
  new Quad('R3C4', 4, 5, 6),
  new Quad('R4C6', 7, 8, 9),
  new Quad('R8C5', 7, 8),
  new Quad('R5C1', 1, 3),
  new Quad('R6C8', 2, 3),
];
