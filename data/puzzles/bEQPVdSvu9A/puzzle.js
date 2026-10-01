// Title: Wet Blankets
// Author: Jorava
// Video: https://www.youtube.com/watch?v=bEQPVdSvu9A
// Source: https://sudokupad.app/tdzmfngyfp

// Rules encoded here:
//   - Normal Sudoku (no given digits).
//   - Every killer cage has exactly one negative cell, whose value is the
//     negative of its digit. The negatives sit in different rows, columns and
//     boxes and have different values.
//   - Cage totals are sums of values; digits may repeat in a cage (no
//     all-different beyond Sudoku). The one-cell cage R7C9 has no total.
//   - V: values sum to 5. X: values sum to 10. Black dot: one value is double
//     the other. Grey circle: odd.
// Nothing is omitted.

// The value range is widened to 0-9 so the negative overlay can use 0 for "not
// negative"; grid cells are pinned back to 1-9 below.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);

// Killer cages and totals, transcribed from the drawn cages.
const cages = [
  { total: -3, cells: ['R8C1', 'R8C2', 'R9C1', 'R9C2'] },
  { total: 8, cells: ['R4C1', 'R5C1'] },
  { total: 4, cells: ['R1C3', 'R2C3', 'R3C3'] },
  { total: 18, cells: ['R3C8', 'R4C6', 'R4C7', 'R4C8'] },
  { total: 2, cells: ['R3C4', 'R4C3', 'R4C4'] },
  { total: 0, cells: ['R8C5', 'R9C5', 'R9C6', 'R9C7'] },
  { total: 15, cells: ['R1C7', 'R2C6', 'R2C7', 'R3C6', 'R3C7'] },
  { total: 10, cells: ['R5C5', 'R5C6', 'R5C7', 'R6C6'] },
  { total: null, cells: ['R7C9'] },
];
const cagedCells = cages.flatMap(({ cells }) => cells);
const caged = new Set(cagedCells);

// Negative overlay over the caged cells only (the rules define negatives as
// cage digits): it holds the cell's digit when that cell is negative, else 0.
// A cell's value is then digit - 2 * overlay, linear in both.
const negatives = graph.makeOverlay('VN', cagedCells);
const neg = cell => negatives.at(cell);
const signed = cells => [...cells, ...cells.map(cell => [neg(cell), -2])];

const marksOwnDigit = Pair.fnToKey(
  (digit, mark) => mark === 0 || mark === digit, shape);

// Exactly one negative per cage: all overlay cells but one are 0. A one-cell
// cage's single cell is therefore negative.
const oneNegative = cells => cells.length === 1
  ? new Given(neg(cells[0]), 1, 2, 3, 4, 5, 6, 7, 8, 9)
  : new ContainExact(cells.slice(1).map(() => 0).join('_'), ...negatives.at(cells));

// No two negatives in a row, column or box: at most one non-zero among the
// caged overlay cells of each house.
const houseNegatives = graph.rowsColumnsBoxes()
  .map(house => house.filter(cell => caged.has(cell)))
  .filter(cells => cells.length >= 2)
  .map(cells => new ContainAtLeast(
    cells.slice(1).map(() => 0).join('_'), ...negatives.at(cells)));

// Nine disjoint cages with one negative each give nine negatives; "no two have
// the same value" over nine values from 1-9 is each of 1-9 exactly once.
const NEGATIVE_DIGITS = '1_2_3_4_5_6_7_8_9';

// Black dot R4C5-R4C4, where R4C4 (cage 5) may be negative and R4C5 (not
// caged) is positive: one branch per sign of R4C4. The negative branch's
// relation (R4C5 = -2d or -d = 2 * R4C5) is stated as written.
const doubleOfNegative = Pair.fnToKey(
  (a, d) => a === -2 * d || -d === 2 * a, shape);
const signedBlackDot = new Or([
  new And([new Given(neg('R4C4'), 0), new BlackDot('R4C5', 'R4C4')]),
  new And([
    new Given(neg('R4C4'), 1, 2, 3, 4, 5, 6, 7, 8, 9),
    new Pair(doubleOfNegative, 'negative black dot', 'R4C5', 'R4C4'),
  ]),
]);

return [
  shape,
  graph.makeReplicate(new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  negatives.toVar('negative digits'),

  ...cagedCells.map(cell => new Pair(marksOwnDigit, 'negative', cell, neg(cell))),
  ...cages.map(({ cells }) => oneNegative(cells)),
  ...houseNegatives,
  new ContainExact(NEGATIVE_DIGITS, ...negatives.at(cagedCells)),

  ...cages.filter(({ total }) => total !== null)
    .map(({ total, cells }) => new Sum(total, ...signed(cells))),

  // V on R6C6 (cage 8) and R7C6 (uncaged).
  new Sum(5, 'R7C6', ...signed(['R6C6'])),
  // X, the other black dots and the odd circle touch uncaged cells only.
  new X('R3C2', 'R4C2'),
  new BlackDot('R1C1', 'R2C1'),
  new BlackDot('R7C5', 'R7C6'),
  new BlackDot('R4C2', 'R5C2'),
  signedBlackDot,
  new Given('R4C5', 1, 3, 5, 7, 9),
];
