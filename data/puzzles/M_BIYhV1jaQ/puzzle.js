// Title: Just Around the Corner
// Author: PuzzleTank
// Video: https://www.youtube.com/watch?v=M_BIYhV1jaQ
// Source: https://sudokupad.app/yv10lru0u1

// Normal sudoku rules apply. Quadruples: digits given inside a circle at a
// 4-cell intersection must appear at least once in the surrounding four
// cells. Arrows: digits along an arrow must sum to the digit in the arrow's
// circle.

return [
  new Shape('9x9'),

  new Given('R9C1', 5),

  new Arrow('R2C9', 'R3C9', 'R4C8', 'R5C7'),
  new Arrow('R8C8', 'R7C8', 'R7C7', 'R8C7'),
  new Arrow('R2C1', 'R3C1', 'R4C2', 'R5C3'),
  new Arrow('R6C9', 'R6C8', 'R6C7', 'R6C6'),
  new Arrow('R9C2', 'R9C3', 'R9C4', 'R8C5'),
  new Arrow('R4C5', 'R3C6'),

  new Quad('R2C2', 1, 4, 6, 8),
  new Quad('R2C7', 6, 7, 8, 9),
  new Quad('R7C2', 1, 3, 7, 8),
  new Quad('R5C6', 2, 3, 9),
  new Quad('R3C5', 1, 3, 4),
];
