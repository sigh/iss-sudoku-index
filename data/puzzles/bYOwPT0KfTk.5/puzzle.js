// Title: Dec. 18, 2022: Feliz Naviquad
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=bYOwPT0KfTk
// Source: https://tinyurl.com/muf297kw

// Normal sudoku rules apply. Circles: the listed digits each appear among the
// four surrounding cells, in some order -> Quad(topLeftCell, ...values).

const quads = [
  new Quad('R1C2', 1, 2, 3, 4),
  new Quad('R1C5', 2, 3, 7, 8),
  new Quad('R2C8', 3, 4, 5, 6),
  new Quad('R3C5', 4, 5, 6, 7),
  new Quad('R4C1', 2, 6, 7, 9),
  new Quad('R4C3', 2, 3, 4, 5),
  new Quad('R5C6', 6, 7, 8, 9),
  new Quad('R5C8', 2, 3, 5, 6),
  new Quad('R6C4', 2, 3, 8, 9),
  new Quad('R7C1', 1, 2, 7, 8),
  new Quad('R8C4', 3, 4, 6, 7),
  new Quad('R8C7', 5, 6, 7, 8),
];

return [
  new Shape('9x9'),
  ...quads,
];
