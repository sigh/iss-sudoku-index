// Title: 9/27/22: Ready Steady Bow
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=IbyFPWoj7JA
// Source: https://tinyurl.com/y74kbee7
//
// Normal sudoku rules apply. Digits along arrows must sum to the circled
// total (Arrow). Each arrow's circle cell is also an ordinary given, since
// its value is drawn in the grid; the centre box (box 5) is given in full.

return [
  new Shape('9x9'),

  // Givens: 8 arrow-circle values + the fully given centre box (box 5).
  new Given('R1C2', 2),
  new Given('R1C7', 8),
  new Given('R2C9', 3),
  new Given('R3C1', 9),
  new Given('R4C4', 3),
  new Given('R4C5', 6),
  new Given('R4C6', 5),
  new Given('R5C4', 4),
  new Given('R5C5', 2),
  new Given('R5C6', 7),
  new Given('R6C4', 8),
  new Given('R6C5', 9),
  new Given('R6C6', 1),
  new Given('R7C9', 7),
  new Given('R8C1', 5),
  new Given('R9C3', 6),
  new Given('R9C8', 4),

  // Arrows: new Arrow(circleCell, ...pathCells) - path cells must sum to
  // the value in the circle cell.
  new Arrow('R1C2', 'R2C3', 'R3C4'),
  new Arrow('R1C7', 'R1C6', 'R1C5'),
  new Arrow('R2C9', 'R3C8', 'R4C7'),
  new Arrow('R3C1', 'R4C1', 'R5C1'),
  new Arrow('R7C9', 'R6C9', 'R5C9'),
  new Arrow('R8C1', 'R7C2', 'R6C3'),
  new Arrow('R9C3', 'R9C4', 'R9C5'),
  new Arrow('R9C8', 'R8C7', 'R7C6'),
];
