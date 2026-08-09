// Title: 250!
// Author: RockyRoer
// Video: https://www.youtube.com/watch?v=STXQn26IVHs
// Source: https://sudokupad.app/q5iopoxvbm

// Digits 0, 2, 5. Every row, column, and 3x3 region contains exactly three
// 0s, three 2s, and three 5s. Each red bulb is a 1-, 2- or 3-digit number
// (read left to right, no leading zero) equal to the product of the digits
// along its arrow. No givens.

// Rows and columns of a Sudoku-type grid are always all-different, which a
// multiset row (three 0s, three 2s, three 5s) cannot satisfy, so the grid is
// Raw: no implicit rows, columns or boxes, so every rule -- including rows,
// columns and boxes -- is stated explicitly below.
const shape = new Shape('9x9', '0-5', 'Raw');
const grid = cellGraph(shape);
// r, c: 0-indexed, matching the [row, col] pairs in BULBS below.
// lint-ok: zero-indexed-cell-math
const cellAt = (r, c) => makeCellId(r + 1, c + 1);

// The regions are the ordinary 3x3 blocks: the drawn blue border network is
// exactly the lattice lines at rows 3, 6 and columns 3, 6.
const MULTISET = '0_0_0_2_2_2_5_5_5';
const rows = grid.rows().map(row => new ContainExact(MULTISET, ...row));
const cols = grid.columns().map(col => new ContainExact(MULTISET, ...col));
const boxRegions = [];
for (let r = 1; r <= 9; r += 3) {
  for (let c = 1; c <= 9; c += 3) {
    boxRegions.push(grid.block(makeCellId(r, c), 3, 3));
  }
}
const boxes = boxRegions.map(box => new ContainExact(MULTISET, ...box));

// Shape value ranges are contiguous, so {0,2,5} cannot be declared directly;
// the range is 0-5 and every cell is restricted back to the three digits.
const digitDomain = grid.makeReplicate(
  [new Given(grid.cells()[0], 0, 2, 5)],
  grid.cells());

// Bulb cells (the number, left to right) and arrow path cells (the product),
// both [row, col] 0-indexed, transcribed from the drawn red bulb overlays and
// their arrows.
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

// "No leading 10's or hundreds digits can be 0": a 2- or 3-digit bulb's
// leftmost cell may not be 0. A 1-digit bulb may be 0.
const leadingZeroGivens = BULBS
  .filter(({ bulb }) => bulb.length >= 2)
  .map(({ bulb }) => new Given(cellAt(...bulb[0]), 2, 5));

// Each bulb is one NFA over two segments: its arrow's cells, then its own
// cells in reverse.
//
// Segment 1 (arrow cells) builds the running product, clamped to a DEAD sink
// once it passes 555 -- the largest bulb value (three digits from {0,2,5},
// no leading zero) -- since it can then never match.
//
// Segment 2 is the bulb's cells reversed, ones place first: each step
// compares the cell to the product's current least-significant decimal digit
// (remainder % 10), then divides the remainder by 10. A mismatch has no
// transition; accepting requires remainder === 0 once every bulb cell is
// consumed, i.e. no leftover higher-order digits. This peels one decimal
// digit at a time rather than carrying a "bulb value so far" alongside a
// "product so far", whose cross product runs past the 4096-state compile
// limit; and reading the bulb right-to-left needs no digit-position counter,
// so one compiled spec serves every bulb length.
//
// maxDepth bounds state creation to the longest real arrow+break+bulb chain;
// the spec is shared across bulb lengths, so without it the compiler has no
// stopping point.
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
    if (state.remainder === DEAD) return undefined; // arrow overflowed
    if (v !== state.remainder % 10) return undefined; // digit mismatch
    return { phase: 'check', remainder: Math.floor(state.remainder / 10) };
  },
  accept: (state) => state.phase === 'check' && state.remainder === 0,
  maxDepth: MAX_DEPTH,
}, 6, { valueOffset: -1, multiSegment: true });

const bulbConstraints = BULBS.map(({ bulb, arrow }, i) => new NFA(
  bulbArrowSpec, `bulb ${i + 1}`,
  arrow.map(([r, c]) => cellAt(r, c)),
  [...bulb].reverse().map(([r, c]) => cellAt(r, c))));

return [
  shape,
  ...rows,
  ...cols,
  ...boxes,
  digitDomain,
  ...leadingZeroGivens,
  ...bulbConstraints,
];
