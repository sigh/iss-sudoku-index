// Title: February 7, 2022: Bullseye
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=0lKUNou9vuk
// Source: https://tinyurl.com/2p8bkr86

// Rules encoded: normal sudoku (Shape supplies rows/columns/boxes) plus 14
// arrows (circle = sum of the two arm cells), each drawn as a single-cell
// circle (payload `cells`) followed by a 2-cell arm (payload `lines[0]`
// minus the circle). Arrow() takes the circle cell first, then the arm
// cells. 5 of the 14 circles sit on the main diagonal and are also given.

return [
  new Shape('9x9'),

  // Givens, as drawn on the board (main diagonal, 1..9, plus 4 more).
  new Given('R1C1', 1),
  new Given('R2C2', 2),
  new Given('R2C5', 4),
  new Given('R3C3', 3),
  new Given('R3C6', 2),
  new Given('R4C4', 4),
  new Given('R5C5', 5),
  new Given('R6C6', 6),
  new Given('R7C4', 8),
  new Given('R7C7', 7),
  new Given('R8C5', 9),
  new Given('R8C8', 8),
  new Given('R9C9', 9),

  new Arrow('R1C3', 'R1C2', 'R1C1'),
  new Arrow('R2C4', 'R2C3', 'R2C2'),
  new Arrow('R3C5', 'R3C4', 'R3C3'),
  new Arrow('R4C2', 'R4C3', 'R4C4'),
  new Arrow('R5C5', 'R5C6', 'R5C7'),
  new Arrow('R5C3', 'R5C4', 'R5C5'),
  new Arrow('R6C6', 'R6C7', 'R6C8'),
  new Arrow('R6C1', 'R6C2', 'R6C3'),
  new Arrow('R7C7', 'R7C6', 'R7C5'),
  new Arrow('R8C8', 'R8C7', 'R8C6'),
  new Arrow('R9C9', 'R9C8', 'R9C7'),
  new Arrow('R9C6', 'R9C5', 'R9C4'),
  new Arrow('R1C6', 'R1C5', 'R1C4'),
  new Arrow('R4C7', 'R4C8', 'R4C9'),
];
