// Title: May 20, 2022: Leg Day
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=6oz1O-Cp95Q
// Source: https://tinyurl.com/ps88z7u3

// Normal sudoku rules apply (default rows/columns/boxes). Digits in corner
// circles must appear in the surrounding four cells, in some order: each
// quadruple is a Quad anchored at the top-left cell of its 2x2 block.

return [
  new Shape('9x9'),

  new Given('R1C9', 9),
  new Given('R2C8', 4),
  new Given('R5C5', 5),
  new Given('R8C2', 6),
  new Given('R9C1', 1),

  new Quad('R1C1', 1, 2, 3, 4),
  new Quad('R2C3', 3, 4, 5, 6),
  new Quad('R3C5', 5, 6, 7, 8),
  new Quad('R4C7', 1, 7, 8, 9),
  new Quad('R5C2', 1, 2, 3, 9),
  new Quad('R6C4', 4, 5, 6, 7),
  new Quad('R7C6', 2, 3, 4, 5),
  new Quad('R8C8', 6, 7, 8, 9),
];
