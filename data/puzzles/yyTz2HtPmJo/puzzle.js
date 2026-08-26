// Title: Seven Lines
// Author: Stephen Richards
// Video: https://www.youtube.com/watch?v=yyTz2HtPmJo
// Source: https://sudokupad.app/4bdcevn6ms
//
// Standard sudoku rules apply (rows, columns, boxes). No givens.
// Cage: killer cage, all-different, sum 9.
// Pink lines: Renban (consecutive digit set, any order).
// Blue line: same sum in each box it passes through.
// Black dots: one digit double the other. White dots: consecutive digits.
// Large white circles: each listed digit appears at least once among the
// four cells meeting at that circle's corner.

return [
  new Shape('9x9'),

  new Cage(9, 'R4C4', 'R5C4', 'R6C4'),

  // Pink lines (Renban), from the drawn pink strokes.
  new Renban('R2C4', 'R2C5', 'R2C6'),
  new Renban('R4C8', 'R5C8', 'R6C8'),
  new Renban('R8C4', 'R8C5', 'R8C6'),
  new Renban('R4C2', 'R5C2', 'R6C2'),
  new Renban('R2C1', 'R1C1', 'R1C2'),
  new Renban('R8C9', 'R9C9', 'R9C8'),

  // Blue line: equal sum within each box it passes through
  // (box 7 / box 5 / box 3 in drawn order).
  new RegionSumLine('R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7'),

  // Black dots (ratio 2:1).
  new BlackDot('R3C6', 'R4C6'),
  new BlackDot('R7C4', 'R8C4'),

  // White dots (consecutive).
  new WhiteDot('R6C5', 'R6C6'),
  new WhiteDot('R5C6', 'R6C6'),
  new WhiteDot('R4C1', 'R4C2'),
  new WhiteDot('R8C4', 'R9C4'),
  new WhiteDot('R4C3', 'R4C4'),

  // Large white circles (quadruples): each value must appear at least once
  // among the 4 cells meeting at the circle's corner. Quad anchors at the
  // top-left cell of that 2x2 corner.
  new Quad('R2C2', 1, 4, 5),
  new Quad('R2C7', 1, 3, 7),
  new Quad('R7C2', 1, 5, 8),
  new Quad('R7C7', 1, 5, 2),
  new Quad('R8C1', 6, 7, 8),
  new Quad('R1C8', 7),
];
