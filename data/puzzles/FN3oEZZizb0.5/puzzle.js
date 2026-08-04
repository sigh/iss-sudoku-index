// Title: April 3, 2023: Longbows
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=FN3oEZZizb0
// Source: https://tinyurl.com/wyrtxmjd

// Normal sudoku rules apply.
// Arrow: digits along an arrow sum to the circled total; the circle sits on a
// grid cell rather than showing its total directly, so that cell's own digit
// is the total. Each drawn arrow here is a 4-cell bulb+tail; Arrow's first
// argument is the bulb (the total) and the remaining arguments are the tail
// cells that must sum to it. Digits may repeat along an arrow when sudoku
// itself allows it (Arrow adds no all-different of its own).
return [
  new Shape('9x9'),

  new Given('R1C5', 8),
  new Given('R2C5', 5),
  new Given('R3C5', 4),
  new Given('R4C5', 1),
  new Given('R5C1', 4),
  new Given('R5C2', 9),
  new Given('R5C3', 1),
  new Given('R5C4', 5),
  new Given('R5C5', 7),
  new Given('R5C6', 6),
  new Given('R5C7', 2),
  new Given('R5C8', 8),
  new Given('R5C9', 3),
  new Given('R6C5', 2),
  new Given('R7C5', 3),
  new Given('R8C5', 9),
  new Given('R9C5', 6),

  new Arrow('R2C3', 'R2C4', 'R3C5', 'R4C5'),
  new Arrow('R8C7', 'R8C6', 'R7C5', 'R6C5'),
  new Arrow('R7C8', 'R6C8', 'R5C7', 'R5C6'),
  new Arrow('R8C9', 'R7C9', 'R6C9', 'R5C9'),
  new Arrow('R2C1', 'R3C1', 'R4C1', 'R5C1'),
  new Arrow('R3C2', 'R4C2', 'R5C3', 'R5C4'),
  new Arrow('R8C8', 'R9C8', 'R9C7', 'R9C6'),
  new Arrow('R2C2', 'R1C2', 'R1C3', 'R1C4'),
  new Arrow('R1C9', 'R2C8', 'R3C7', 'R4C6'),
  new Arrow('R9C1', 'R8C2', 'R7C3', 'R6C4'),
];
