// Title: A Clever Arrow Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=pRsNDS3QtaY
// Source: https://cracking-the-cryptic.web.app/sudoku/m2RMB6RpTn

// Standard Sudoku (default row/column/box all-different) plus 8 arrows:
// digits along each line sum to the digit in its circle. Arrow() takes the
// circle cell first, then the arm cells; each cell list below is ordered
// bulb-first (several of the drawn lines run tip-first, so their arm order
// here is the reverse of the drawn stroke).

return [
  new Shape('9x9'),

  new Given('R2C1', 5), new Given('R2C5', 1), new Given('R2C9', 6),
  new Given('R3C1', 1), new Given('R3C5', 4), new Given('R3C9', 3),
  new Given('R4C1', 6), new Given('R4C5', 5), new Given('R4C9', 7),
  new Given('R5C2', 7), new Given('R5C3', 8), new Given('R5C4', 9),
  new Given('R5C6', 1), new Given('R5C7', 4), new Given('R5C8', 6),
  new Given('R6C1', 9), new Given('R6C5', 7), new Given('R6C9', 2),
  new Given('R7C1', 3), new Given('R7C5', 6), new Given('R7C9', 8),
  new Given('R8C1', 4), new Given('R8C5', 2), new Given('R8C9', 1),

  new Arrow('R2C4', 'R1C3', 'R1C2'),
  new Arrow('R3C3', 'R4C2', 'R4C3', 'R4C4'),
  new Arrow('R8C3', 'R7C4', 'R6C3', 'R6C2'),
  new Arrow('R9C2', 'R9C3', 'R9C4'),
  new Arrow('R7C6', 'R8C6', 'R9C7'),
  new Arrow('R8C8', 'R7C8', 'R6C7'),
  new Arrow('R3C6', 'R4C7', 'R3C8'),
  new Arrow('R2C8', 'R1C7', 'R2C6'),
];
