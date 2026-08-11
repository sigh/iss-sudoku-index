// Title: Jul 16, 2022: Quadruple Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=N5-MQ7TWs3s
// Source: https://tinyurl.com/3uhhypx9

// Normal sudoku rules apply. Each number written in a white circle must
// appear somewhere in the four cells around that circle. Quad() encodes
// this directly: it requires every listed value to be present among the
// 2x2 block anchored at the given top-left cell. Circles listing fewer
// than 4 numbers (quads 5 and 8 below) still only require those numbers,
// once each -- no claim is made about the remaining cell(s).

// Each quad is [topLeftCell, ...values], topLeftCell being the cell whose
// bottom-right corner the circle is drawn at.
const quads = [
  ['R1C2', 2, 4, 7, 9],
  ['R1C6', 1, 2, 3, 4],
  ['R3C1', 2, 3, 5, 6],
  ['R3C8', 4, 7, 8],
  ['R6C2', 1, 2, 3],
  ['R6C8', 4, 5, 7, 8],
  ['R8C3', 6, 7, 8, 9],
  ['R8C7', 1, 5, 8, 9],
];

return [
  new Shape('9x9'),

  // Givens.
  new Given('R2C4', 8),
  new Given('R3C6', 1),
  new Given('R4C3', 3),
  new Given('R4C8', 6),
  new Given('R5C5', 5),
  new Given('R6C2', 4),
  new Given('R6C7', 7),
  new Given('R7C4', 9),
  new Given('R8C6', 2),

  ...quads.map(([topLeft, ...values]) => new Quad(topLeft, ...values)),
];
