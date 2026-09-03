// Title: Progressive Divisors
// Author: DiMono
// Video: https://www.youtube.com/watch?v=8hF548RzOT0
// Source: https://tinyurl.com/progressivedivisors

// Rules encoded here:
//   * Normal sudoku.
//   * A Progressive Divisor number of length k is one where, for every i in
//     1..k, its first i digits read as a number divisible by i.
//   * Row 1, read left to right, is a nine digit Progressive Divisor number.
//   * Each arrow printed outside the grid marks one lane. Reading that lane from
//     the arrow inwards, the first N cells are a Progressive Divisor number,
//     where N is the digit in the cell next to the arrow.
//   * Each of the nine row 1 digits lies in its own invisible region. The nine
//     regions do not overlap, each is a group of cells that may branch, digits
//     may repeat inside one, and the region holding R1Cj totals three times the
//     digit in R1Cj. Their size and shape are for the solver to find.
//   * Each cage, read left to right as a two digit number, is divisible by both
//     of its digits or by neither.
// Nothing is omitted.

// The value range is widened to 0-9 so that the region overlays below can use 0
// as their "not in this region" marker; the playable grid keeps 1-9.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const gridDigits = graph.makeReplicate(new Given('R1C1', ...DIGITS));

// A prefix of length i is tested for divisibility by i, and every i in 1..9
// divides lcm(1..9) = 2520, so the prefix value modulo 2520 is all that any
// remaining test reads. That keeps the running value to a bounded state field.
const LCM_1_TO_9 = 2520;

// State: i digits read so far, r the prefix value mod LCM_1_TO_9.
const pdFixedSpec = NFA.encodeSpec({
  startState: { i: 0, r: 0 },
  transition: ({ i, r }, v) => {
    const i2 = i + 1;
    const r2 = r * 10 + v;
    if (r2 % i2 !== 0) return undefined;
    return { i: i2, r: r2 % LCM_1_TO_9 };
  },
  accept: ({ i }) => i === 9,
  maxDepth: 9,
}, shape);

// Same walk, but the clue length is read off the first cell: n is null until
// that cell has been read, then holds the required length, and drops to 0 once
// the Progressive Divisor prefix is complete and the rest of the lane is free.
const pdOutsideSpec = NFA.encodeSpec({
  startState: { n: null, i: 0, r: 0 },
  transition: ({ n, i, r }, v) => {
    if (n === 0) return { n: 0, i: 0, r: 0 };
    const len = (n === null) ? v : n;
    const i2 = i + 1;
    const r2 = r * 10 + v;
    if (r2 % i2 !== 0) return undefined;
    return (i2 === len)
      ? { n: 0, i: 0, r: 0 }
      : { n: len, i: i2, r: r2 % LCM_1_TO_9 };
  },
  accept: ({ n }) => n === 0,
  maxDepth: 9,
}, shape);

const row1 = graph.row(1);
const row1Number = new NFA(pdFixedSpec, 'row1', ...row1);

// The ten arrowheads drawn in the margin ring: '>' above C1 and C6, '<' below
// C1, '>' left of R5, R8 and R9, '<' right of R2, R6, R7 and R9. Each lane is
// listed in the outside-in order its own arrow points.
const outsideClueLanes = [
  graph.column(1),
  [...graph.column(1)].reverse(),
  graph.column(6),
  graph.row(5),
  graph.row(8),
  graph.row(9),
  [...graph.row(2)].reverse(),
  [...graph.row(6)].reverse(),
  [...graph.row(7)].reverse(),
  [...graph.row(9)].reverse(),
];
const outsideClues = outsideClueLanes.map(
  (lane, i) => new NFA(pdOutsideSpec, `clue${i + 1}`, ...lane));

// The two cages drawn in the payload, each a horizontal domino, so the two
// digit number is the pair read left to right.
const cageCells = [
  ['R6C5', 'R6C6'],
  ['R8C8', 'R8C9'],
];
// 10a+b is divisible by a exactly when it is divisible by b, i.e. by both or by
// neither. Grid cells never take the extra 0 symbol, so a and b are 1-9 here.
const cageKey = Pair.fnToKey((a, b) => {
  const n = 10 * a + b;
  return (n % a === 0) === (n % b === 0);
}, shape);
const cages = cageCells.map(
  (cells, i) => new Pair(cageKey, `cage${i + 1}`, ...cells));

// One whole-grid overlay per row 1 digit. Overlay j carries the digit of every
// cell in region j and 0 elsewhere, so the overlay's nonzero cells are region j
// and their total is the region total.
const regionPrefixes = ['VA', 'VB', 'VC', 'VD', 'VE', 'VF', 'VG', 'VH', 'VI'];
const regions = regionPrefixes.map((prefix, j) => ({
  prefix,
  overlay: graph.makeOverlay(prefix),
  anchor: makeCellId(1, j + 1),
}));
const regionVars = regions.map(
  ({ overlay, anchor }) => overlay.toVar(`region of ${anchor}`));
// "These regions may branch": a region is one orthogonally connected group.
const regionConnected = regions.map(
  ({ prefix }) => new ConnectedValues(prefix, DIGITS));
// R1Cj is itself in region j.
const regionAnchors = regions.map(
  ({ overlay, anchor }) => new Given(overlay.at(anchor), ...DIGITS));
// Region total - 3 * R1Cj = 0.
const regionSums = regions.map(
  ({ overlay, anchor }) => new Sum(0, ...overlay.cells(), [anchor, -3]));

// One machine per grid cell, reading its digit and then its nine overlay cells:
// each overlay cell holds 0 or that digit, and at most one holds the digit,
// which is the regions-do-not-overlap rule.
const membershipSpec = NFA.encodeSpec({
  startState: { digit: null, used: false },
  transition: ({ digit, used }, v) => {
    if (digit === null) return { digit: v, used: false };
    if (v === 0) return { digit, used };
    if (v !== digit || used) return undefined;
    return { digit, used: true };
  },
  accept: () => true,
  maxDepth: 10,
}, shape);
const regionMembership = graph.cells().map(cell => new NFA(
  membershipSpec, `in${cell}`,
  cell, ...regions.map(({ overlay }) => overlay.at(cell))));

return [
  shape,
  ...regionVars,
  gridDigits,
  row1Number,
  ...outsideClues,
  ...cages,
  ...regionConnected,
  ...regionAnchors,
  ...regionSums,
  ...regionMembership,
];
