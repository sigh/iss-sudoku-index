// Title: I'll Halve What She's Halving
// Author: ChinStrap
// Video: https://www.youtube.com/watch?v=r0jA6QEbDPk
// Source: https://sudokupad.app/7b12b8k1tf

// Normal sudoku rules apply.
//
// Halvers: 9 marked cells, one per row/column/box (a second transversal laid
// over the grid; the solver places them, nothing shows where). Every digit
// 1-9 must sit in exactly one halver cell, so the 9 halver digits form a
// permutation of 1-9.
//
// Omitted: the blue-line rule (each 3x3 box-border crossing starts a new
// segment; every segment of a line sums to the same total, using each
// cell's "value" -- its digit, or half its digit at a halver cell). Every
// tried encoding of this halved-value equal-segment-sum rule hits a solver
// defect, not a decode or modelling gap.
//
// Clone dominoes: the three shaded dominoes are positionally equal -- first
// cell equals first cell, second equals second -- per the rules' own worked
// example (r2c3 = r5c7 = r9c4).

const rows = Array.from({ length: 9 }, (_, i) => i + 1);
const cols = rows;
const eq = (a, b) => new SameValues(2, a, b); // two size-1 sets => a === b

// ---- Halver position and digit: one pair of aux cells per row. ----
// HC(r) = column (1-9) of row r's halver. HD(r) = the digit sitting there.
const hcVar = new Var('HC', 'halver column index', 9);
const hdVar = new Var('HD', 'halver digit', 9);
const HC = r => hcVar.cell(r);
const HD = r => hdVar.cell(r);

const hcGivens = rows.map(r => new Given(HC(r), ...cols));
// AllDifferent on 9 column-index cells over a 9-value domain: one halver per
// column (one per row is automatic -- HC(r) is a single-valued function).
const hcColumnsDistinct = new AllDifferent(...rows.map(HC));

// One halver per box: within each same box-row band of 3 rows, the halvers'
// column "thirds" (cols 1-3 / 4-6 / 7-9) must be pairwise distinct. Combined
// with hcColumnsDistinct (already distinct columns) and the band's fixed,
// distinct box-row, this puts exactly one halver in each of the band's 3
// boxes -- so exactly one per box overall.
const columnThird = c => Math.floor((c - 1) / 3);
const differentThirds = Pair.fnToKey((a, b) => columnThird(a) !== columnThird(b), 9);
const boxRowBands = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
const oneHalverPerBox = boxRowBands.map(band =>
  new PairX(differentThirds, 'halver column thirds differ within box-row band', ...band.map(HC)));

const hdGivens = rows.map(r => new Given(HD(r), ...cols));
// HD(r) = the digit at (r, HC(r)): exactly one of the 9 possible columns is
// the true halver column, and in that branch HD(r) equals that cell's digit.
const hdLinksToGrid = rows.map(r => new Or(cols.map(c => new And([
  new Given(HC(r), c),
  eq(HD(r), makeCellId(r, c)),
]))));
// Every digit appears in exactly one halver cell.
const everyDigitHalvedOnce = new AllDifferent(...rows.map(HD));

// ---- Clone dominoes (shaded 1x1 cells; adjacent pairs read left-right). ----
// Provenance: the three shaded-cell pairs at R2C2/R2C3, R5C6/R5C7, R9C3/R9C4.
const cloneDominoes = [['R2C2', 'R2C3'], ['R5C6', 'R5C7'], ['R9C3', 'R9C4']];
const cloneEqualities = [0, 1].flatMap(pos => [
  eq(cloneDominoes[0][pos], cloneDominoes[1][pos]),
  eq(cloneDominoes[1][pos], cloneDominoes[2][pos]),
]);

return [
  new Shape('9x9'),
  hcVar,
  hdVar,
  ...hcGivens,
  hcColumnsDistinct,
  ...oneHalverPerBox,
  ...hdGivens,
  ...hdLinksToGrid,
  everyDigitHalvedOnce,
  ...cloneEqualities,
];
