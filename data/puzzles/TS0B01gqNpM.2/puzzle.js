// Title: 5/14 Fruit Flies Like A Banana
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=TS0B01gqNpM
// Source: https://tinyurl.com/yc7rdm6e

// Standard 9x9 sudoku (rows/columns/3x3 boxes).
// Arrows: arm cells sum to the circled digit (bulb cell listed first). Every
// bulb here is also a given, so each Arrow doubles as a fixed-total pair sum.

return [
  new Shape('9x9'),

  new Given('R1C1', 9),
  new Given('R1C7', 5),
  new Given('R2C2', 5),
  new Given('R2C6', 6),
  new Given('R2C8', 3),
  new Given('R3C3', 8),
  new Given('R3C9', 9),
  new Given('R5C4', 6),
  new Given('R5C6', 9),
  new Given('R7C1', 7),
  new Given('R7C7', 6),
  new Given('R8C2', 2),
  new Given('R8C4', 8),
  new Given('R8C8', 7),
  new Given('R9C3', 6),
  new Given('R9C9', 8),

  new Arrow('R1C1', 'R1C2', 'R1C3'),
  new Arrow('R3C3', 'R3C2', 'R3C1'),
  new Arrow('R9C3', 'R8C3', 'R7C3'),
  new Arrow('R7C1', 'R8C1', 'R9C1'),
  new Arrow('R3C9', 'R2C9', 'R1C9'),
  new Arrow('R1C7', 'R2C7', 'R3C7'),
  new Arrow('R9C9', 'R9C8', 'R9C7'),
  new Arrow('R7C7', 'R7C8', 'R7C9'),
  new Arrow('R5C6', 'R5C7', 'R5C8'),
  new Arrow('R5C4', 'R5C3', 'R5C2'),
  new Arrow('R2C6', 'R3C6', 'R4C6'),
  new Arrow('R8C4', 'R7C4', 'R6C4'),
];
