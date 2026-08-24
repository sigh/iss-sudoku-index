// Title: Bermuda Quadrangles
// Author: Tyrgannus
// Video: https://www.youtube.com/watch?v=s_smhGQyDm4
// Source: https://app.crackingthecryptic.com/sudoku/P39ddFHqjJ

// Normal sudoku rules apply on the default 9x9 grid (rows, columns and
// boxes all-different) with no givens.
//
// Arrows: an arrow's bulb is a grid cell whose digit equals the sum of the
// digits on the rest of its line; two pairs of arrows here share one bulb
// cell. Arrow() takes the bulb cell first.
//
// Small circles: every digit printed near a marked grid-line junction must
// appear somewhere in the four cells around that junction -- every junction
// here sits on a 2x2 square of cells, so Quad expresses this directly.
// Six of the eight junctions render their digits split across two small
// offset circles rather than one ("a quadruple as one corner circle plus
// tiny text overlays" -- a known SudokuPad rendering choice, not a narrower
// scope); their digits are pooled into one Quad over the shared 2x2.
// Splitting them into two independent 2-cell edge clues instead is
// unsatisfiable on the base grid alone (two of the junctions would each
// force the exact pair {5,6} into the same row), so that reading is ruled
// out by internal arithmetic. The black-bordered circles centred on the
// junctions themselves, and the larger circles at the arrow bulbs, carry no
// digits and are decoration.

return [
  new Shape('9x9'),

  new Arrow('R5C8', 'R4C8', 'R3C8', 'R2C8'),
  new Arrow('R4C5', 'R3C6', 'R2C7'),
  new Arrow('R4C5', 'R3C4', 'R2C3'),
  new Arrow('R3C1', 'R3C2', 'R3C3'),
  new Arrow('R5C3', 'R5C2', 'R6C1'),
  new Arrow('R7C5', 'R7C4', 'R7C3'),
  new Arrow('R7C5', 'R7C6', 'R7C7'),
  new Arrow('R8C4', 'R8C3', 'R8C2'),
  new Arrow('R9C5', 'R9C6', 'R8C6'),

  // Split junctions (6): pooled digits over the shared 2x2 square.
  new Quad('R2C2', 5, 6, 7),
  new Quad('R2C7', 5, 6, 7),
  new Quad('R7C2', 5, 6, 7),
  new Quad('R7C7', 5, 6, 7),
  new Quad('R4C5', 4, 8, 9),
  new Quad('R5C4', 1, 2, 3),

  // Single-circle junctions (2).
  new Quad('R8C1', 3),
  new Quad('R1C7', 2),
];
