// Title: August 14, 2023: Full Circle
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=_GhriaUFlH4
// Source: https://tinyurl.com/24fsts2h

// Normal sudoku rules apply. Quadruples: digits printed at the shared corner
// of a 2x2 block must appear somewhere among that block's four cells (in any
// order, and possibly with a repeat where the block's own cells allow it).
// No given digits.
//
// Quad(topLeftCell, ...values) enforces exactly this "must appear in the
// surrounding 2x2 square" semantics. Each Quad below is transcribed from the
// source's quadruple clue data, keyed by its 2x2 block's top-left cell.
return [
  new Shape('9x9'),
  new Quad('R1C3', 1, 2, 3, 4),
  new Quad('R2C6', 2, 3, 4, 5),
  new Quad('R3C2', 3, 4, 5, 6),
  new Quad('R3C8', 1, 2, 3, 4),
  new Quad('R4C4', 5, 7, 8, 9),
  new Quad('R4C5', 3, 5, 6, 8),
  new Quad('R5C4', 2, 4, 5, 7),
  new Quad('R5C5', 1, 2, 3, 5),
  new Quad('R6C1', 6, 7, 8, 9),
  new Quad('R6C7', 4, 5, 6, 7),
  new Quad('R7C3', 5, 6, 7, 8),
  new Quad('R8C6', 6, 7, 8, 9),
];
