// Title: Triple Threeat
// Author: FIT7Y
// Video: https://www.youtube.com/watch?v=-dwKlM3DGXo
// Source: https://sudokupad.app/dp2qkgafww

// Digits 1-7. Every row and column has exactly three 3s and one each of
// 1,2,4,5,6,7. Every box has up to 3 distinct digits (repeats within a box
// are otherwise unrestricted). Excluding 3s, a cage's digits sum to its
// total; 3s contribute 0 to the sum, and digits may repeat within a cage.
//
// The row/column rule is a multiset (three 3s, not all-different), which the
// ISS main grid's automatic row/column all-different cannot express (it would
// also be unsatisfiable: 9 cells, 7 possible values, forced distinct). The
// main grid is reduced to a single unused placeholder cell; the real 9x9
// grid lives entirely in a Var group with explicit row/column/box/cage
// constraints built from scratch.

const N = 9;
const GRID = new Var('G', 'Grid', `${N}x${N}`);

// A plain 9x9 reference geometry supplies the row/column/box groupings;
// gridOverlay translates those cell lists onto the Var grid. The geometry is
// never itself part of the constraints.
const refGraph = cellGraph('9x9');
const gridOverlay = refGraph.makeOverlay('VG');
const cellAt = (r, c) => GRID.cell(r + 1, c + 1); // r, c: 0-indexed

// The single placeholder main-grid cell holds no puzzle information; pin it
// so it doesn't multiply reported solution counts during validation.

// Rows and columns: three 3s plus one each of 1,2,4,5,6,7.
const ROW_COL_MULTISET = '1_2_3_3_3_4_5_6_7';
const rows = refGraph.rows().map(row =>
  new ContainExact(ROW_COL_MULTISET, ...gridOverlay.at(row)));
const cols = refGraph.columns().map(col =>
  new ContainExact(ROW_COL_MULTISET, ...gridOverlay.at(col)));

// Boxes: at most 3 distinct digits. CountDistinct binds a control cell to the
// exact distinct-value count, so restrict the control cell to {1,2,3} to
// express "up to 3" rather than "exactly 3".
const boxes = refGraph.boxes();
const BOX_COUNTERS = new Var('B', 'BoxDistinctCount', '3x3');
const boxConstraints = boxes.flatMap((box, i) => {
  const counter = BOX_COUNTERS.cell(i + 1);
  return [
    new Given(counter, 1, 2, 3),
    new CountDistinct(counter, ...gridOverlay.at(box)),
  ];
});

// Cages: sum of digits excluding 3s equals the given total. Repeats allowed,
// so this is a custom relation rather than Cage/Sum (which require distinct
// cage cells): a Pair for a 2-cell cage, otherwise a running-sum NFA.
// maxDepth bounds the NFA's running total (and its compiled state count) to
// the cage's own cell count; without it the builder assumes the sum could
// keep growing forever and exceeds the 4096-state limit.
const nonThree = (v) => (v === 3 ? 0 : v);
const cageSumKey = (total) => Pair.fnToKey((a, b) => nonThree(a) + nonThree(b) === total, 7);
const cageSumNFA = (total, numCells) => NFA.encodeSpec({
  startState: 0,
  transition: (sum, v) => {
    const next = sum + nonThree(v);
    return next <= total ? next : undefined;
  },
  accept: (sum) => sum === total,
  maxDepth: numCells,
}, 7);

// Cage cells as [row, col], 0-indexed, from the puzzle's drawn cages.
const CAGES = [
  { total: 10, cells: [[0, 2], [0, 3], [0, 4], [0, 5]] },
  { total: 10, cells: [[1, 0], [1, 1], [2, 1], [3, 1]] },
  { total: 15, cells: [[2, 2], [2, 3], [3, 2], [3, 3]] },
  { total: 7, cells: [[1, 4], [2, 4]] },
  { total: 14, cells: [[1, 6], [1, 7], [2, 6], [3, 5], [3, 6]] },
  { total: 8, cells: [[2, 7], [3, 7], [4, 7]] },
  { total: 8, cells: [[2, 8], [3, 8], [4, 8]] },
  { total: 3, cells: [[4, 6], [5, 6], [5, 7]] },
  { total: 21, cells: [[5, 1], [6, 1], [7, 1], [7, 2], [7, 3]] },
  { total: 7, cells: [[5, 5], [6, 5], [6, 6]] },
  { total: 1, cells: [[8, 6], [8, 7]] },
];
const cages = CAGES.map(({ total, cells }) => {
  const ourCells = cells.map(([r, c]) => cellAt(r, c));
  if (cells.length === 2) {
    return new Pair(cageSumKey(total), `cage sum ${total}`, ...ourCells);
  } else {
    return new NFA(
      cageSumNFA(total, cells.length), `cage sum ${total}`, ...ourCells);
  }
});

return [
  new Shape('1x1', 7),
  GRID,
  new Given('R1C1', 1),
  ...rows,
  ...cols,
  BOX_COUNTERS,
  ...boxConstraints,
  ...cages,
];
