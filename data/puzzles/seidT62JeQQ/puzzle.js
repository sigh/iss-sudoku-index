// Title: Arrow Sudoku
// Author: David Millar
// Video: https://www.youtube.com/watch?v=seidT62JeQQ
// Source: https://app.crackingthecryptic.com/sudoku/bmqB8DJJ78

// Normal sudoku rules apply. Digits on an arrow sum to the number in the
// attached circle. Every overlay circle sits on an arrow's bulb cell, so
// each Arrow's first cell is that bulb, whose digit must equal the sum of
// the remaining listed cells.

return [
  new Shape('9x9'),

  new Given('R3C3', 1),
  new Given('R3C4', 2),
  new Given('R4C4', 4),
  new Given('R4C6', 3),
  new Given('R5C5', 5),
  new Given('R6C4', 7),
  new Given('R6C6', 6),
  new Given('R7C6', 8),
  new Given('R7C7', 9),

  new Arrow('R2C8', 'R2C7', 'R2C6'),
  new Arrow('R8C2', 'R8C3', 'R8C4'),
  new Arrow('R1C9', 'R2C9', 'R3C9'),
  new Arrow('R4C9', 'R5C9', 'R6C9'),
  new Arrow('R7C9', 'R8C9', 'R9C9', 'R9C8'),
  new Arrow('R9C7', 'R9C6', 'R9C5'),
  new Arrow('R9C4', 'R9C3', 'R9C2'),
  new Arrow('R9C1', 'R8C1', 'R7C1'),
  new Arrow('R6C1', 'R5C1', 'R4C1'),
  new Arrow('R3C1', 'R2C1', 'R1C1', 'R1C2'),
  new Arrow('R1C3', 'R1C4', 'R1C5'),
  new Arrow('R1C6', 'R1C7', 'R1C8'),
];
