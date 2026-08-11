// Title: Jul 28: 2022: XV Quads
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=R6NsSRivq2E
// Source: https://tinyurl.com/muvm8mrw

// Normal Sudoku rules apply. Each drawn X/V pair sums to 10/5. Each
// quadruple (white) circle lists digits that must appear somewhere in its
// surrounding 2x2 block; `Quad` anchors at the block's top-left cell, which
// is each clue's first listed cell below. The rules state only the positive
// direction ("if separated by an X or V..."), never that marked pairs are
// exhaustive, so unmarked adjacent pairs are left unconstrained rather than
// encoded with StrictXV.
return [
  new Shape('9x9'),
  new V('R2C3', 'R2C4'),
  new X('R3C2', 'R4C2'),
  new X('R8C3', 'R8C4'),
  new V('R7C2', 'R6C2'),
  new V('R8C6', 'R8C7'),
  new X('R6C8', 'R7C8'),
  new V('R3C8', 'R4C8'),
  new X('R2C6', 'R2C7'),
  new V('R5C4', 'R4C4'),
  new X('R6C6', 'R5C6'),
  new Quad('R2C2', 4, 5, 6, 7),
  new Quad('R7C2', 3, 6, 7, 8),
  new Quad('R7C7', 2, 7, 8, 9),
  new Quad('R2C7', 3, 6, 8, 9),
  new Quad('R3C4', 3, 5, 6, 8),
  new Quad('R6C5', 1, 5, 8, 9),
  new Quad('R8C5', 2, 8, 9),
  new Quad('R4C8', 7, 8, 9),
  new Quad('R5C1', 6, 7, 9),
  new Quad('R1C4', 3, 7, 9),
];
