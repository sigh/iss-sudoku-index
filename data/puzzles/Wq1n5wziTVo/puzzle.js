// Title: Leftovers
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=Wq1n5wziTVo
// Source: https://sudokupad.app/9fipkj2wr0

// Squished sudoku: a 7x7 grid holds a 9x9-style sudoku. Each row and column
// contains 7 of the 9 digits 1-9 (2 are always missing). Nine 3x3 boxes tile
// the grid, overlapping their neighbours by one row/column of dashed cells.
// The overlap of every four neighbouring boxes forms an extra 9-cell
// all-different cross region.
//
// Two off-grid Var cells per row/column hold that row/column's two missing
// digits (their identity is pinned only by the constraints below and by
// forming a full 1-9 set together with the 7 real cells).
//
// Row pills (right of each row):
//   R1-R3: black dot  - the missing pair is in a 1:2 ratio.
//   R4   : X-sum pill - reading from the right, the first digit is X; the
//          sum of the first X digits equals the two missing digits read as
//          a two-digit number.
//   R5-R7: white dot  - the missing pair is consecutive.
// Column pills (below each column):
//   C1, C5, C6, C7: pill marked X - the missing pair sums to 10.
//   C3            : X-sum pill (as above, reading from the bottom).
//   C2, C4        : unmarked pill - no extra rule (missing digits only).

const graph = cellGraph('7x7');

const boxTopLefts = [
  'R1C1', 'R1C3', 'R1C5',
  'R3C1', 'R3C3', 'R3C5',
  'R5C1', 'R5C3', 'R5C5',
];
const boxes = boxTopLefts.map(tl => graph.block(tl, 3, 3));

const crosses = [
  ['R1C3', 'R2C3', 'R3C3', 'R4C3', 'R5C3', 'R3C1', 'R3C2', 'R3C4', 'R3C5'],
  ['R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R3C3', 'R3C4', 'R3C6', 'R3C7'],
  ['R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3', 'R5C1', 'R5C2', 'R5C4', 'R5C5'],
  ['R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R5C3', 'R5C4', 'R5C6', 'R5C7'],
];

// Var pair holding the two digits missing from each row / column.
const rowMissingA = new Var('RA', 'RowMissingA', 7);
const rowMissingB = new Var('RB', 'RowMissingB', 7);
const colMissingA = new Var('CA', 'ColMissingA', 7);
const colMissingB = new Var('CB', 'ColMissingB', 7);
const rowA = i => rowMissingA.cell(i);
const rowB = i => rowMissingB.cell(i);
const colA = i => colMissingA.cell(i);
const colB = i => colMissingB.cell(i);

// Ratio/consecutive dot pills apply to two off-grid Vars that are not grid
// neighbours, so BlackDot/WhiteDot (which only fire between grid-adjacent
// cells) cannot be used; a custom Pair relation expresses the same relation
// between any two cells.
const ratioKey = Pair.fnToKey((a, b) => a === b * 2 || b === a * 2, 9);
const consecutiveKey = Pair.fnToKey((a, b) => a === b + 1 || a === b - 1, 9);

// Builds the "X-sum equals the two missing digits" clue for one row/column.
// `orderedCells` starts at the cell nearest the pill.
function missingXSum(orderedCells, varA, varB) {
  return new Or(Array.from({ length: orderedCells.length }, (_, i) => {
    const x = i + 1;
    const used = orderedCells.slice(0, x);
    return new And([
      new Given(orderedCells[0], x),
      new Sum(0, ...used, [varA, -10], [varB, -1]),
    ]);
  }));
}

return [
  new Shape('7x7', 9),
  new NoBoxes(),
  ...boxes.map(cells => new AllDifferent(...cells)),
  ...crosses.map(cells => new AllDifferent(...cells)),

  rowMissingA,
  rowMissingB,
  colMissingA,
  colMissingB,

  // Each row/column's 7 real cells plus its 2 missing-digit Vars form 1-9.
  ...[1, 2, 3, 4, 5, 6, 7].map(r =>
    new AllDifferent(...graph.row(r), rowA(r), rowB(r))),
  ...[1, 2, 3, 4, 5, 6, 7].map(c =>
    new AllDifferent(...graph.column(c), colA(c), colB(c))),

  // Row pills.
  new Pair(ratioKey, 'row-ratio-1', rowA(1), rowB(1)),
  new Pair(ratioKey, 'row-ratio-2', rowA(2), rowB(2)),
  new Pair(ratioKey, 'row-ratio-3', rowA(3), rowB(3)),
  missingXSum(['R4C7', 'R4C6', 'R4C5', 'R4C4', 'R4C3', 'R4C2', 'R4C1'], rowA(4), rowB(4)),
  new Pair(consecutiveKey, 'row-consecutive-5', rowA(5), rowB(5)),
  new Pair(consecutiveKey, 'row-consecutive-6', rowA(6), rowB(6)),
  new Pair(consecutiveKey, 'row-consecutive-7', rowA(7), rowB(7)),

  // Column pills.
  new Sum(10, colA(1), colB(1)),
  missingXSum(['R7C3', 'R6C3', 'R5C3', 'R4C3', 'R3C3', 'R2C3', 'R1C3'], colA(3), colB(3)),
  new Sum(10, colA(5), colB(5)),
  new Sum(10, colA(6), colB(6)),
  new Sum(10, colA(7), colB(7)),
];
