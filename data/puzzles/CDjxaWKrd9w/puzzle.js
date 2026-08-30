// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=CDjxaWKrd9w
// Source: https://cracking-the-cryptic.web.app/sudoku/Q6RdM9PRR8

// Normal sudoku rules apply (the ISS 9x9 baseline). Cages show the sum of the
// *different* digits in the cage (no repeats), except that one cell per row,
// column and box is a "hidden zero": it keeps its real digit for every other
// rule, but a cage's total counts it as 0 instead of its digit. There is
// exactly one hidden-zero cell behind each digit 1-9.
//
// Modelled with a Var overlay `zero` shadowing the grid: zero(cell) is 0 for
// an ordinary cell, or the cell's own digit when that cell is the hidden
// zero. digit - zero(cell) is then the cage-sum contribution (the digit
// normally, 0 when hidden), and a cage total becomes one Sum over the digits
// plus the negated overlay.  A plain zero(cell)==0 test can't tell which
// digit was hidden, so the "one hidden zero per digit" rule is read off the
// nonzero occurrences of the overlay directly, not off the grid digits.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const zero = graph.makeOverlay('VZ');

// zero(cell) is constrained to 0 or the paired grid digit; nothing else.
const zeroKey = Pair.fnToKey((digit, z) => z === 0 || z === digit, shape);

// Cage cell lists and totals as drawn; the cages do not partition the grid.
const CAGES = [
  [4, 'R1C2', 'R1C3'],
  [16, 'R2C1', 'R2C2', 'R2C3'],
  [4, 'R3C1', 'R3C2'],
  [7, 'R4C2', 'R5C2'],
  [3, 'R5C1', 'R6C1'],
  [23, 'R7C1', 'R7C2', 'R8C2', 'R8C1'],
  [2, 'R9C1', 'R9C2'],
  [11, 'R7C3', 'R9C3', 'R8C3'],
  [23, 'R1C4', 'R1C5', 'R2C5'],
  [5, 'R2C4', 'R3C4', 'R3C5'],
  [17, 'R3C6', 'R4C6', 'R5C6'],
  [16, 'R4C4', 'R5C4'],
  [10, 'R5C5', 'R6C5'],
  [0, 'R6C4'], // single cell: total 0 forces R6C4 to be a hidden zero.
  [6, 'R8C4', 'R8C5'],
  [13, 'R8C6', 'R9C6'],
  [4, 'R1C7', 'R2C7', 'R2C8'],
  [11, 'R3C7', 'R3C8'],
  [5, 'R4C7', 'R4C8', 'R4C9'],
  [18, 'R6C8', 'R6C9', 'R7C9'],
  [6, 'R7C8', 'R8C8', 'R8C9'],
];

const cages = CAGES.flatMap(([total, ...cells]) => [
  ...(cells.length > 1 ? [new AllDifferent(...cells)] : []),
  // A single-cell cage's total-0 is "digit == zero(cell)" (this cell is the
  // hidden zero); SameValues expresses that plain equality more directly
  // than a coefficient Sum.
  cells.length === 1 && total === 0
    ? new SameValues(2, cells[0], zero.at(cells[0]))
    : new Sum(total, ...cells, ...cells.map(c => [zero.at(c), -1])),
]);

// Exactly one hidden-zero cell per house: on a 9-cell house, that is exactly
// eight zero(cell) values of 0 (ContainExact is a strict count), leaving the
// ninth free to equal its own digit.
const houseZeroCount = house =>
  new ContainExact('0_0_0_0_0_0_0_0', ...zero.at(house));

return [
  shape,
  zero.toVar('hidden zero'),

  // Restrict the playable grid to true sudoku digits 1-9; the widened '0-9'
  // range above exists only so the overlay can hold 0.
  graph.makeReplicate(new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),

  ...graph.cells().map(cell => new Pair(zeroKey, 'hidden zero', cell, zero.at(cell))),

  ...graph.rows().map(houseZeroCount),
  ...graph.columns().map(houseZeroCount),
  ...graph.boxes().map(houseZeroCount),

  // One hidden zero behind each digit 1-9: across the whole grid the overlay's
  // nonzero occurrences (there are nine, one per house above) must be exactly
  // a permutation of 1-9.
  new ContainExact('1_2_3_4_5_6_7_8_9', ...zero.cells()),

  ...cages,
];
