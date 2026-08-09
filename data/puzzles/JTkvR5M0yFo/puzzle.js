// Title: Different But Still Wrogn
// Author: DiMono
// Video: https://www.youtube.com/watch?v=JTkvR5M0yFo
// Source: https://app.crackingthecryptic.com/sudoku/944Mg3fnJH
//
// Normal sudoku rules apply (rows/columns/3x3 boxes). Every other named rule
// is the *negation* of its usual sudoku-variant meaning:
//   - renban lines (purple/red): every digit that appears repeats (no
//     singleton), and the set of distinct digits used is NOT a run of
//     consecutive integers.
//   - palindrome lines (grey): the sequence does NOT read the same forwards
//     and backwards.
//   - the blue diagonal: same "all repeat" rule as the renban lines.
//   - diagonal arrows outside the grid: the diagonal's digits do NOT sum to
//     the printed value.
//   - outside row/column clues: NOT a valid X-Sum clue AND NOT a valid
//     Skyscraper clue, reading from that side (both readings must fail).
// No thermometer is drawn in this puzzle, so that rule clause has nothing to
// apply to -- omitted because it is vacuous, not because it was dropped.

const graph = cellGraph('9x9');

// ---- Renban / diagonal "all repeat, not consecutive" negation ----
//
// "Must all repeat" means: for every digit 1-9, its count on the line is
// never exactly 1 (0 or >=2 are both fine). One tiny NFA per digit tracks
// only {0, 1, >=2} for that digit and rejects landing on exactly 1.
function noSingletonNFA(cells, digit) {
  const spec = NFA.encodeSpec({
    startState: 0,
    transition: (state, value) =>
      value !== digit ? state : Math.min(state + 1, 2),
    accept: (state) => state !== 1,
    maxDepth: cells.length,
  }, 9);
  return new NFA(spec, `no-singleton-${digit}`, ...cells);
}

function antiAllRepeat(cells) {
  const perDigit = [];
  for (let d = 1; d <= 9; d++) perDigit.push(noSingletonNFA(cells, d));
  return perDigit;
}

// "May not be chosen from consecutive digits" means: the set of distinct
// digits used (irrespective of how many times each repeats) is not a run of
// consecutive integers. A set of k distinct values spans a width
// (max - min + 1) of exactly k iff it has no gaps, i.e. is a run of
// consecutive integers -- so comparing the line's distinct-value count
// (a `CountDistinct` aux Var) against its running (min, max) width avoids
// ever materializing the full seen-digit set: tracking it as a 2^9-state
// bitmask compiles but is impractically slow to reduce, so this stays a
// small interval machine instead. The Var is read as its own leading
// segment, then the line cells follow as one segment.
//
// A single distinct digit (k=1, forced when a 3-cell line's "all repeat"
// clause can only be met by 3 copies of one digit) is not itself a "run of
// consecutive digits" -- "consecutive" needs at least two different values to
// compare -- so k=1 is always allowed regardless of width (which is
// trivially 1 anyway).
const notConsecutiveSetSpec = NFA.encodeSpec({
  startState: { phase: 'clue', k: null, lo: null, hi: null },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      return { phase: 'scan', k: state.k, lo: null, hi: null };
    }
    if (state.phase === 'clue') {
      return { phase: 'clue', k: value, lo: null, hi: null };
    }
    const lo = state.lo === null ? value : Math.min(state.lo, value);
    const hi = state.hi === null ? value : Math.max(state.hi, value);
    return { phase: 'scan', k: state.k, lo, hi };
  },
  accept: (state) => {
    if (state.phase !== 'scan') return false;
    if (state.k === 1) return true;
    return (state.hi - state.lo + 1) !== state.k;
  },
  maxDepth: 12,
}, 9, { multiSegment: true });
function notConsecutiveSetNFA(distinctCell, cells) {
  return new NFA(
    notConsecutiveSetSpec, 'not-consecutive-set', [distinctCell], cells);
}

function antiRenban(cells, distinctCell) {
  return [
    ...antiAllRepeat(cells),
    new CountDistinct(distinctCell, ...cells),
    notConsecutiveSetNFA(distinctCell, cells),
  ];
}

// Drawn renban lines (purple or red), read straight off the drawn path --
// provenance: source `lines` array, colours #d23be7 (purple) and #e6261f
// (red), expanded via the geometry helper.
const renbanLines = [
  ['R4C2', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5'],
  ['R7C2', 'R6C3', 'R5C4'],
  ['R8C3', 'R7C4', 'R6C5'],
  ['R2C3', 'R3C4', 'R4C5'],
  ['R5C6', 'R6C7', 'R7C8'],
  ['R3C5', 'R4C6', 'R5C7'],
  ['R2C5', 'R1C6', 'R2C7', 'R1C8'],
  ['R2C6', 'R3C7', 'R4C7', 'R5C8'],
  ['R5C3', 'R6C4', 'R7C5'],
  ['R6C2', 'R7C3', 'R8C4'],
];

// The blue diagonal (source line colour #34bbe6): only the "all repeat"
// clause applies here -- the rules text gives the diagonal its own sentence
// and it doesn't carry the renban lines' "not consecutive" clause.
const diagonalCells = [
  'R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9',
];

// ---- Palindrome negation: sequence != its own reverse ----
//
// "Does not read the same both ways" means at least one symmetric pair of
// cells differs; encode that directly as an Or of pairwise inequalities
// (the middle cell of an odd-length line is trivially equal to itself, so
// it contributes no pair).
const neqKey = Pair.fnToKey((a, b) => a !== b, 9);
function antiPalindrome(cells) {
  const n = cells.length;
  const pairs = [];
  for (let i = 0; i < Math.floor(n / 2); i++) {
    pairs.push(new Pair(neqKey, 'anti-palindrome', cells[i], cells[n - 1 - i]));
  }
  return new Or(pairs);
}

// Drawn palindrome lines (grey, colour #cfcfcf).
const palindromeLines = [
  ['R7C9', 'R6C9'],
  ['R8C8', 'R8C9'],
  ['R2C1', 'R3C1'],
  ['R5C2', 'R6C2', 'R7C1'],
];

// ---- Diagonal arrows outside the grid: sum != target ----
//
// A running-sum NFA clamped at target+1 (a sink once the sum can only ever
// fail to match) rejects exactly the sequences that sum to target. A 2-cell
// diagonal is just a pairwise inequality instead.
function antiSumConstraint(cells, target) {
  if (cells.length === 2) {
    const key = Pair.fnToKey((a, b) => a + b !== target, 9);
    return new Pair(key, `diagonal-not-sum-${target}`, ...cells);
  }
  const spec = NFA.encodeSpec({
    startState: 0,
    transition: (sum, value) => Math.min(sum + value, target + 1),
    accept: (sum) => sum !== target,
    maxDepth: cells.length,
  }, 9);
  return new NFA(spec, `diagonal-not-sum-${target}`, ...cells);
}

// Diagonal arrow rays, read from the drawn arrowhead into the grid --
// provenance: source `arrows` array paired with the nearest outside-clue
// text overlay (each pairing is the corner's only close candidate).
const diagonalArrows = [
  { cells: ['R1C3', 'R2C2', 'R3C1'], target: 19 },
  { cells: ['R2C9', 'R1C8'], target: 10 },
  { cells: ['R3C9', 'R2C8', 'R1C7'], target: 18 },
];

// ---- Outside row/column clues: not a valid X-Sum, not a valid Skyscraper ----
//
// Anti-X-Sum: the first-seen digit X names a window of length X starting at
// the first cell (X counts itself); freeze a "would this be a valid X-Sum"
// verdict as soon as the window closes, then pass it through unchanged for
// any remaining cells (their digits don't affect an X-Sum clue).
function antiXSumNFA(cells, target) {
  const spec = NFA.encodeSpec({
    startState: { phase: 'scanning', pos: 0, X: null, sum: 0 },
    transition: (state, value) => {
      if (state.phase === 'done') return state;
      const newPos = state.pos + 1;
      if (state.X === null) {
        // First cell: it both sets X and counts as the first summed digit.
        if (newPos === value) return { phase: 'done', decided: value === target };
        return { phase: 'scanning', pos: newPos, X: value, sum: value };
      }
      const newSum = Math.min(state.sum + value, target + 1);
      if (newPos === state.X) return { phase: 'done', decided: newSum === target };
      return { phase: 'scanning', pos: newPos, X: state.X, sum: newSum };
    },
    accept: (state) => state.phase === 'done' && state.decided === false,
    maxDepth: cells.length,
  }, 9);
  return new NFA(spec, `not-xsum-${target}`, ...cells);
}

// Anti-Skyscraper: count digits that beat every digit before them (a
// running max); reject only the count that matches the clue.
function antiSkyscraperNFA(cells, target) {
  const spec = NFA.encodeSpec({
    startState: { tallest: 0, visible: 0 },
    transition: ({ tallest, visible }, value) => ({
      tallest: Math.max(tallest, value),
      visible: visible + (value > tallest ? 1 : 0),
    }),
    accept: ({ visible }) => visible !== target,
    maxDepth: cells.length,
  }, 9);
  return new NFA(spec, `not-skyscraper-${target}`, ...cells);
}

function outsideLaneCells(direction, index) {
  // direction: 'top' | 'bottom' | 'left' | 'right'; index: 1-based row/col.
  // Cells are ordered from the clue's side inward, as X-Sum/Skyscraper need.
  if (direction === 'top') return graph.column(index);
  if (direction === 'bottom') return graph.column(index).slice().reverse();
  if (direction === 'left') return graph.row(index);
  if (direction === 'right') return graph.row(index).slice().reverse();
  throw Error(`unknown direction: ${direction}`);
}

// Outside clues (source `overlays`, matched to a grid edge by position) --
// excludes the 3 corner overlays (19, 10, 18) already claimed above by the
// drawn diagonal arrows.
const outsideLanes = [
  { direction: 'top', index: 1, value: 2 },
  { direction: 'top', index: 5, value: 1 },
  { direction: 'top', index: 7, value: 1 },
  { direction: 'bottom', index: 3, value: 2 },
  { direction: 'bottom', index: 6, value: 1 },
  { direction: 'bottom', index: 8, value: 1 },
  { direction: 'left', index: 1, value: 1 },
  { direction: 'left', index: 3, value: 2 },
  { direction: 'left', index: 5, value: 10 },
  { direction: 'right', index: 2, value: 1 },
  { direction: 'right', index: 5, value: 4 },
  { direction: 'right', index: 6, value: 1 },
];

// One distinct-digit-count Var per renban line, feeding the interval check
// above; the diagonal doesn't need one since it skips that clause.
const distinctCountVar = new Var('D', 'renban distinct-digit count', renbanLines.length);

return [
  new Shape('9x9'),
  distinctCountVar,

  ...renbanLines.flatMap((cells, i) => antiRenban(cells, distinctCountVar.cell(i + 1))),
  ...antiAllRepeat(diagonalCells),

  ...palindromeLines.map(antiPalindrome),

  ...diagonalArrows.map(({ cells, target }) => antiSumConstraint(cells, target)),

  ...outsideLanes.flatMap(({ direction, index, value }) => {
    const cells = outsideLaneCells(direction, index);
    return [antiXSumNFA(cells, value), antiSkyscraperNFA(cells, value)];
  }),
];
