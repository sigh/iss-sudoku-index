// Title: 4'33''
// Author: ndsurgenor
// Video: https://www.youtube.com/watch?v=B4H2LOdFB3k
// Source: https://app.crackingthecryptic.com/sudoku/4N3ThH99qg
//
// 10x9 grid. Rows 1-9 form a normal 9x9 sudoku (rows/cols/3x3 boxes each hold
// 1-9 once). Row 10 also holds each digit 1-9 once, but does not take part in
// the 9x9 grid's row/column/box rules -- so this is built on a Raw grid with
// every latin-square rule stated explicitly.
//
// Row 10 rule: if row 10 column C holds digit V, then row V of that same
// column C (within the 9x9 grid) also holds V.
//
// Cages (including the large red cage) must sum to one of 3, 4, 33, 43, 433.
// No cage carries a printed total; every total below is forced by cage size:
// for a same-9x9 cage of k distinct digits from 1-9, reachable sums lie in
// [k(k+1)/2, k(19-k)/2], which leaves only one candidate from {3,4,33,43,433}
// except for the 1-cell and 2-cell cages, where both 3 and 4 remain possible.
// Cages entirely inside the 9x9 grid must also be all-different (native to
// Cage); the large red cage straddles rows 1-9 and row 10, so that rule does
// not apply to it.
//
// White dots: cells differ by 1. Not all dots are given (no negative rule).

const shape = new Shape('10x9', 9, 'Raw');
const graph = cellGraph(shape);

// -- Baseline latin-square rules, stated explicitly because Raw adds none. --

// graph.rows() gives all 10 rows; the last is row 10, kept separate below.
const allRows = graph.rows();
const rows9x9 = allRows.slice(0, 9).map(cells => new AllDifferent(...cells));
const row10 = new AllDifferent(...allRows[9]);

// graph.columns() gives all 10 cells per column; only rows 1-9 are latin.
const columns9x9 = graph.columns().map(
  col => new AllDifferent(...col.slice(0, 9)));

// graph.boxes() is [] on a Raw grid (no box builder to defer to), so the
// standard 3x3 tiling over the 9x9 area is built by hand here.
const boxes9x9 = [];
for (let br = 0; br < 3; br++) {
  for (let bc = 0; bc < 3; bc++) {
    const cells = [];
    for (let dr = 1; dr <= 3; dr++) {
      for (let dc = 1; dc <= 3; dc++) {
        // lint-ok: manual-box-arithmetic
        cells.push(makeCellId(br * 3 + dr, bc * 3 + dc));
      }
    }
    boxes9x9.push(new AllDifferent(...cells));
  }
}

// -- Row 10 indexing rule. --
// For column c, control cell is row10's own cell; ValueIndexing(valueCell,
// controlCell, ...indexedCells) enforces grid[valueCell] == indexedCells[k-1]
// where k is controlCell's value. Using the row10 cell as BOTH valueCell and
// controlCell makes this read: "row10Cell's own value V equals the value of
// the V-th indexed cell", i.e. row V of this column holds V. Fixture-tested
// (accept/reject/propagate) against the raw handler before use here.
const rowIndexing = [];
for (let c = 1; c <= 9; c++) {
  const control = makeCellId(10, c);
  const indexed = [];
  for (let r = 1; r <= 9; r++) indexed.push(makeCellId(r, c));
  rowIndexing.push(new ValueIndexing(control, control, ...indexed));
}

// -- Cages. --
// Sizes and forced totals: 5-cell->33 (min15/max35), 8-cell->43 (min36/max44),
// 7-cell->33 (min28/max42); see header comment for the bound formula.
const cages = [
  new Cage(33, 'R2C2', 'R3C2', 'R3C3', 'R2C3', 'R2C4'),
  new Cage(33, 'R2C6', 'R2C7', 'R2C8', 'R3C8', 'R3C7'),
  new Cage(43, 'R5C3', 'R6C3', 'R5C4', 'R6C4', 'R5C5', 'R6C5', 'R7C5', 'R8C5'),
  new Cage(33, 'R5C7', 'R5C8', 'R5C9', 'R6C9', 'R6C8', 'R7C8', 'R7C9'),
  new Cage(43, 'R7C2', 'R8C2', 'R9C2', 'R9C3', 'R8C3', 'R7C3', 'R8C4', 'R9C4'),
];

// 1-cell cages: bounds [1,9] leave both 3 and 4 possible; restrict candidates
// directly (a single-cell cage's sum equals the cell's own value).
const singleCellCages = [
  new Given('R3C4', 3, 4),
  new Given('R7C4', 3, 4),
];

// 2-cell cage: bounds [3,17] (distinct digits) leave both 3 and 4 possible;
// each branch is a full Cage (all-different + sum) since the total is
// undetermined but the size-2, in-9x9, no-repeat rule is not.
const twoCellCage = new Or([
  new Cage(3, 'R2C9', 'R3C9'),
  new Cage(4, 'R2C9', 'R3C9'),
]);

// Large red cage: whole 9x9 grid (always sums to 405) plus R10C1-R10C5.
// Only 433 from {3,4,33,43,433} is >= 405, so the cage forces
// R10C1+...+R10C5 = 433 - 405 = 28. The 81-cell portion is already forced by
// the row all-different constraints above, so only the residual 5-cell sum
// needs to be stated.
const largeRedCage = new Sum(28, 'RaC1', 'RaC2', 'RaC3', 'RaC4', 'RaC5');

// -- White dots (Kropki consecutive), each an independent pair. --
const whiteDots = [
  new WhiteDot('R6C6', 'R6C7'),
  new WhiteDot('R7C8', 'R8C8'),
  new WhiteDot('R1C7', 'R1C8'),
  new WhiteDot('R7C3', 'R7C4'),
  new WhiteDot('R7C4', 'R7C5'),
  new WhiteDot('R7C2', 'R8C2'),
  new WhiteDot('R9C1', 'RaC1'),
  new WhiteDot('RaC3', 'RaC4'),
];

return [
  shape,
  ...rows9x9,
  row10,
  ...columns9x9,
  ...boxes9x9,
  ...rowIndexing,
  ...cages,
  ...singleCellCages,
  twoCellCage,
  largeRedCage,
  ...whiteDots,
];
