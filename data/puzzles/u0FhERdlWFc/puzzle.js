// Title: Unique Values
// Author: Mesmer
// Video: https://www.youtube.com/watch?v=u0FhERdlWFc
// Source: https://app.crackingthecryptic.com/sudoku/qTGfqrRLdd
//
// Normal sudoku rules apply. 26 cages tile all but two cells; none has a
// printed total. Digits cannot repeat within a cage. A cage's value is the
// sum of its digits, and no two cages may share a value. An inequality mark
// between R4C4 and R4C5 points at the smaller digit. The 7-cell diagonal
// R9C3-R8C4-R7C5-R6C6-R5C7-R4C8-R3C9 sums to double the value of the cage
// marked "x" (cage 12: R3C4/R3C5/R3C6); digits may repeat on that diagonal,
// so no extra all-different applies to it beyond the ordinary row/col/box
// coverage those cells already get.
//
// Cage totals range 3-30 across the 2/3/4-cell cages here, past ISS's
// 16-value Var domain cap (CellGeometry.MAX_SIZE, blocker #556), so a
// cage's total is never materialised as one Var. Instead each cage gets a
// hi/lo Var pair with total = 16*hi + lo (hi in {0,1}, lo in 0-15), tied to
// the cage's cells by a coefficient Sum. Because lo < 16, two cages with
// different hi can never collide, so "no shared cage value" reduces to a
// per-pair check: hi differs, or lo differs.

const cages = [
  ['R1C2', 'R1C1', 'R2C1', 'R3C1'],
  ['R1C3', 'R1C4', 'R2C4'],
  ['R2C3', 'R2C2', 'R3C2'],
  ['R3C3', 'R4C3', 'R4C2'],
  ['R4C1', 'R5C1', 'R6C1'],
  ['R7C1', 'R8C1', 'R9C1'],
  ['R6C2', 'R7C2', 'R7C3'],
  ['R5C2', 'R5C3'],
  ['R6C3', 'R6C4', 'R6C5'],
  ['R9C2', 'R9C3', 'R9C4'],
  ['R7C4', 'R8C4', 'R8C3'],
  ['R5C4', 'R4C4', 'R4C5'],
  ['R3C4', 'R3C5', 'R3C6'], // cage 12, carries the "x" overlay
  ['R1C5', 'R2C5'],
  ['R1C6', 'R2C6', 'R2C7'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C9'],
  ['R3C9', 'R3C8', 'R4C8'],
  ['R3C7', 'R4C7', 'R5C7'],
  ['R5C6', 'R4C6', 'R5C5', 'R6C6'],
  ['R4C9', 'R5C9', 'R6C9'],
  ['R5C8', 'R6C8'],
  ['R6C7', 'R7C7', 'R7C8'],
  ['R7C9', 'R8C9', 'R9C9', 'R9C8'],
  ['R8C8', 'R8C7', 'R9C7'],
  ['R7C6', 'R8C6', 'R9C6'],
  ['R7C5', 'R8C5', 'R9C5'],
];
const X_CAGE_INDEX = 12;

// Diagonal cells the arrow (bulb at R9C3, "2x" label) runs along.
const DIAGONAL = ['R9C3', 'R8C4', 'R7C5', 'R6C6', 'R5C7', 'R4C8', 'R3C9'];

const shape = new Shape('9x9', '0-15');
const graph = cellGraph(shape);

// The real grid only ever holds 1-9; 10-15 exist solely to give the cage
// hi/lo Vars below room within the shared 16-value alphabet.
const digitGivens = graph.makeReplicate(
  new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

const cageAllDifferent = cages.map(cells => new AllDifferent(...cells));

const hi = new Var('HI', 'cage hi digit', cages.length);
const lo = new Var('LO', 'cage lo digit', cages.length);
const hiCell = i => hi.cell(i + 1);
const loCell = i => lo.cell(i + 1);

// hi in {0,1}: with cages no bigger than 4 cells, every total stays in
// [3,30], so total = 16*hi + lo never needs hi above 1.
const hiRanges = cages.map((_, i) => new Given(hiCell(i), 0, 1));

// total(cage i) = 16*hi_i + lo_i.
const cageTotals = cages.map((cells, i) => new Sum(
  0, ...cells, [hiCell(i), -16], [loCell(i), -1]));

// No two cages share a total. hi differing already forces different totals
// (lo < 16 on both sides), so only same-hi pairs need lo to differ too.
const cagePairs = [];
for (let i = 0; i < cages.length; i++) {
  for (let j = i + 1; j < cages.length; j++) cagePairs.push([i, j]);
}
const uniqueCageValues = cagePairs.map(([i, j]) => new Or([
  new AllDifferent(hiCell(i), hiCell(j)),
  new AllDifferent(loCell(i), loCell(j)),
]));

// Diagonal sum = 2 * cage 12's value = 2*(16*hi_12 + lo_12).
const diagonalDoublesXCage = new Sum(
  0, ...DIAGONAL, [hiCell(X_CAGE_INDEX), -32], [loCell(X_CAGE_INDEX), -2]);

const inequality = new GreaterThan('R4C4', 'R4C5');

return [
  shape, hi, lo,
  digitGivens,
  ...hiRanges,
  ...cageAllDifferent,
  ...cageTotals,
  ...uniqueCageValues,
  diagonalDoublesXCage,
  inequality,
];
