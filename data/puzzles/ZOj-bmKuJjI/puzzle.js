// Title: Hot and Cold Cages
// Author: Bren77
// Video: https://www.youtube.com/watch?v=ZOj-bmKuJjI
// Source: https://app.crackingthecryptic.com/sudoku/jPmjLqHfbp

// Normal sudoku. Additionally, each row, column, and box has exactly one
// "hot" cell (value = digit + 1) and exactly one "cold" cell (value =
// digit - 1); every other cell has value = digit. Across the whole grid, the
// 9 hot cells' digits are all different (so are the 9 cold cells' digits) --
// combined with one-hot-per-row this means every digit 1-9 is the hot cell's
// digit exactly once, and likewise for cold. Cage totals sum cells' values,
// not digits; a cage's digits (not values) must all differ, whether or not
// it carries a total.
//
// Encoding: a flag Var per cell holds COLD=1, NORMAL=2, or HOT=3 -- arbitrary
// tags read only via equality (Given/ContainExact), never combined
// arithmetically with anything except inside the cage-total identity below.
// "value" is never materialized as its own cell. A cage total instead
// substitutes value_i = digit_i + (flag_i - 2) into the sum, so the cage's
// Sum runs over both its digit cells and their flag cells, with the target
// shifted by 2 * (cage size).
//
// The "each digit exactly once among hot cells" rule needs the digit found at
// a location that is itself only known to the solver (whichever cell in a
// row turns out hot). A per-row Var holds that digit; rowLink() pins it by
// trying each column as the hot one and requiring, in that branch, the flag
// there to read HOT and the row cell's digit to equal the Var (an
// Or-of-And-of-Given-and-Sum selector). AllDifferent across the 9 rows' Vars
// then forces the global permutation. Same construction, independently, for
// cold.

const graph = cellGraph('9x9');
const flags = graph.makeOverlay('VH');
const flag = cell => flags.at(cell);

const COLD = 1, NORMAL = 2, HOT = 3;

const hotDigit = new Var('QH', 'row hot cell digit', 9);
const coldDigit = new Var('QC', 'row cold cell digit', 9);

function rowLink(selectorVar, role, row) {
  const rowCells = graph.row(row);
  const target = selectorVar.cell(row);
  return new Or(rowCells.map(cell => new And([
    new Given(flag(cell), role),
    new SameValues(2, cell, target),
  ])));
}

const rowLinks = [];
for (let row = 1; row <= 9; row++) {
  rowLinks.push(rowLink(hotDigit, HOT, row));
  rowLinks.push(rowLink(coldDigit, COLD, row));
}

// Exactly one hot and one cold cell per row, column, and box.
const roleCounts = graph.rowsColumnsBoxes().flatMap(cells => [
  new ContainExact(String(HOT), ...flags.at(cells)),
  new ContainExact(String(COLD), ...flags.at(cells)),
]);

// All drawn cages. The source draws R5C1,R5C2 (17) and R8C5,R9C5 (3) each as
// two identical, overlapping cage outlines; each is one cage here.
const cages = [
  { cells: ['R1C4', 'R2C4', 'R3C4'] },
  { cells: ['R1C5', 'R2C5'], total: 6 },
  { cells: ['R2C2'], total: 4 },
  { cells: ['R2C7', 'R3C7'], total: 4 },
  { cells: ['R2C8'], total: 4 },
  { cells: ['R3C2'] },
  { cells: ['R3C8'], total: 6 },
  { cells: ['R4C1', 'R4C2'], total: 8 },
  { cells: ['R4C4', 'R5C4'], total: 9 },
  { cells: ['R4C6', 'R5C6'], total: 14 },
  { cells: ['R4C8', 'R4C9'], total: 3 },
  { cells: ['R5C1', 'R5C2'], total: 17 },
  { cells: ['R5C8', 'R5C9'], total: 14 },
  { cells: ['R6C1', 'R6C2'], total: 8 },
  { cells: ['R6C4', 'R6C5'], total: 6 },
  { cells: ['R6C8', 'R6C9'], total: 12 },
  { cells: ['R7C2'] },
  { cells: ['R7C3', 'R8C3'] },
  { cells: ['R7C6', 'R8C6', 'R9C6'], total: 20 },
  { cells: ['R7C8'], total: 6 },
  { cells: ['R8C2'] },
  { cells: ['R8C5', 'R9C5'], total: 3 },
  { cells: ['R8C8'], total: 1 },
];

function cageConstraints({ cells, total }) {
  const parts = [];
  if (cells.length > 1) parts.push(new AllDifferent(...cells));
  if (total !== undefined) {
    parts.push(new Sum(total + 2 * cells.length, ...cells, ...flags.at(cells)));
  }
  return parts;
}

// Every flag cell's domain is COLD/NORMAL/HOT: one Given, replicated onto
// every cell, rather than 81 hand-written copies.
const flagDomain = flags.makeReplicate(new Given(flags.cells()[0], COLD, NORMAL, HOT));

return [
  new Shape('9x9'),
  flags.toVar('hot(3)/normal(2)/cold(1) flag'),
  flagDomain,
  ...roleCounts,
  hotDigit,
  coldDigit,
  new AllDifferent(...hotDigit.cells()),
  new AllDifferent(...coldDigit.cells()),
  ...rowLinks,
  ...cages.flatMap(cageConstraints),
];
