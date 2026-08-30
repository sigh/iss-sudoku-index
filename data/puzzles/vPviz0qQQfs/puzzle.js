// Title: ???
// Author: Bastien Vial-Jaime
// Video: https://www.youtube.com/watch?v=vPviz0qQQfs
// Source: https://cracking-the-cryptic.web.app/sudoku/bNBd63M6dp

// Standard Sudoku with no given digits, constrained solely by 18 quadruple
// circles: each lists digits that must appear (with multiplicity) among its
// surrounding 2x2 cells.
return [
  new Shape('9x9'),
  new Quad('R2C2', 1, 2, 8, 9),
  new Quad('R2C3', 3, 4),
  new Quad('R2C4', 4, 5, 6),
  new Quad('R4C3', 1, 6),
  new Quad('R4C4', 2, 4),
  new Quad('R6C1', 2, 5),
  new Quad('R7C1', 4, 6, 8),
  new Quad('R8C1', 3, 7),
  new Quad('R8C3', 1, 7),
  new Quad('R5C5', 3, 7),
  new Quad('R5C6', 1, 5),
  new Quad('R7C5', 5, 6),
  new Quad('R7C6', 3, 4),
  new Quad('R7C7', 8, 9),
  new Quad('R1C6', 2),
  new Quad('R1C8', 1, 2, 3),
  new Quad('R2C8', 4, 5, 6),
  new Quad('R3C8', 6, 7, 8),
];
