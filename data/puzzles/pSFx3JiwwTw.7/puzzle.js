// Title: October 9, 2021: B1G3 Renban
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=pSFx3JiwwTw
// Source: https://tinyurl.com/s36dxbma

// Normal sudoku rules apply on a 6x6 grid: every row, column, and 2x3 box
// contains 1-6 once, which the default Shape('6x6') already enforces.
// Digits along a purple line must form a set of consecutive digits with no
// repeats (in any order). Renban is a set constraint (order-independent), so
// it needs no closed-loop repeat handling; all five lines are open.
// Line cell paths transcribed from the puzzle's drawn line geometry.

return [
  new Shape('6x6'),

  new Given('R1C1', 1),
  new Given('R1C6', 3),
  new Given('R2C1', 5),
  new Given('R2C3', 3),
  new Given('R3C6', 2),
  new Given('R6C1', 2),
  new Given('R6C6', 4),

  new Renban('R2C2', 'R2C3', 'R3C3'),
  new Renban('R1C3', 'R1C4', 'R2C4'),
  new Renban('R4C5', 'R4C6', 'R5C6'),
  new Renban('R4C3', 'R4C2', 'R5C2'),
  new Renban('R5C3', 'R6C3', 'R6C4'),
];
