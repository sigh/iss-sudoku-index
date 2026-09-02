// Title: Fourteen
// Author: Lepton
// Video: https://www.youtube.com/watch?v=b1zwiUwWJQw
// Source: https://sudokupad.app/pc5wpuec38

// Rules encoded here:
//  1. Nine non-overlapping 3x3 boxes are drawn in a 10x10 grid, and each box
//     holds the digits 1-9 once each.
//  2. Digits cannot repeat in any row or column.
//  3. Cells outside every box do not contain digits.
// Nothing is omitted.
//
// The 10x10 canvas is Raw, not a default Sudoku-type main grid: a Sudoku main
// grid makes every row all-different over the whole alphabet, while here a row
// of ten cells holds at most one of each digit plus any number of empty cells.
// Raw carries no implicit constraints, so every rule below is stated
// explicitly. Main grid cells hold 1-9 = the digit in this cell, 0 = no digit.

const shape = new Shape('10x10', '0-9', 'Raw');

// The reference geometry over the same value range. It supplies the rows,
// columns, 3x3 windows and step arithmetic that get translated onto the cell
// groups, and the value count the custom Pair keys are built for.
const grid = cellGraph(shape);
const geom = grid.gridGeometry();
const cells = grid.cells();

// One aux group per per-cell unknown, each indexed by the grid cell it shadows.
const T = grid.makeOverlay('VT');   // 1 = a 3x3 box has its top-left corner here, 2 = no
const F = grid.makeOverlay('VF');   // 1 = this cell lies inside a box, 2 = no

const BLANK = 0;

// Every cell of an aux group keeps the same domain across the whole layer.
// The main grid needs no such Given: its 0-9 alphabet is already exactly
// "blank or a digit".
const overlayDomain = (overlay, ...values) =>
  overlay.makeReplicate(new Given(overlay.cells()[0], ...values));
const domains = [
  overlayDomain(T, 1, 2),
  overlayDomain(F, 1, 2),
];

// A box corner needs a whole 3x3 block below and right of it, so the last two
// rows and the last two columns cannot start one.
const cornerRoom = T.makeReplicate(
  new Given(T.cells()[0], 2),
  T.at(cells.filter(cell => grid.block(cell, 3, 3) === null)));

const filledKey = Pair.fnToKey((d, f) => (d !== BLANK) === (f === 1), geom);
const filled = cells.map(cell => new Pair(filledKey, 'filled', cell, F.at(cell)));

// A cell is inside a box exactly when one box corner sits in the 3x3 window that
// ends at it, and no more than one may: that single equation is both "the boxes
// cover the filled cells" and "the boxes do not overlap". Both groups are
// 1 = yes / 2 = no, so a count of yeses over n cells is 2n minus their sum.
const coverage = cells.map(cell => {
  const window = [];
  for (let dRow = -2; dRow <= 0; dRow++) for (let dCol = -2; dCol <= 0; dCol++) {
    const corner = grid.step(cell, dRow, dCol);
    if (corner !== null) window.push(T.at(corner));
  }
  // At R1C1 the window is the cell itself and the equation degenerates to
  // "R1C1 is filled exactly when a box starts there".
  return window.length === 1
    ? new SameValues(2, window[0], F.at(cell))
    : new Sum(2 * window.length - 2, ...window, [F.at(cell), -1]);
});

// Nine boxes of nine cells fill 81 of the 100 cells.
const boxTotal = new Sum(2 * cells.length - 81, ...F.cells());

// Where a box does start, its nine cells are all different; every cell of a box
// is filled, so those nine values are drawn from 1-9 and that is the digits 1-9
// once each.
const boxDigits = cells
  .filter(cell => grid.block(cell, 3, 3) !== null)
  .map(cell => new Or([
    new Given(T.at(cell), 2),
    new AllDifferent(...grid.block(cell, 3, 3)),
  ]));

// Rows and columns hold at most one of each digit; blanks may repeat, which no
// AllDifferent can say, so the pairwise relation states it directly.
const rowColKey = PairX.fnToKey((a, b) => a !== b || a === BLANK, geom);
const rowsAndColumns = [...grid.rows(), ...grid.columns()].map(
  house => new PairX(rowColKey, 'no-repeat', ...house));

// The 14 given digits printed in the grid.
const givens = [
  [1, 1, 1], [1, 5, 3], [2, 2, 4], [4, 2, 2], [4, 7, 4],
  [6, 3, 8], [6, 6, 9], [6, 10, 7], [7, 4, 5], [7, 7, 6],
  [8, 8, 1], [9, 6, 7], [9, 9, 6], [10, 7, 1],
].map(([row, col, digit]) => new Given(makeCellId(row, col), digit));

return [
  shape,
  T.toVar('T'), F.toVar('F'),
  ...domains, cornerRoom, ...filled,
  ...coverage, boxTotal, ...boxDigits, ...rowsAndColumns,
  ...givens,
];
