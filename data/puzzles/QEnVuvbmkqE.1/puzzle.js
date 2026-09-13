// Title: Close Quarters
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=QEnVuvbmkqE
// Source: https://yusitnikov.github.io/puzzletv/#1-close-quarters

// FRACTIONAL SUDOKU.
// The puzzle is a 4x4 grid of printed cells (four rows/columns of four
// printed cells each, standard 2x2 boxes). Grey lines subdivide some printed
// cells into 1-4 "cell pieces"; write a digit 1-4 in each piece; digits must
// not repeat within a printed cell; and in each row, column and box, the
// pieces holding each of the digits 1-4 must together cover exactly the
// area of one printed cell. (Equal-area pieces in the same cell may take
// their digits in either order -- an entry-order note only; this model
// treats a piece as one region, not a labelled slot, so it needs nothing
// extra.)
//
// Modelled as an 8x8 Raw-grid ISS board: each printed cell is a 2x2 block
// of ISS cells, one ISS cell per unit of area (a printed cell's area is 4
// such units). A "cell piece" is one or more ISS cells tied to a single
// digit with SameValues, so an ISS cell's value *is* its piece's digit and
// the piece's area is just its ISS-cell count. The area-conservation rule
// then becomes: across each lane's 16 ISS cells, every digit 1-4 appears in
// exactly 4 of them (ContainExact). Rows/columns of this 8x8 board are not
// Sudoku lines -- they cut across printed cells -- so the Raw grid type is
// used and every rule is stated explicitly below; nothing is implicit.
//
// Piece groups, printed-cell distinctness groups and given locations were
// derived from the source payload's "Cell Piece Boundaries" grey-line list
// and its per-cell given values, then transcribed here as literal cell
// lists.

return [
  new Shape('8x8', '1-4', 'Raw'),

  // Givens (printed digits).
  new Given('R1C7', 1),
  new Given('R5C6', 3),
  new Given('R8C3', 4),

  // Cell-piece cohesion: ISS cells that are part of the same drawn piece
  // show the same digit. Singleton (area-1) pieces need no tie. Comment
  // names the printed cell (1-indexed 4x4 grid) each piece belongs to.
  new SameValues(2, 'R1C2', 'R2C2'), // printed R1C1
  new SameValues(2, 'R1C3', 'R1C4'), // printed R1C2
  new SameValues(2, 'R2C3', 'R2C4'), // printed R1C2
  new SameValues(3, 'R1C5', 'R2C5', 'R2C6'), // printed R1C3
  new SameValues(4, 'R1C7', 'R1C8', 'R2C7', 'R2C8'), // printed R1C4
  new SameValues(4, 'R3C1', 'R3C2', 'R4C1', 'R4C2'), // printed R2C1
  new SameValues(3, 'R3C3', 'R4C3', 'R4C4'), // printed R2C2
  new SameValues(4, 'R3C5', 'R3C6', 'R4C5', 'R4C6'), // printed R2C3
  new SameValues(3, 'R3C7', 'R4C7', 'R4C8'), // printed R2C4
  new SameValues(3, 'R5C1', 'R6C1', 'R6C2'), // printed R3C1
  new SameValues(4, 'R5C3', 'R5C4', 'R6C3', 'R6C4'), // printed R3C2
  new SameValues(3, 'R5C5', 'R6C5', 'R6C6'), // printed R3C3
  new SameValues(4, 'R5C7', 'R5C8', 'R6C7', 'R6C8'), // printed R3C4
  new SameValues(2, 'R7C1', 'R8C1'), // printed R4C1
  new SameValues(2, 'R7C2', 'R8C2'), // printed R4C1
  new SameValues(2, 'R8C3', 'R8C4'), // printed R4C2
  new SameValues(4, 'R7C5', 'R7C6', 'R8C5', 'R8C6'), // printed R4C3
  new SameValues(3, 'R7C7', 'R8C7', 'R8C8'), // printed R4C4

  // Printed-cell distinctness ("digits may not repeat in a cell"): one
  // representative ISS cell per piece, AllDifferent across the printed
  // cell's pieces. Single-piece printed cells need no constraint here (a
  // lone piece can't repeat against itself).
  new AllDifferent('R1C1', 'R1C2', 'R2C1'), // printed R1C1
  new AllDifferent('R1C3', 'R2C3'), // printed R1C2
  new AllDifferent('R1C5', 'R1C6'), // printed R1C3
  new AllDifferent('R3C3', 'R3C4'), // printed R2C2
  new AllDifferent('R3C7', 'R3C8'), // printed R2C4
  new AllDifferent('R5C1', 'R5C2'), // printed R3C1
  new AllDifferent('R5C5', 'R5C6'), // printed R3C3
  new AllDifferent('R7C1', 'R7C2'), // printed R4C1
  new AllDifferent('R7C3', 'R7C4', 'R8C3'), // printed R4C2
  new AllDifferent('R7C7', 'R7C8'), // printed R4C4

  // Equal-area pieces within one printed cell are explicitly interchangeable
  // ("When cell pieces in the same cell have equal size, you may enter their
  // digits in either order"): swapping their digits gives another accepted
  // grid, so it is not itself a rule to encode. Break that harmless symmetry
  // by pinning a canonical order (later cell > earlier cell, row-major) on
  // one representative pair per equal-area group, so the search reports a
  // single representative instead of every swap of it.
  new GreaterThan('R2C1', 'R1C1'), // printed R1C1: two area-1 pieces
  new GreaterThan('R2C3', 'R1C3'), // printed R1C2: two area-2 pieces
  new GreaterThan('R7C2', 'R7C1'), // printed R4C1: two area-2 pieces
  new GreaterThan('R7C4', 'R7C3'), // printed R4C2: two area-1 pieces

  // Row/column/box area conservation: each lane is 4 printed cells = 16 ISS
  // cells (one printed cell's area = 4 ISS cells), and each digit 1-4 must
  // cover exactly one printed cell's worth of area in every lane, i.e.
  // appear in exactly 4 of the lane's 16 ISS cells.
  new ContainExact('1_1_1_1_2_2_2_2_3_3_3_3_4_4_4_4', 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8'), // row 1
  new ContainExact('1_1_1_1_2_2_2_2_3_3_3_3_4_4_4_4', 'R3C1', 'R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R4C1', 'R4C2', 'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8'), // row 2
  new ContainExact('1_1_1_1_2_2_2_2_3_3_3_3_4_4_4_4', 'R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R6C1', 'R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R6C8'), // row 3
  new ContainExact('1_1_1_1_2_2_2_2_3_3_3_3_4_4_4_4', 'R7C1', 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8', 'R8C1', 'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8'), // row 4
  new ContainExact('1_1_1_1_2_2_2_2_3_3_3_3_4_4_4_4', 'R1C1', 'R1C2', 'R2C1', 'R2C2', 'R3C1', 'R3C2', 'R4C1', 'R4C2', 'R5C1', 'R5C2', 'R6C1', 'R6C2', 'R7C1', 'R7C2', 'R8C1', 'R8C2'), // col 1
  new ContainExact('1_1_1_1_2_2_2_2_3_3_3_3_4_4_4_4', 'R1C3', 'R1C4', 'R2C3', 'R2C4', 'R3C3', 'R3C4', 'R4C3', 'R4C4', 'R5C3', 'R5C4', 'R6C3', 'R6C4', 'R7C3', 'R7C4', 'R8C3', 'R8C4'), // col 2
  new ContainExact('1_1_1_1_2_2_2_2_3_3_3_3_4_4_4_4', 'R1C5', 'R1C6', 'R2C5', 'R2C6', 'R3C5', 'R3C6', 'R4C5', 'R4C6', 'R5C5', 'R5C6', 'R6C5', 'R6C6', 'R7C5', 'R7C6', 'R8C5', 'R8C6'), // col 3
  new ContainExact('1_1_1_1_2_2_2_2_3_3_3_3_4_4_4_4', 'R1C7', 'R1C8', 'R2C7', 'R2C8', 'R3C7', 'R3C8', 'R4C7', 'R4C8', 'R5C7', 'R5C8', 'R6C7', 'R6C8', 'R7C7', 'R7C8', 'R8C7', 'R8C8'), // col 4
  new ContainExact('1_1_1_1_2_2_2_2_3_3_3_3_4_4_4_4', 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R2C1', 'R2C2', 'R2C3', 'R2C4', 'R3C1', 'R3C2', 'R3C3', 'R3C4', 'R4C1', 'R4C2', 'R4C3', 'R4C4'), // box 1
  new ContainExact('1_1_1_1_2_2_2_2_3_3_3_3_4_4_4_4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R4C5', 'R4C6', 'R4C7', 'R4C8'), // box 2
  new ContainExact('1_1_1_1_2_2_2_2_3_3_3_3_4_4_4_4', 'R5C1', 'R5C2', 'R5C3', 'R5C4', 'R6C1', 'R6C2', 'R6C3', 'R6C4', 'R7C1', 'R7C2', 'R7C3', 'R7C4', 'R8C1', 'R8C2', 'R8C3', 'R8C4'), // box 3
  new ContainExact('1_1_1_1_2_2_2_2_3_3_3_3_4_4_4_4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R6C5', 'R6C6', 'R6C7', 'R6C8', 'R7C5', 'R7C6', 'R7C7', 'R7C8', 'R8C5', 'R8C6', 'R8C7', 'R8C8'), // box 4
];
