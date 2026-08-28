// Title: October 9, 2021: B1G3 Arrow
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=pSFx3JiwwTw
// Source: https://tinyurl.com/6rm7fj9n

// Normal sudoku rules apply on a 6x6 grid: every row, column, and 2x3 box
// contains 1-6 once, which the default Shape('6x6') already enforces.
// Digits along each arrow's shaft sum to the digit in its circled bulb cell.
// Arrow(bulb, ...shaft) expresses exactly that.
// Arrow cell paths transcribed from the puzzle's drawn arrow geometry.

return [
  new Shape('6x6'),

  new Given('R1C1', 1),
  new Given('R1C6', 3),
  new Given('R2C1', 5),
  new Given('R2C3', 3),
  new Given('R3C6', 2),
  new Given('R6C1', 2),
  new Given('R6C6', 4),

  new Arrow('R1C3', 'R1C4', 'R2C4'),
  new Arrow('R6C4', 'R6C3', 'R5C3'),
  new Arrow('R3C3', 'R2C3', 'R2C2'),
  new Arrow('R5C2', 'R4C2', 'R4C3'),
  new Arrow('R4C5', 'R4C6', 'R5C6'),
];
