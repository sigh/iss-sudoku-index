// Title: Squared Circle
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=2Z_Pr6qV2mg
// Source: https://tinyurl.com/ypz8fhhb

// Standard 9x9 sudoku (rows/columns/3x3 boxes), no givens.
// Arrows: arm cells sum to the digit in the bulb cell (bulb listed first).
// Quadruple circles: each block's four printed values must appear somewhere
// in its four cells, in any order.

return [
  new Shape('9x9'),

  // Arrows (bulb first, then arm cells).
  new Arrow('R2C8', 'R3C7', 'R4C6'),
  new Arrow('R2C2', 'R3C3', 'R4C4'),
  new Arrow('R5C2', 'R5C3', 'R5C4'),
  new Arrow('R8C2', 'R7C3', 'R6C4'),
  new Arrow('R8C5', 'R7C5', 'R6C5'),
  new Arrow('R8C8', 'R7C7', 'R6C6'),
  new Arrow('R5C8', 'R5C7', 'R5C6'),
  new Arrow('R2C5', 'R3C5', 'R4C5'),

  // Quadruple circles (top-left anchor of each 2x2 block).
  new Quad('R1C1', 1, 2, 3, 5),
  new Quad('R1C8', 1, 2, 4, 6),
  new Quad('R8C8', 1, 3, 6, 7),
  new Quad('R8C1', 2, 3, 6, 9),
  new Quad('R4C2', 2, 4, 6, 7),
  new Quad('R2C5', 1, 2, 4, 7),
  new Quad('R5C7', 1, 4, 6, 8),
  new Quad('R7C4', 2, 3, 5, 9),
];
