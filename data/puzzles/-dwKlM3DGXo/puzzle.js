// Title: Triple Threeat
// Author: FIT7Y
// Video: https://www.youtube.com/watch?v=-dwKlM3DGXo
// Source: https://sudokupad.app/dp2qkgafww

// Digits 1-7. Every row and column has exactly three 3s and one each of
// 1,2,4,5,6,7. Every box has up to 3 distinct digits (repeats within a box
// are otherwise unrestricted). Excluding 3s, a cage's digits sum to its
// total; 3s contribute 0 to the sum, and digits may repeat within a cage.
// There are no givens.
//
// Rows and columns repeat digits, so the grid is Raw: no implicit
// constraints.

const shape = new Shape('9x9', '1-7', 'Raw');
const graph = cellGraph(shape);
const cellAt = (r, c) => makeCellId(r, c); // r, c: 1-indexed

// Rows and columns: three 3s plus one each of 1,2,4,5,6,7.
const ROW_COL_MULTISET = '1_2_3_3_3_4_5_6_7';
const rows = graph.rows().map(row =>
  new ContainExact(ROW_COL_MULTISET, ...row));
const cols = graph.columns().map(col =>
  new ContainExact(ROW_COL_MULTISET, ...col));

// Boxes: at most 3 distinct digits. CountDistinct binds a control cell to the
// exact distinct-value count, so restricting the control cell to {1,2,3}
// expresses "up to 3" rather than "exactly 3". A Raw grid has no default
// boxes, so build the same 3x3 regions explicitly.
const BOX_COUNTERS = new Var('B', 'BoxDistinctCount', '3x3');
const boxes = [];
for (let r = 1; r <= 9; r += 3) {
  for (let c = 1; c <= 9; c += 3) {
    boxes.push(graph.block(makeCellId(r, c), 3, 3));
  }
}
const boxConstraints = boxes.flatMap((box, i) => {
  const counter = BOX_COUNTERS.cell(i + 1);
  return [
    new Given(counter, 1, 2, 3),
    new CountDistinct(counter, ...box),
  ];
});

// Cages: sum of digits excluding 3s equals the given total, with repeats
// allowed -- neither Cage nor Sum (both of which treat the cells as a set of
// distinct summands). A Pair for a 2-cell cage, otherwise a running-sum NFA
// whose state is the total so far of the non-3 digits seen; a state is
// dropped once that total passes the cage's own total. maxDepth bounds the
// running total to the cage's cell count, since the builder otherwise assumes
// an unbounded sum and exceeds the 4096-state compile limit.
const nonThree = (v) => (v === 3 ? 0 : v);
const cageSumKey = (total) =>
  Pair.fnToKey((a, b) => nonThree(a) + nonThree(b) === total, shape);
const cageSumNFA = (total, numCells) => NFA.encodeSpec({
  startState: 0,
  transition: (sum, v) => {
    const next = sum + nonThree(v);
    return next <= total ? next : undefined;
  },
  accept: (sum) => sum === total,
  maxDepth: numCells,
}, shape);

// Cage cells as [row, col], 1-indexed, from the puzzle's drawn cages.
const CAGES = [
  { total: 10, cells: [[1, 3], [1, 4], [1, 5], [1, 6]] },
  { total: 10, cells: [[2, 1], [2, 2], [3, 2], [4, 2]] },
  { total: 15, cells: [[3, 3], [3, 4], [4, 3], [4, 4]] },
  { total: 7, cells: [[2, 5], [3, 5]] },
  { total: 14, cells: [[2, 7], [2, 8], [3, 7], [4, 6], [4, 7]] },
  { total: 8, cells: [[3, 8], [4, 8], [5, 8]] },
  { total: 8, cells: [[3, 9], [4, 9], [5, 9]] },
  { total: 3, cells: [[5, 7], [6, 7], [6, 8]] },
  { total: 21, cells: [[6, 2], [7, 2], [8, 2], [8, 3], [8, 4]] },
  { total: 7, cells: [[6, 6], [7, 6], [7, 7]] },
  { total: 1, cells: [[9, 7], [9, 8]] },
];
const cages = CAGES.map(({ total, cells }) => {
  const cageCells = cells.map(([r, c]) => cellAt(r, c));
  return cells.length === 2
    ? new Pair(cageSumKey(total), `cage sum ${total}`, ...cageCells)
    : new NFA(cageSumNFA(total, cells.length), `cage sum ${total}`, ...cageCells);
});

return [
  shape,
  ...rows,
  ...cols,
  BOX_COUNTERS,
  ...boxConstraints,
  ...cages,
];
