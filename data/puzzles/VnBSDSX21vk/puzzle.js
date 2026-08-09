// Title: Six
// Author: TidepoolSalts
// Video: https://www.youtube.com/watch?v=VnBSDSX21vk
// Source: https://app.crackingthecryptic.com/sudoku/PFr2r23jL3

// Rules encoded here, in full except the one omission noted below:
//  * Normal sudoku: 1-9 once per row, column and 3x3 box.
//  * R4C5, R5C5 and R6C5 are shaded grey in the source and are not "white
//    cells": they take no part in the hexomino system below, only ordinary
//    row/column/box rules.
//  * The other 78 cells split into 13 hexominoes (six orthogonally
//    connected cells each); a hexomino's own six digits are all different.
//    Omitted: "each hexomino must be different" -- shape congruence between
//    solver-discovered regions has no known encoding: it is not a set/sum,
//    a two-cell relation, a regular-language scan, a disjunction, or an
//    expressible per-cell/per-target construction.
//  * Small white dots (edge-drawn): the two cells are in separate
//    hexominoes and their digits are consecutive.
//  * Small black dots (edge-drawn): the two cells are in the same hexomino
//    and one digit is double the other.
//  * Large black dots (drawn at a 2x2 vertex): all four surrounding cells
//    are in the same hexomino.
//  * Large white dots (drawn at a 2x2 vertex): exactly three of the four
//    surrounding cells are in the same hexomino.
//  * A large white dot carrying numbers is also a quadruple clue: those
//    digits must appear among its four surrounding cells (source rule:
//    "these numbers must be in the cells immediately surrounding them").
//    Three of the sixteen large white dots carry numbers; one of them
//    (corner R5C7/R5C8/R6C7/R6C8) is drawn as two overlapping circles
//    ("1 4" and "6") at the same vertex -- read together as one quadruple
//    {1, 4, 6}.
//
// Region model: every grid cell gets a VH label overlay, 1-13 naming its
// hexomino, or 14 ("excluded") for the three grey cells -- ConnectedValues
// needs a whole-grid layer, not a subset. Each label's cells must form one
// orthogonally-connected region (ConnectedValues, one call per label) of
// exactly six cells (countRules, one small counting NFA per label). Two
// cells share a hexomino exactly when their VH values are equal; the dot
// clues below and distinctRules (all-different digits within a hexomino)
// all reduce to that comparison. Label values are otherwise interchangeable
// (the rules never number the hexominoes), so canonicalRule pins one
// representative labelling by requiring label k to first appear, in
// row-major order, before label k+1 -- a symmetry break on the encoding,
// not a puzzle rule.
//
// distinctRules only needs to check pairs of cells that could actually lie
// in one connected six-cell region together: PAIR_OFFSETS, computed below
// by growing every fixed hexomino shape, is every relative offset that
// occurs between two cells of some six-cell polyomino.

const EXCLUDED_CELLS = ['R4C5', 'R5C5', 'R6C5']; // grey cells shaded in the source
const NUM_LABELS = 13;
const EXCLUDED_LABEL = NUM_LABELS + 1;

const shape = new Shape('9x9', EXCLUDED_LABEL);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const numValues = graph.gridGeometry().numValues; // 14 (widened)
const whiteCells = gridCells.filter(c => !EXCLUDED_CELLS.includes(c));

// Treat an excluded (grey) or off-grid cell as absent for hexomino purposes.
const step = (cell, dRow, dCol) => {
  const target = graph.step(cell, dRow, dCol);
  return (target && !EXCLUDED_CELLS.includes(target)) ? target : null;
};

// --- Every relative offset between two cells of some fixed hexomino ------
// Grown from a single cell up to six connected cells; PAIR_OFFSETS is every
// displacement (direction-normalised: dRow > 0, or dRow === 0 and dCol > 0,
// so each unordered pair gets one entry) that can occur between two cells
// of one such shape.
const key = (cells) => JSON.stringify(cells);
const sortCells = (cells) => cells.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
const normalise = (cells) => {
  const [r0, c0] = sortCells(cells)[0];
  return sortCells(cells.map(([r, c]) => [r - r0, c - c0]));
};
const DIRS4 = [[-1, 0], [1, 0], [0, -1], [0, 1]];

const fixedHexominoes = (() => {
  let layer = [normalise([[0, 0]])];
  for (let size = 2; size <= 6; size++) {
    const next = new Map();
    for (const cells of layer) {
      for (const [r, c] of cells) {
        for (const [dr, dc] of DIRS4) {
          const grown = [r + dr, c + dc];
          if (cells.some(([a, b]) => a === grown[0] && b === grown[1])) continue;
          const norm = normalise([...cells, grown]);
          next.set(key(norm), norm);
        }
      }
    }
    layer = [...next.values()];
  }
  return layer; // 216 fixed hexominoes, each 6 [dRow, dCol] offsets
})();

const PAIR_OFFSETS = (() => {
  const seen = new Map();
  for (const offsets of fixedHexominoes) {
    for (const a of offsets) for (const b of offsets) {
      const dRow = b[0] - a[0], dCol = b[1] - a[1];
      if (dRow === 0 && dCol === 0) continue;
      if (dRow < 0 || (dRow === 0 && dCol < 0)) continue;
      seen.set(key([dRow, dCol]), [dRow, dCol]);
    }
  }
  return [...seen.values()];
})();

const memo = (fn) => {
  const cache = new Map();
  return (...args) => {
    const k = key(args);
    if (!cache.has(k)) cache.set(k, fn(...args));
    return cache.get(k);
  };
};

const cc = graph.makeOverlay('VH');

// --- Domain: 14 for the three grey cells; white cells stay unrestricted --
// (1-14). countRules already forces every white cell away from 14: it scans
// only the 78 white cells and requires the 13 labels to account for all of
// them (13 * 6 = 78), so a white cell holding 14 would leave only 77 cells
// for those labels -- one short. A per-white-cell restricting Given is
// therefore redundant with countRules, not an independent rule.
const labelDomainRules = EXCLUDED_CELLS.map(c => new Given(cc.at(c), EXCLUDED_LABEL));

// --- Each label is one connected region of exactly six cells -------------
const connectivityRules = Array.from(
  { length: NUM_LABELS }, (_, i) => new ConnectedValues('VH', i + 1));

const countNFA = memo((label) => NFA.encodeSpec({
  startState: { n: 0 },
  transition: (state, value) => {
    if (value !== label) return { n: state.n };
    if (state.n >= 6) return undefined; // more than six cells of this label
    return { n: state.n + 1 };
  },
  accept: (state) => state.n === 6,
}, numValues));

const countRules = Array.from({ length: NUM_LABELS }, (_, i) => new NFA(
  countNFA(i + 1), 'hexomino-size-6', ...cc.at(whiteCells)));

// --- Break the label-permutation symmetry (13! equivalent labellings) ----
// A label's first row-major occurrence must be one more than the highest
// label already seen.
const canonicalNFA = NFA.encodeSpec({
  startState: { max: 0 },
  transition: (state, value) => {
    if (value === EXCLUDED_LABEL || value <= state.max) return { max: state.max };
    return value === state.max + 1 ? { max: value } : undefined;
  },
  accept: () => true,
}, numValues);
const canonicalRule = new NFA(canonicalNFA, 'canonical-label-order', ...cc.at(gridCells));

// --- Same/different hexomino between two named cells ----------------------
const sameHexomino = (a, b) => new SameValues(2, cc.at(a), cc.at(b));
const differentHexomino = (a, b) => new AllDifferent(cc.at(a), cc.at(b));

// --- All-different digits within a hexomino -------------------------------
const distinctIfSameNFA = NFA.encodeSpec({
  startState: { phase: 'c1' },
  transition: (state, value) => {
    if (state.phase === 'c1') return { phase: 'c2', c: value };
    if (state.phase === 'c2') return { phase: 'd1', same: state.c === value };
    if (state.phase === 'd1') return { phase: 'd2', same: state.same, d: value };
    if (state.phase === 'd2') return { phase: 'done', ok: !state.same || state.d !== value };
    return state; // sink: already decided, ignore the rest
  },
  accept: (state) => state.phase === 'done' && state.ok === true,
}, numValues);

const distinctRules = [];
for (const cellA of whiteCells) {
  for (const [dRow, dCol] of PAIR_OFFSETS) {
    const cellB = step(cellA, dRow, dCol);
    if (!cellB) continue;
    distinctRules.push(new NFA(distinctIfSameNFA, 'hexomino-all-different',
      cc.at(cellA), cc.at(cellB), cellA, cellB));
  }
}

// --- Exactly 3 of the 4 cells around a large white dot share a hexomino --
const largeWhiteNFA = NFA.encodeSpec({
  startState: { phase: 'a', vals: [] },
  transition: (state, value) => {
    if (state.phase !== 'a') return state; // sink: already decided, ignore the rest
    const vals = [...state.vals, value];
    if (vals.length < 4) return { phase: 'a', vals };
    let oddCells = 0;
    for (let i = 0; i < 4; i++) {
      let matches = 0;
      for (let j = 0; j < 4; j++) if (i !== j && vals[i] === vals[j]) matches++;
      if (matches === 0) oddCells++;
    }
    // Exactly one cell matching neither of the others means the remaining
    // three are pairwise equal (value equality is transitive), i.e. a clean
    // 3-1 split.
    return { phase: 'done', ok: oddCells === 1 };
  },
  accept: (state) => state.phase === 'done' && state.ok === true,
}, numValues);

const largeWhiteDot = (tl, tr, bl, br) => new NFA(
  largeWhiteNFA, 'large-white-dot', cc.at(tl), cc.at(tr), cc.at(bl), cc.at(br));

// --- Clue geometry ---------------------------------------------------------

// Small white dots (edge-drawn, white fill): separate hexominoes, digits
// consecutive.
const SMALL_WHITE_DOTS = [
  ['R2C1', 'R2C2'], ['R1C7', 'R2C7'], ['R4C1', 'R5C1'], ['R5C4', 'R6C4'],
  ['R6C3', 'R6C4'], ['R7C7', 'R8C7'], ['R3C4', 'R4C4'],
];
// Small black dots (edge-drawn, black fill): same hexomino, ratio 2.
const SMALL_BLACK_DOTS = [
  ['R7C7', 'R7C8'], ['R1C8', 'R1C9'], ['R1C6', 'R1C7'], ['R1C4', 'R1C5'],
];
// Large black dots (2x2 vertex, black fill): all four cells one hexomino.
// [topLeft, topRight, bottomLeft, bottomRight]
const LARGE_BLACK_DOTS = [
  ['R1C2', 'R1C3', 'R2C2', 'R2C3'],
  ['R2C2', 'R2C3', 'R3C2', 'R3C3'],
  ['R3C6', 'R3C7', 'R4C6', 'R4C7'],
  ['R3C8', 'R3C9', 'R4C8', 'R4C9'],
  ['R8C8', 'R8C9', 'R9C8', 'R9C9'],
  ['R8C5', 'R8C6', 'R9C5', 'R9C6'],
];
// Large white dots (2x2 vertex, white fill): exactly three of four cells one
// hexomino. A few also carry a quadruple clue (digits present among the
// four cells); the R5C7/R5C8/R6C7/R6C8 dot is drawn as two stacked circles
// ("1 4" and "6") read together as one quadruple.
const LARGE_WHITE_DOTS = [
  { cells: ['R4C3', 'R4C4', 'R5C3', 'R5C4'], quad: [8, 8] },
  { cells: ['R5C3', 'R5C4', 'R6C3', 'R6C4'], quad: [7, 7] },
  { cells: ['R5C2', 'R5C3', 'R6C2', 'R6C3'] },
  { cells: ['R5C1', 'R5C2', 'R6C1', 'R6C2'] },
  { cells: ['R6C2', 'R6C3', 'R7C2', 'R7C3'] },
  { cells: ['R7C1', 'R7C2', 'R8C1', 'R8C2'] },
  { cells: ['R8C2', 'R8C3', 'R9C2', 'R9C3'] },
  { cells: ['R8C3', 'R8C4', 'R9C3', 'R9C4'] },
  { cells: ['R7C3', 'R7C4', 'R8C3', 'R8C4'] },
  { cells: ['R6C6', 'R6C7', 'R7C6', 'R7C7'] },
  { cells: ['R6C7', 'R6C8', 'R7C7', 'R7C8'] },
  { cells: ['R6C8', 'R6C9', 'R7C8', 'R7C9'] },
  { cells: ['R5C8', 'R5C9', 'R6C8', 'R6C9'] },
  { cells: ['R5C7', 'R5C8', 'R6C7', 'R6C8'], quad: [1, 4, 6] },
  { cells: ['R2C8', 'R2C9', 'R3C8', 'R3C9'], quad: [7] },
  { cells: ['R2C4', 'R2C5', 'R3C4', 'R3C5'] },
];

const smallWhiteRules = SMALL_WHITE_DOTS.flatMap(([a, b]) =>
  [new WhiteDot(a, b), differentHexomino(a, b)]);
const smallBlackRules = SMALL_BLACK_DOTS.flatMap(([a, b]) =>
  [new BlackDot(a, b), sameHexomino(a, b)]);
const largeBlackRules = LARGE_BLACK_DOTS.flatMap(([tl, tr, bl, br]) => [
  sameHexomino(tl, tr), sameHexomino(tl, bl), sameHexomino(tl, br),
]);
const largeWhiteRules = LARGE_WHITE_DOTS.flatMap(({ cells: [tl, tr, bl, br], quad }) => [
  largeWhiteDot(tl, tr, bl, br),
  ...(quad ? [new Quad(tl, ...quad)] : []),
]);

// --- Givens ----------------------------------------------------------------
const GIVENS = [
  ['R2C6', 4], ['R3C7', 9], ['R5C5', 3], ['R6C8', 3], ['R8C3', 1], ['R9C4', 4],
];

return [
  shape,
  // Widening is only for the hexomino label overlay; puzzle digits stay 1-9.
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
  cc.toVar('hexomino label (1-13), or 14 for a cell in no hexomino'),
  ...labelDomainRules,
  canonicalRule,
  ...connectivityRules,
  ...countRules,
  ...distinctRules,
  ...smallWhiteRules,
  ...smallBlackRules,
  ...largeBlackRules,
  ...largeWhiteRules,
];
