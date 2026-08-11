// Title: Greedy Cages
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=apANReYGX5Y
// Source: https://app.crackingthecryptic.com/sudoku/g2NBLTF6h8

// Rules encoded here:
//   * Normal sudoku.
//   * A "cage" is an orthogonally connected set of cells holding exactly one
//     of the 13 printed clues; its digits sum to the clue's value and never
//     repeat within the cage. Cages do not overlap. Twelve clues give a
//     numeric total; the R9C9 clue is "?", so that cage's total is left
//     unconstrained (still connected, still no repeated digit).
//   * "Greedy": a digit inside a cage cannot appear in any cell orthogonally
//     adjacent to that cage. Equivalently, two orthogonally adjacent cells
//     that do not belong to the same cage must hold different digits.
//
// Omission: the rules never state that the 13 cages tile the whole grid, and
// full coverage is arithmetic-impossible to boot -- every valid grid's rows
// sum to 405 (nine rows of 1..9), the twelve known totals already sum to 177,
// so full coverage would force the "?" cage to sum to 228, far past the 45
// ceiling of any 9-cell no-repeat cage. So cells may fall outside every cage,
// and each cell's label domain includes an explicit "no cage" option; the
// solver is left free to choose it. Nothing else is omitted.
//
// Model: one Var per grid cell (overlay 'VC') holds a label -- 1..13 for the
// cage anchored at that index's clue cell, or NONE for "not in any cage".
// Each clue cell is pinned to its own label (that is what "contains" means).
// Every other cell's domain is NONE plus whichever cage labels can reach it
// (zoneOf, bounded by the largest cage size the clue's arithmetic allows, or
// by the general no-repeat cap of 9 for the unclued "?" cage). Connectivity
// is one ConnectedValues per numbered label. Each cage's digit multiset (sum
// + no-repeat) is read by one NFA scanning that cage's zone as interleaved
// (label, digit) pairs, building a seen-digit bitmask and rejecting a repeat
// outright. The greedy rule is one small NFA, shared across all adjacent
// cell pairs, reading (labelA, digitA, labelB, digitB) and rejecting equal
// digits under unequal labels.

const GRID = '9x9';
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Transcribed from the drawn corner-clue badges. `sum` is null for the "?"
// clue at R9C9.
const CAGES = [
  { cell: 'R1C1', sum: 25 },
  { cell: 'R2C2', sum: 18 },
  { cell: 'R4C1', sum: 13 },
  { cell: 'R6C1', sum: 10 },
  { cell: 'R5C2', sum: 7 },
  { cell: 'R6C3', sum: 5 },
  { cell: 'R4C4', sum: 40 },
  { cell: 'R7C3', sum: 7 },
  { cell: 'R7C8', sum: 7 },
  { cell: 'R5C8', sum: 7 },
  { cell: 'R6C8', sum: 5 },
  { cell: 'R8C7', sum: 33 },
  { cell: 'R9C9', sum: null },
];
const NONE = CAGES.length + 1; // 14: the "not in any cage" label

const gridCells = cellGraph(GRID).cells();
const cellDist = (a, b) => {
  const pa = parseCellId(a), pb = parseCellId(b);
  return Math.abs(pa.row - pb.row) + Math.abs(pa.col - pb.col);
};

// Largest possible cell count for a no-repeat cage summing to `sum`: the
// biggest n with n's smallest-n-digit total <= sum <= n's largest-n-digit
// total. A cage can never exceed 9 cells regardless (only 9 distinct
// digits exist), which is also the bound used for the unclued "?" cage.
const maxCageSize = (sum) => {
  if (sum === null) return DIGITS.length;
  let best = 0;
  for (const n of DIGITS) {
    const min = (n * (n + 1)) / 2;
    const max = (n * (19 - n)) / 2;
    if (min <= sum && sum <= max) best = n;
  }
  return best;
};

// Cells a cage could possibly reach: within (maxSize - 1) orthogonal steps
// of its clue cell, since a connected cage of size <= maxSize needs at least
// (distance + 1) cells to link its clue cell to a cell that far away.
const zones = CAGES.map(({ cell, sum }) => {
  const limit = maxCageSize(sum) - 1;
  return gridCells.filter((c) => cellDist(c, cell) <= limit);
});

const shape = new Shape(GRID, NONE);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const cage = graph.makeOverlay('VC');

// Grid cells hold digits 1-9; the widened range above only exists for labels.
const digitDomain = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));

const clueCellSet = new Map(CAGES.map(({ cell }, i) => [cell, i + 1]));
const labelDomain = gridCells.map((cell) => {
  const forced = clueCellSet.get(cell);
  if (forced) return new Given(cage.at(cell), forced); // the clue cell IS its cage
  const reachable = zones.flatMap((zone, i) => (zone.includes(cell) ? [i + 1] : []));
  return new Given(cage.at(cell), NONE, ...reachable);
});

const connectivity = CAGES.map((_, i) => new ConnectedValues('VC', i + 1));

// One NFA per cage: scan its zone as (label, digit) pairs, building a
// seen-digit bitmask (a repeat is rejected outright) and, when the clue
// gives a total, checking the finished mask sums to it. The "?" cage (sum
// === null) only gets the no-repeat check.
const digitsOfMask = (mask) => DIGITS.filter((d) => mask & (1 << (d - 1)));
const cageContents = CAGES.map(({ sum }, i) => {
  const label = i + 1;
  const machine = NFA.encodeSpec({
    startState: { mask: 0, reading: false, inCage: false },
    transition: (state, value) => {
      if (!state.reading) {
        return { mask: state.mask, reading: true, inCage: value === label };
      }
      if (!state.inCage) {
        return { mask: state.mask, reading: false, inCage: false };
      }
      if (value > DIGITS.length) return undefined; // labels never appear here
      const bit = 1 << (value - 1);
      if (state.mask & bit) return undefined; // no repeated digit in a cage
      return { mask: state.mask | bit, reading: false, inCage: false };
    },
    accept: (state) => {
      if (state.reading) return false;
      if (!state.mask) return false; // the clue cell always contributes >=1 digit
      if (sum === null) return true;
      return digitsOfMask(state.mask).reduce((a, b) => a + b, 0) === sum;
    },
  }, geometry);
  return new NFA(machine, `cage-${label}-contents`,
    ...zones[i].flatMap((cell) => [cage.at(cell), cell]));
});

// Greedy rule, shared by every orthogonally adjacent cell pair: read
// (labelA, digitA, labelB, digitB) in that order and reject only when the
// digits match but the labels don't (a digit leaking across a cage border,
// or into/out of "no cage").
const greedyMachine = NFA.encodeSpec({
  startState: { step: 0 },
  transition: (state, value) => {
    if (state.step === 0) return { step: 1, labelA: value };
    if (state.step === 1) return { step: 2, labelA: state.labelA, digitA: value };
    if (state.step === 2) {
      return { step: 3, labelA: state.labelA, digitA: state.digitA, labelB: value };
    }
    // step 3: value is digitB.
    if (value === state.digitA && state.labelA !== state.labelB) return undefined;
    return { step: 4 };
  },
  accept: (state) => state.step === 4,
}, geometry);

const seenPairs = new Set();
const greedy = [];
for (const cell of gridCells) {
  for (const neighbour of graph.neighbours(cell)) {
    const key = [cell, neighbour].sort().join('-');
    if (seenPairs.has(key)) continue;
    seenPairs.add(key);
    greedy.push(new NFA(greedyMachine, `greedy-${key}`,
      cage.at(cell), cell, cage.at(neighbour), neighbour));
  }
}

return [
  shape,
  cage.toVar('cage'),
  digitDomain,
  ...labelDomain,
  ...connectivity,
  ...cageContents,
  ...greedy,
];
