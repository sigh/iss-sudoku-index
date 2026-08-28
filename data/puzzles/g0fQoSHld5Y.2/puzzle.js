// Title: Jan 19, 2022: Arrow Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=g0fQoSHld5Y
// Source: https://tinyurl.com/2p8vww8t

// Normal sudoku rules apply. Digits on an arrow must add up to the digit in
// the attached circle. Each arrow's circle cell is the first argument to
// Arrow; the remaining cells are the arm, summing to the circle's digit.

return [
  new Shape('9x9'),

  new Given('R1C1', 5), new Given('R1C7', 8), new Given('R1C9', 3),
  new Given('R2C4', 7),
  new Given('R3C1', 6),
  new Given('R4C4', 3), new Given('R4C6', 1), new Given('R4C8', 7),
  new Given('R5C5', 4),
  new Given('R6C2', 6), new Given('R6C4', 2), new Given('R6C6', 5),
  new Given('R7C9', 8),
  new Given('R8C6', 9),
  new Given('R9C1', 4), new Given('R9C3', 8), new Given('R9C9', 5),

  new Arrow('R3C1', 'R3C2', 'R3C3', 'R2C3'),
  new Arrow('R2C4', 'R1C4', 'R1C5', 'R1C6'),
  new Arrow('R1C7', 'R2C7', 'R2C8', 'R3C8'),
  new Arrow('R4C8', 'R4C9', 'R5C9', 'R6C9'),
  new Arrow('R7C9', 'R7C8', 'R7C7', 'R8C7'),
  new Arrow('R8C6', 'R9C6', 'R9C5', 'R9C4'),
  new Arrow('R9C3', 'R8C3', 'R8C2', 'R7C2'),
  new Arrow('R6C2', 'R6C1', 'R5C1', 'R4C1'),
];
