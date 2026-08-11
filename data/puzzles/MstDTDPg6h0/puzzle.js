// Title: Deconstruction
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=MstDTDPg6h0
// Source: https://app.crackingthecryptic.com/sudoku/jqQHm9B29j

// Rules encoded here:
//  - Nine 3x3 regions, whose positions the solver must find, sit disjointly in
//    the 11x11 grid; every other cell stays empty (holds no digit).
//  - Each region holds 1-9 once each. No row or column repeats a digit (empty
//    cells are not digits, so they do not clash).
//  - 23 cages: the digits in each cage sum to its clue and may not repeat.
//    A cage may include cells outside every region; an empty cell contributes
//    0 to the sum and, not being a digit, may sit alongside another empty
//    cell in the same cage without "repeating".
//
// Rows/columns are not all-different here (empty cells repeat 0 freely), so
// the grid is Raw: no implicit constraints. This is the same region-search
// technique used for ZIfPtNoC33g (nine floating 3x3 boxes in an 11x11 grid).
const shape = new Shape('11x11', '0-9', 'Raw');
const grid = cellGraph(shape);

// VL labels each cell's position inside its region: 0 = not in a region,
// otherwise 1 + 3*rowOffset + colOffset for offsets 0-2 within the 3x3 block.
// The label layer is what makes region placement searchable; it is fixed by
// the digits (the top-left-most uncovered filled cell always starts a
// block), so it adds no freedom of its own.
const label = grid.makeOverlay('VL');
const rowOffset = a => ((a - 1) / 3) | 0;
const colOffset = a => (a - 1) % 3;

// Neighbouring labels: inside a block the label steps by 1 rightwards and by
// 3 downwards; at a block's trailing edge (or outside any block) the next
// cell either is empty or starts a new block.
const labelAcross = Pair.fnToKey((a, b) =>
  a === 0 ? (b === 0 || colOffset(b) === 0)
    : colOffset(a) < 2 ? b === a + 1
      : (b === 0 || colOffset(b) === 0), shape);
const labelDown = Pair.fnToKey((a, b) =>
  a === 0 ? (b === 0 || rowOffset(b) === 0)
    : rowOffset(a) < 2 ? b === a + 3
      : (b === 0 || rowOffset(b) === 0), shape);
// A cell is empty exactly when it lies in no region.
const emptyIff = Pair.fnToKey((d, l) => (d === 0) === (l === 0), shape);
// No row or column repeats a digit; empty cells (0) are exempt.
const noRepeat = PairX.fnToKey((a, b) => a === 0 || b === 0 || a !== b, shape);

const labelRuns = [
  ...grid.rows().map((cells, i) => new Pair(labelAcross, `across${i + 1}`, ...label.at(cells))),
  ...grid.columns().map((cells, i) => new Pair(labelDown, `down${i + 1}`, ...label.at(cells))),
];
// A block cannot run off the grid, so the border rows and columns can only
// hold the labels of a block's leading or trailing edge.
const labelBorders = [
  ...label.at(grid.row(1)).map(c => new Given(c, 0, 1, 2, 3)),
  ...label.at(grid.row(11)).map(c => new Given(c, 0, 7, 8, 9)),
  ...label.at(grid.column(1)).map(c => new Given(c, 0, 1, 4, 7)),
  ...label.at(grid.column(11)).map(c => new Given(c, 0, 3, 6, 9)),
];
const emptyLinks = grid.cells().map(
  c => new Pair(emptyIff, 'empty', c, label.at(c)));
// Exactly nine cells carry label 1, i.e. there are exactly nine regions.
const nineRegions = new ContainExact(Array(9).fill(1).join('_'), ...label.cells());

// Wherever a block starts, its nine digits are all different; with every
// block cell filled that makes them 1-9.
const regionDigits = grid.cells().flatMap(topLeft => {
  const block = grid.block(topLeft, 3, 3);
  if (block === null) return [];
  return [new Or([
    new Given(label.at(topLeft), 0, 2, 3, 4, 5, 6, 7, 8, 9),
    new AllDifferent(...block)])];
});

const rowsAndCols = [
  ...grid.rows().map((cells, i) => new PairX(noRepeat, `row${i + 1}`, ...cells)),
  ...grid.columns().map((cells, i) => new PairX(noRepeat, `col${i + 1}`, ...cells)),
];

// Cages, transcribed from the drawn cage outlines and top-left totals
// (1-indexed [row, col] pairs, built into cell ids with makeCellId rather
// than hand-typed R#C# strings).
const CAGES = [
  [15, [3, 2], [4, 2], [4, 1]],
  [18, [1, 4], [1, 5], [1, 6], [1, 7], [2, 7]],
  [8, [2, 4], [2, 3]],
  [14, [2, 6], [2, 5]],
  [4, [2, 8], [2, 9], [3, 9]],
  [6, [2, 10], [3, 10]],
  [12, [3, 3], [3, 5], [3, 4]],
  [30, [3, 6], [3, 7], [3, 8], [4, 8]],
  [9, [4, 7], [5, 7], [6, 7]],
  [9, [4, 3], [4, 4]],
  [14, [6, 2], [7, 2], [7, 1]],
  [8, [8, 2], [9, 2], [10, 2]],
  [3, [9, 3], [10, 3]],
  [21, [8, 3], [7, 3], [7, 4], [8, 4]],
  [8, [5, 6], [5, 5]],
  [5, [7, 6], [7, 5]],
  [10, [9, 6], [10, 6], [10, 7], [10, 8], [10, 9]],
  [4, [9, 9], [9, 8]],
  [18, [11, 9], [11, 10], [11, 11]],
  [3, [9, 10], [9, 11]],
  [5, [7, 10], [7, 9]],
  [9, [6, 11], [5, 11]],
  [13, [4, 9], [5, 9]],
];
// Cage total: a plain Sum over the raw cell values, since an empty cell (0)
// contributes nothing -- exactly "the digits in the cage sum to the clue".
// Cage distinctness: PairX with the same 0-exempt `noRepeat` key used for
// rows/columns, not native Cage/AllDifferent, since a cage spanning two
// empty cells must not be rejected for "repeating" a non-digit.
const cages = CAGES.flatMap(([total, ...cells], i) => {
  const ids = cells.map(([r, c]) => makeCellId(r, c));
  return [
    new Sum(total, ...ids),
    new PairX(noRepeat, `cage${i + 1}`, ...ids),
  ];
});

return [
  shape,
  label.toVar('region labels'),
  ...labelRuns,
  ...labelBorders,
  ...emptyLinks,
  nineRegions,
  ...regionDigits,
  ...rowsAndCols,
  ...cages,
];
