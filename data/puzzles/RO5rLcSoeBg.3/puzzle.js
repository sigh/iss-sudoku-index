// Title: Oct. 2, 2023: Average Arrows
// Author: clover!
// Video: https://www.youtube.com/watch?v=RO5rLcSoeBg
// Source: https://tinyurl.com/3z5a5cxn

// Normal sudoku rules apply.
// On every arrow, the digit in the circle equals the arithmetic mean of the
// digits on its arm; each Sum has arm coefficients 1 and bulb coefficient
// minus the number of arm cells.

return [
  new Shape('9x9'),

  // Givens from the source grid.
  new Given('R1C1', 3),
  new Given('R2C1', 8), new Given('R2C3', 1), new Given('R2C6', 5),
  new Given('R3C1', 6), new Given('R3C3', 9),
  new Given('R4C1', 4), new Given('R4C3', 7), new Given('R4C7', 1),
  new Given('R5C1', 2), new Given('R5C3', 5), new Given('R5C7', 4), new Given('R5C9', 3),
  new Given('R6C3', 3), new Given('R6C7', 5), new Given('R6C9', 7),
  new Given('R7C7', 3), new Given('R7C9', 5),
  new Given('R8C4', 5), new Given('R8C7', 9), new Given('R8C9', 2),
  new Given('R9C9', 8),

  // Arrow bulbs and arms transcribed from the source arrow entries.
  new Sum(0, 'R2C2', 'R2C3', 'R2C4', ['R1C1', -3]),
  new Sum(0, 'R3C2', 'R3C3', 'R3C4', ['R2C1', -3]),
  new Sum(0, 'R4C2', 'R4C3', 'R4C4', ['R3C1', -3]),
  new Sum(0, 'R5C2', 'R5C3', 'R5C4', ['R4C1', -3]),
  new Sum(0, 'R6C2', 'R6C3', 'R6C4', ['R5C1', -3]),
  new Sum(0, 'R4C8', 'R4C7', 'R4C6', ['R5C9', -3]),
  new Sum(0, 'R5C8', 'R5C7', 'R5C6', ['R6C9', -3]),
  new Sum(0, 'R6C8', 'R6C7', 'R6C6', ['R7C9', -3]),
  new Sum(0, 'R7C8', 'R7C7', 'R7C6', ['R8C9', -3]),
  new Sum(0, 'R8C8', 'R8C7', 'R8C6', ['R9C9', -3]),
  new Sum(0, 'R2C7', 'R2C8', ['R2C6', -2]),
  new Sum(0, 'R8C3', 'R8C2', ['R8C4', -2]),
];
