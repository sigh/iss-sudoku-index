// Title: 250!
// Author: RockyRoer
// Video: https://www.youtube.com/watch?v=STXQn26IVHs
// Source: https://sudokupad.app/q5iopoxvbm

// Digits 0, 2, 5. Every row, column, and 3x3 region contains exactly three
// 0s, three 2s, and three 5s. Each red bulb is a 1-3 digit number (read left
// to right, no leading zero) equal to the product of the digits along its
// arrow.

// The row/column/region rule is a multiset (three 0s, three 2s, three 5s,
// not all-different), which the ISS main grid's automatic row/column
// all-different cannot express. The main grid is reduced to a single unused
// placeholder cell; the real 9x9 grid lives entirely in a Var group with
// explicit row/column/box ContainExact constraints built from scratch (same
// approach as data/puzzles/-dwKlM3DGXo/puzzle.js).

const N = 9;
const GRID = new Var('G', 'Grid', `${N}x${N}`);

// A plain 9x9 reference geometry supplies the row/column/box groupings;
// gridLocator translates those cell lists onto the Var grid. The geometry is
// never itself part of the constraints.
const refGraph = cellGraph('9x9');
const gridLocator = refGraph.makeOverlay('VG');
const cellAt = (r, c) => GRID.cell(r + 1, c + 1); // r, c: 0-indexed

// Rows, columns, and boxes (the ordinary 3x3 blocks): exactly three each of
// 0, 2, 5.
const MULTISET = '0_0_0_2_2_2_5_5_5';
const rows = refGraph.rows().map(row =>
  new ContainExact(MULTISET, ...gridLocator.at(row)));
const cols = refGraph.columns().map(col =>
  new ContainExact(MULTISET, ...gridLocator.at(col)));
const boxes = refGraph.boxes().map(box =>
  new ContainExact(MULTISET, ...gridLocator.at(box)));

// ISS Shape value ranges are contiguous starting at 0 or 1, so {0,2,5} can't
// be declared directly; use range 0-5 (six values) and restrict every real
// grid cell back to the three legal digits.
const digitDomain = gridLocator.makeReplicate(
  [new Given(GRID.cell(1), 0, 2, 5)],
  GRID.cells());

// Bulb cells (the number, left to right) and arrow path cells (the
// product), both [row, col] 0-indexed, from the drawn arrows and bulbs.
const BULBS = [
  { bulb: [[0, 0]], arrow: [[0, 1]] },
  { bulb: [[0, 6]], arrow: [[0, 7], [0, 8]] },
  { bulb: [[0, 3]], arrow: [[0, 4]] },
  { bulb: [[1, 1], [1, 2]], arrow: [[1, 3], [1, 4], [1, 5]] },
  { bulb: [[1, 7], [1, 8]], arrow: [[2, 8], [3, 8], [4, 8]] },
  { bulb: [[5, 7], [5, 8]], arrow: [[6, 8], [7, 8], [8, 8]] },
  { bulb: [[6, 5], [6, 6], [6, 7]], arrow: [[7, 7], [8, 7], [8, 6], [8, 5], [8, 4]] },
  { bulb: [[8, 0], [8, 1], [8, 2]], arrow: [[7, 0], [6, 0], [5, 0], [4, 0], [4, 1]] },
  { bulb: [[2, 2], [2, 3], [2, 4]], arrow: [[2, 5], [3, 5], [3, 6], [4, 6], [5, 6]] },
  { bulb: [[3, 2], [3, 3], [3, 4]], arrow: [[4, 4], [4, 3], [5, 3], [5, 2]] },
  { bulb: [[3, 1]], arrow: [[2, 1]] },
  { bulb: [[7, 2], [7, 3]], arrow: [[7, 4], [6, 4], [5, 5]] },
];

// No leading zero: a 2- or 3-digit bulb's first (leftmost) cell may not be 0.
// A 1-digit bulb has no such restriction (its value may be 0).
const leadingZeroGivens = BULBS
  .filter(({ bulb }) => bulb.length >= 2)
  .map(({ bulb }) => new Given(cellAt(...bulb[0]), 2, 5));

// Each bulb is one NFA scanning its arrow's cells then its own cells,
// reversed (two segments, separated by SEGMENT_BREAK). All digits are in
// {0,2,5}, so an arrow's product is either 0 (any arrow digit is 0) or
// 2^a*5^b (a, b = counts of 2s/5s among the rest).
//
// Segment 1 (arrow cells) builds the running product, clamped to a DEAD
// sink once it exceeds 555 -- the largest representable bulb value (three
// digits, no leading zero) -- since it can then never match.
//
// Segment 2 is the bulb's own cells in *reverse* (ones place first): each
// step compares the cell to the product's current least-significant decimal
// digit (remainder % 10), then divides the remainder by 10. This checks the
// bulb's decimal reading against the product one digit at a time instead of
// building the bulb's numeric value as its own running total and comparing
// two totals at the end -- carrying both a "number so far" and a "product so
// far" cross-multiplies their state spaces (measured: tens of thousands of
// states, well past the 4096 limit) where this reversed digit-peel does not
// (measured: about 150). A digit mismatch has no transition (rejects that
// branch outright); accepting requires remainder === 0 once every bulb cell
// is consumed, i.e. no leftover higher-order digits. Reading the bulb
// right-to-left this way needs no separate digit-position counter, so the
// same spec (and small state count) works for every bulb length.
//
// maxDepth bounds state creation to the longest real arrow+break+bulb chain
// in this puzzle; the spec is shared across differently-sized bulbs, so
// without it the compiler doesn't know when to stop exploring and can run
// past the state limit.
const MAX_DEPTH = Math.max(...BULBS.map(({ bulb, arrow }) => arrow.length + 1 + bulb.length));
const DEAD = -1;
const MAX_BULB = 555;
const bulbArrowSpec = NFA.encodeSpec({
  startState: { phase: 'product', product: 1 },
  transition: (state, v) => {
    if (state.phase === 'product') {
      if (v === SEGMENT_BREAK) {
        return { phase: 'check', remainder: state.product };
      }
      if (state.product === DEAD) return state;
      const next = state.product * v;
      return { phase: 'product', product: next > MAX_BULB ? DEAD : next };
    }
    // phase 'check': peel the reversed bulb cell's digit against the
    // product's remaining least-significant decimal digit.
    if (state.remainder === DEAD) return undefined; // arrow overflowed: never matches
    if (v !== state.remainder % 10) return undefined; // digit mismatch: reject
    return { phase: 'check', remainder: Math.floor(state.remainder / 10) };
  },
  accept: (state) => state.phase === 'check' && state.remainder === 0,
  maxDepth: MAX_DEPTH,
}, 6, { valueOffset: -1, multiSegment: true });

const bulbConstraints = BULBS.map(({ bulb, arrow }, i) => new NFA(
  bulbArrowSpec, `bulb ${i + 1}`,
  arrow.map(([r, c]) => cellAt(r, c)),
  [...bulb].reverse().map(([r, c]) => cellAt(r, c))));

// The single placeholder main-grid cell holds no puzzle information; pin it
// so it doesn't multiply reported solution counts during validation.
return [
  new Shape('1x1', '0-5'),
  GRID,
  new Given('R1C1', 0),
  ...rows,
  ...cols,
  ...boxes,
  digitDomain,
  ...leadingZeroGivens,
  ...bulbConstraints,
];
