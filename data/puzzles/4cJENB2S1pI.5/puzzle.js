// Title: Hawkeye
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=4cJENB2S1pI
// Source: https://tinyurl.com/mwdn63pb

// Standard 9x9 sudoku (rows/columns/3x3 boxes).
// Arrows: the circled bulb cell equals the sum of the other cells along its
// arm (bulb cell listed first).
// Quadruple circles: each names the 4 digits present, in some order, in its
// surrounding 2x2 block -> Quad(topLeftCell, ...values).

return [
  new Shape('9x9'),

  new Given('R3C3', 1),
  new Given('R3C7', 2),
  new Given('R4C4', 3),
  new Given('R4C6', 5),
  new Given('R5C5', 9),
  new Given('R6C4', 8),
  new Given('R6C6', 6),
  new Given('R7C3', 7),
  new Given('R7C7', 4),

  new Arrow('R1C1', 'R1C2', 'R1C3'),
  new Arrow('R2C1', 'R2C2', 'R2C3'),
  new Arrow('R1C8', 'R2C8', 'R3C8'),
  new Arrow('R1C9', 'R2C9', 'R3C9'),
  new Arrow('R9C9', 'R9C8', 'R9C7'),
  new Arrow('R8C9', 'R8C8', 'R8C7'),
  new Arrow('R9C1', 'R8C1', 'R7C1'),
  new Arrow('R9C2', 'R8C2', 'R7C2'),
  new Arrow('R3C2', 'R4C2', 'R5C2'),
  new Arrow('R7C8', 'R6C8', 'R5C8'),
  new Arrow('R2C5', 'R2C6', 'R2C7'),
  new Arrow('R8C5', 'R8C4', 'R8C3'),

  new Quad('R1C2', 2, 3, 5, 7),
  new Quad('R2C8', 1, 3, 4, 8),
  new Quad('R8C7', 1, 3, 6, 7),
  new Quad('R7C1', 1, 2, 3, 8),
  new Quad('R4C2', 2, 4, 5, 8),
  new Quad('R5C7', 2, 3, 7, 8),
  new Quad('R2C5', 3, 7, 8, 9),
  new Quad('R7C4', 1, 5, 6, 9),
];
