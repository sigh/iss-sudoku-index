// Title: Fillomino Sudoku
// Author: spxtr
// Video: https://www.youtube.com/watch?v=14WKDmkXn3Y
// Source: https://cracking-the-cryptic.web.app/sudoku/HQGn6PG27m

// Rules encoded here:
//   Normal sudoku rules do NOT apply. Only the digits 3, 4, and 5 may ever
//   appear in the grid; every other cell stays empty. Each of 3, 4, and 5
//   appears exactly once in every row, column, and 3x3 box.
//
// Omitted: the polyomino-tiling rule -- the grid is completely covered by
// orthogonally-connected size-3/4/5 regions, every entered 3/4/5 must sit in
// a region of matching size, and two same-size regions may not share an
// edge. An unbounded, unanchored count of disconnected same-size regions has
// no faithful ISS primitive.

// Most cells hold the shared "empty" value 0, so the grid is Raw: a default
// Sudoku grid's row/column/box all-different groups would force every one of
// those repeated 0s to be distinct, which is wrong here.
const shape = new Shape('9x9', '0-5', 'Raw');
const grid = cellGraph(shape);

// Every cell is empty (0) or one of the three placeable digits.
const domain = grid.makeReplicate(new Given(grid.cells()[0], 0, 3, 4, 5));

// Given digits, drawn as colour-coded cells (colour matches the digit
// value, purely decorative -- not a separate clue).
const givens = [
  new Given('R1C9', 5),
  new Given('R2C4', 4),
  new Given('R2C7', 3),
  new Given('R3C1', 4),
  new Given('R3C4', 3),
  new Given('R3C5', 5),
  new Given('R4C3', 3),
  new Given('R4C4', 5),
  new Given('R6C5', 4),
  new Given('R7C1', 3),
  new Given('R8C3', 5),
  new Given('R9C9', 4),
];

// Exactly one 3, one 4, one 5 per row/column/box; the other six cells in
// each stay at the unrestricted "empty" value.
const oneEach = grid.rowsColumnsBoxes()
  .map(cells => new ContainExact('3_4_5', ...cells));

return [
  shape,
  domain,
  ...givens,
  ...oneEach,
];
