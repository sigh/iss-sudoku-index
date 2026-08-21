// Title: Disjunction Function
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=xiCxfhQ8O6c
// Source: https://sudokupad.app/FdDGGJQf7R

// Rules encoded here, in full; nothing is omitted:
//   - Normal Sudoku.
//   - Digits may not repeat in a cage.
//   - Each cage sums to one of four distinct totals, which must be determined.
//   - Cages that share an edge must have different sums.
//   - No digit may appear in more than one cage with the same sum.
//
// A cage holds at most four cells, so a cage total lies in 1..30 and does not fit
// a single cell of a 9-value alphabet. The alphabet is widened to 0-15 so that a
// total can be held as two base-16 auxiliary cells, and the playable grid cells
// are restricted back to 1-9.
const shape = new Shape('9x9', '0-15');
const graph = cellGraph(shape);
const gridDigits = graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9));

// Cage cells, transcribed from the cages drawn in the source grid. No cage carries
// a printed total.
const cageCells = [
  ['R7C8', 'R8C8'],
  ['R5C8', 'R6C8'],
  ['R2C7', 'R2C8'],
  ['R1C6', 'R2C6'],
  ['R2C5'],
  ['R3C3', 'R3C4', 'R3C5'],
  ['R3C2', 'R4C2', 'R5C2', 'R5C3'],
  ['R6C3', 'R6C4', 'R7C4', 'R7C5'],
  ['R7C6', 'R8C6', 'R9C6'],
  ['R8C3', 'R8C4'],
  ['R8C2', 'R9C2'],
  ['R3C6', 'R3C7'],
  ['R4C3', 'R4C4'],
  ['R4C5', 'R5C4', 'R5C5'],
];
const LABELS = [1, 2, 3, 4];

// The four totals, each split into a 16s cell and a units cell; and, per cage,
// which of the four totals it takes.
const totals = new Var('T', 'the four cage totals', '4x2');
const labels = new Var('L', 'cage total labels', cageCells.length);
const totalSixteens = k => totals.cell(k, 1);
const totalUnits = k => totals.cell(k, 2);
const cageLabel = i => labels.cell(i + 1);

// 16 * sixteens + units <= 30, so the 16s cell is a single bit.
const totalRange = LABELS.map(k => new Given(totalSixteens(k), 0, 1));
const labelRange = labels.cells().map(cell => new Given(cell, ...LABELS));

// "each cage sums to one of four ... totals": the cage's cells sum to the total
// its label selects.
const cageSums = cageCells.map((cells, i) => new Or(
  LABELS.map(k => new And([
    new Given(cageLabel(i), k),
    new Sum(0, ...cells, [totalSixteens(k), -16], [totalUnits(k), -1]),
  ]))));

// "four distinct totals": two totals differ when either base-16 cell differs.
const totalsDistinct = LABELS.flatMap((j, index) => LABELS.slice(index + 1).map(k =>
  new Or([
    new AllDifferent(totalSixteens(j), totalSixteens(k)),
    new AllDifferent(totalUnits(j), totalUnits(k)),
  ])));

// The labels name the four totals, and which name goes to which total is an
// artifact of this encoding rather than anything the puzzle asks for. This machine
// pins the canonical naming - reading the cages in the order above, label 1 is used
// first, then label 2, and so on - and, by requiring the run to reach label 4,
// enforces that all four totals are actually taken. Its state is the highest label
// used so far; a label more than one past that is out of canonical order.
const canonicalLabels = new NFA(NFA.encodeSpec({
  startState: { highest: 0 },
  transition: ({ highest }, value) =>
    value >= 1 && value <= highest + 1 ? { highest: Math.max(highest, value) } : undefined,
  accept: ({ highest }) => highest === LABELS.length,
}, shape), 'canonical total labels', labels.cells());

// Since the four totals are distinct, two cages share a sum exactly when they share
// a label, so the remaining two rules are stated over the labels.
const cageDistinct = cageCells.filter(cells => cells.length > 1)
  .map(cells => new AllDifferent(...cells));

const sharesEdge = (a, b) => a.some(cell => graph.neighbours(cell).some(n => b.includes(n)));
const cagePairs = cageCells.flatMap((cells, i) =>
  cageCells.slice(i + 1).map((other, offset) => [i, i + 1 + offset]));

const neighbouringCagesDiffer = cagePairs
  .filter(([i, j]) => sharesEdge(cageCells[i], cageCells[j]))
  .map(([i, j]) => new AllDifferent(cageLabel(i), cageLabel(j)));

// "no digit may appear in more than one cage with the same sum": two cages with the
// same label have no digit in common, which with each cage's own distinctness is one
// AllDifferent over the union.
const sameTotalCagesDisjoint = cagePairs.map(([i, j]) => new Or([
  new AllDifferent(cageLabel(i), cageLabel(j)),
  new AllDifferent(...cageCells[i], ...cageCells[j]),
]));

return [
  shape,
  gridDigits,
  totals,
  labels,
  ...totalRange,
  ...labelRange,
  ...cageSums,
  ...totalsDistinct,
  canonicalLabels,
  ...cageDistinct,
  ...neighbouringCagesDiffer,
  ...sameTotalCagesDisjoint,
];
