// Title: A Clever Killer! Hang Ten Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=5HexGihYRH0
// Source: https://cracking-the-cryptic.web.app/sudoku/bjg7pJqn9L

// Normal sudoku. 10 killer cages are drawn with no printed totals; the video
// description (the only rules text for this source) states each of the 10
// cages sums to a different number between 1 and 10. Cells in a cage cannot
// repeat a digit (standard killer-cage semantics, carried over from the base
// genre the description calls this "an unusual Killer Sudoku variant" of).
// With 10 cages and exactly 10 candidate totals, "different" plus "between 1
// and 10" forces the 10 totals to be a permutation of 1..10.
// Nothing is omitted.

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, n) => lo + n);

// Widen the alphabet to 1-10 so an aux cell can hold a cage's own total
// (which can reach 10); the main grid is restricted back to 1-9 below.
const shape = new Shape('9x9', 10);
const graph = cellGraph(shape);
const gridCells = graph.cells();

// Givens, as drawn in the payload.
const givens = [
  ['R1C2', 4], ['R2C7', 7], ['R3C2', 8], ['R3C4', 5], ['R3C9', 4],
  ['R4C4', 6], ['R4C9', 1], ['R5C5', 2], ['R5C8', 7], ['R6C1', 9],
  ['R6C5', 5], ['R7C1', 5], ['R7C4', 3], ['R8C6', 8], ['R8C7', 6],
].map(([cell, value]) => new Given(cell, value));

// The main grid only ever plays 1-9; the 10th value is reserved for the
// cage-total layer below.
const gridDomain = graph.makeReplicate(new Given(gridCells[0], ...range(1, 9)));

// 10 cages, as drawn in the payload. None carries a printed total (every
// cage's total field is blank/whitespace).
const cages = [
  ['R1C4', 'R1C5'],
  ['R2C1', 'R2C2'],
  ['R3C3'],
  ['R5C2', 'R5C3', 'R5C4'],
  ['R6C3'],
  ['R8C3', 'R8C4', 'R8C5'],
  ['R8C1', 'R9C1', 'R9C2'],
  ['R2C6', 'R3C6', 'R4C6'],
  ['R1C8', 'R2C8'],
  ['R6C9', 'R7C9', 'R7C8', 'R7C7'],
];

// One aux cell per cage holding that cage's own (unprinted) total, 1-10 by
// the widened shape's default domain -- no extra restriction needed.
const totals = new Var('CT', 'cage totals (unprinted, one per cage)', cages.length);

// Per cage: no repeated digit among its cells, and its digits sum to that
// cage's own total cell (`EqualSum` ties the cage's cell segment and the
// single-cell total segment to the same sum).
const cageConstraints = cages.flatMap((cells, i) => [
  new AllDifferent(...cells),
  new EqualSum(cells, [totals.cell(i + 1)]),
]);

// The 10 totals are a different number each -- combined with each total's
// 1-10 domain and there being exactly 10 of them, this forces them to be a
// permutation of 1..10, i.e. "each sums to a different number between 1 and
// 10" and every such number is used exactly once.
const totalsDistinct = new AllDifferent(...totals.cells());

return [
  shape,
  ...givens,
  gridDomain,
  totals,
  ...cageConstraints,
  totalsDistinct,
];
