// Title: Sudon'tku
// Author: Isaac Resnikoff
// Video: https://www.youtube.com/watch?v=2tgiH5QldMM
// Source: https://app.crackingthecryptic.com/sudoku/3Tbt4Ftqnj

// Normal sudoku rules are explicitly cancelled: no digit may appear exactly
// once in any row, column, box, or cage, but each of 1-9 still totals nine
// occurrences across the grid. Cage totals are also negated: a cage's digits
// may not sum to its printed total. Thermometers run non-increasing (weakly)
// from the bulb. A black dot forbids a 2:1 ratio between its two cells.
//
// Because rows/columns/boxes do not enforce uniqueness, the grid is built on
// the Raw type, which adds no implicit constraints of its own; every rule
// below is stated explicitly, including the box/row/column groupings.

const shape = new Shape('9x9', '', 'Raw');
const graph = cellGraph(shape);
const N = 9;

// ---------------------------------------------------------------------------
// "No digit appears exactly once" -- one compact NFA per target digit,
// clamped at 2 occurrences (0/1/2+), rejecting only the final count == 1.
// The same 9 compiled machines are reused over every row, column, box, and
// cage: a per-target invariant scanned by one small NFA per target, instead
// of one machine tracking all 9 digit counts at once (which would need
// 3^9 states).
const notExactlyOneNFA = {};
for (let target = 1; target <= N; target++) {
  notExactlyOneNFA[target] = NFA.encodeSpec({
    startState: 0,
    transition: (count, value) => value === target ? Math.min(count + 1, 2) : count,
    accept: (count) => count !== 1,
  }, N);
}
// Over exactly 2 cells, "no digit exactly once" collapses to "both cells
// match" (else each of the two distinct digits would have count 1), so use
// the direct SameValues pairing instead of 9 near-vacuous NFAs.
const noSingletonDigit = (cells, name) => cells.length === 2
  ? [new SameValues(2, ...cells)]
  : Array.from({ length: N }, (_, i) => i + 1)
    .map(d => new NFA(notExactlyOneNFA[d], `${name}-no-single-${d}`, ...cells));

// "Digits cannot sum to the value indicated" -- one NFA per cage tracking the
// running total, clamped to a sink once it has passed the forbidden value
// (sums only grow, so once past it can never return to it). Over exactly 2
// cells this is a direct two-cell relation, so use a Pair instead.
const notCageSum = (forbidden, cells, name) => {
  if (cells.length === 2) {
    const key = Pair.fnToKey((a, b) => a + b !== forbidden, shape);
    return new Pair(key, `${name}-not-sum-${forbidden}`, ...cells);
  }
  const SAFE = forbidden + 1;
  const spec = NFA.encodeSpec({
    startState: 0,
    transition: (sum, value) => {
      if (sum === SAFE) return SAFE;
      const next = sum + value;
      return next > forbidden ? SAFE : next;
    },
    accept: (sum) => sum !== forbidden,
  }, N);
  return new NFA(spec, `${name}-not-sum-${forbidden}`, ...cells);
};

// ---------------------------------------------------------------------------
// Rows, columns, boxes: no digit may appear exactly once in any of them.
const rows = graph.rows();
const cols = graph.columns();
const boxes = graph.boxes();
const regionNoSingletons = [
  ...rows.flatMap((cells, i) => noSingletonDigit(cells, `row${i + 1}`)),
  ...cols.flatMap((cells, i) => noSingletonDigit(cells, `col${i + 1}`)),
  ...boxes.flatMap((cells, i) => noSingletonDigit(cells, `box${i + 1}`)),
];

// Exactly nine of each digit 1-9 across the whole grid.
const allCells = graph.cells();
const nineOfEach = Array.from({ length: N }, (_, i) => i + 1)
  .flatMap(d => Array(9).fill(d));
const digitCounts = new ContainExact(nineOfEach.join('_'), ...allCells);

// ---------------------------------------------------------------------------
// Cages, from the drawn cage boxes. Each is a "no digit exactly once" region
// plus a "does not sum to the printed total" region.
const CAGES = [
  { cells: ['R1C3', 'R2C3'], total: 20 },
  { cells: ['R1C4', 'R1C5', 'R2C5'], total: 6 },
  { cells: ['R1C8', 'R2C8', 'R2C9', 'R3C8', 'R3C7', 'R4C7'], total: 38 },
  { cells: ['R4C9', 'R5C9', 'R6C9'], total: 21 },
  { cells: ['R7C8', 'R7C9'], total: 16 },
  { cells: ['R8C8', 'R8C7'], total: 20 },
  { cells: ['R8C9', 'R9C9'], total: 14 },
  { cells: ['R9C8', 'R9C7'], total: 16 },
  { cells: ['R8C5', 'R9C5'], total: 18 },
  { cells: ['R9C4', 'R9C3'], total: 12 },
  { cells: ['R7C4', 'R7C5', 'R6C5'], total: 18 },
  { cells: ['R7C3', 'R8C3'], total: 8 },
  { cells: ['R6C1', 'R6C2', 'R7C2'], total: 12 },
  { cells: ['R8C1', 'R9C1'], total: 6 },
  { cells: ['R4C3', 'R5C3', 'R6C3'], total: 21 },
  { cells: ['R4C1', 'R3C2', 'R3C1'], total: 12 },
  { cells: ['R3C3', 'R3C4'], total: 2 },
];
const cageConstraints = CAGES.flatMap((cage, i) => [
  ...noSingletonDigit(cage.cells, `cage${i + 1}`),
  notCageSum(cage.total, cage.cells, `cage${i + 1}`),
]);

// ---------------------------------------------------------------------------
// Thermometers: non-increasing (may stay equal) from the bulb. `Pair` applies
// its relation to every consecutive pair in the given order, so one call per
// arm, bulb cell first, covers a whole thermo.
const nonIncreasingKey = Pair.fnToKey((a, b) => a >= b, shape);
const thermoArm = (cells, name) => new Pair(nonIncreasingKey, name, ...cells);

const THERMOS = [
  ['R9C5', 'R8C5', 'R8C4', 'R7C4', 'R7C5', 'R6C5', 'R5C4', 'R4C3', 'R5C3',
    'R6C3', 'R7C3', 'R8C3', 'R8C2', 'R9C1', 'R8C1', 'R7C2', 'R6C2', 'R6C1',
    'R5C2', 'R4C1', 'R3C1', 'R3C2', 'R3C3', 'R3C4', 'R2C5', 'R1C5', 'R1C4'],
  ['R1C2', 'R2C1', 'R1C1'],
  ['R2C4', 'R3C5', 'R4C5', 'R5C5'],
  ['R3C6', 'R4C6', 'R3C7', 'R4C8'],
  ['R5C6', 'R6C6', 'R7C6'],
  ['R7C7', 'R7C8', 'R7C9', 'R8C9'],
  ['R9C8', 'R9C9'],
  ['R6C8', 'R5C7', 'R6C7', 'R5C8', 'R4C7', 'R3C8'],
  // Drawn as two strokes sharing one bulb (R2C9): a single physical thermometer
  // branching into two 2-cell arms, not two independent thermos (only one
  // bulb circle is drawn, at R2C9).
  ['R2C9', 'R1C9'],
  ['R2C9', 'R3C9'],
];
const thermoConstraints = THERMOS.map((cells, i) => thermoArm(cells, `thermo${i + 1}`));

// ---------------------------------------------------------------------------
// Black dot: the one drawn pair (R6C2/R6C3) may not have a ratio of 2 either
// way. Only this pair is marked, so only this pair is constrained.
const notRatio2Key = Pair.fnToKey((a, b) => a !== 2 * b && b !== 2 * a, shape);
const blackDot = new Pair(notRatio2Key, 'black dot', 'R6C2', 'R6C3');

return [
  shape,
  digitCounts,
  ...regionNoSingletons,
  ...cageConstraints,
  ...thermoConstraints,
  blackDot,
];
