// Title: Tight Spaces
// Author: AnalyticalNinja
// Video: https://www.youtube.com/watch?v=QSQipzdPp7E
// Source: https://app.crackingthecryptic.com/sudoku/8Qn7Q9dJD3

// Rules encoded here, in full:
//  * Divide the 10x10 grid into orthogonally-connected regions along cell
//    boundaries. No two regions of equal cell-count may share an edge.
//  * Every cell holds the cell-count (size) of its own region.
//  * Each of the five grey lines runs strictly between two circles; every
//    cell on a line holds a value strictly between the two circles' values
//    (`Between`).
//  * One given: R3C8 = 2.
//
// The recorded solution's digit alphabet is 1-5 (5 symbols on a 10x10 board),
// so every region tops out at 5 cells: that bound (not a rule sentence, but
// the shape the domain must have) is what makes the region encoding local and
// finite -- a region's cells sit within taxicab distance 4 of its first cell
// in reading order (row-major, ties broken by column), so there are only 21
// possible offsets back to that first cell.
//
// Two Var overlays per cell name a cell's offset back to its region's first
// cell, as a base-5 pair (VA, VB) over an index 0-20 into the 21 offsets
// (VA = index div 5 + 1, VB = index mod 5 + 1; both land in 1-5, the same
// alphabet the board digits use, which keeps every check below small). There
// is no separate "am I in a group" state -- every cell belongs to exactly
// one region -- so the offset alone pins the partition, checked by three
// things:
//  * offset-valid -- (VA, VB) must decode to one of the 21 real offsets
//    (indices 21-24 are unused base-5 combinations), and the implied first
//    cell must stay on the grid.
//  * same-region -- two orthogonally adjacent cells with equal digits must
//    point at the same first cell: if two adjacent cells hold the same
//    digit but disagree about their first cell, the encoding would let two
//    same-sized regions touch, which is exactly the rule's own "no two
//    equally sized regions share an edge" (a region is the maximal connected
//    same-digit group once this holds everywhere: two such groups merging at
//    a shared edge would force one shared, larger digit-mismatched first
//    cell, caught by region-size below). Cells with different digits are
//    unconstrained relative to each other. Checked via a lookup table (built
//    once per direction from the 21 offsets), not live row/column
//    arithmetic, since the base-5 index doesn't decompose additively.
//  * has-parent -- a cell not itself a first cell needs at least one real
//    orthogonal neighbour holding the same digit. Without this, a cell could
//    freely choose an offset that arithmetically resolves to some unrelated
//    cell's position as "first cell" while having no actual connected path
//    there: same-region only constrains cells that already sit next to a
//    same-digit neighbour, so an isolated cell's offset would otherwise go
//    unconstrained. This doesn't re-check the offset arithmetic itself (that
//    part is already forced, for every same-digit neighbour, by same-region);
//    it only rules out a cell inventing an offset with no same-digit
//    neighbour to have inherited it from. Chaining cell to cell back from any
//    member this way necessarily reaches an actual declared first cell
//    (index 0) through only real, same-digit, adjacent steps.
//  * region-size -- one machine per cell, over that cell and every other
//    cell that could point at it (window: every non-zero-offset index
//    reachable from it on the grid). If the cell is a first cell (index 0)
//    with digit d, exactly d-1 window cells must point at it (offset index
//    matches) while also holding digit d -- a window cell whose offset
//    geometrically points here but whose digit differs from d is rejected
//    outright (a cell cannot have a same-position first cell of a different
//    size than itself; without this, a same-digit coincidence elsewhere on
//    the grid could inflate the count). If the cell is not a first cell,
//    nothing may point at it. Combined with has-parent (which rules out
//    disconnected coincidental matches), this pins the true connected
//    same-digit component's size to the claimed digit exactly.

const MAXSIZE = 5;
const UP = [-1, 0], DOWN = [1, 0], LEFT = [0, -1], RIGHT = [0, 1];

const key = (cells) => JSON.stringify(cells);
const memo = (fn) => {
  const cache = new Map();
  return (...args) => {
    const k = key(args);
    if (!cache.has(k)) cache.set(k, fn(...args));
    return cache.get(k);
  };
};
const sortCells = (cells) =>
  cells.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
const normalise = (cells) => {
  const [r0, c0] = sortCells(cells)[0];
  return sortCells(cells.map(([r, c]) => [r - r0, c - c0]));
};

// Every fixed polyomino of size 1-5, translated so its first cell in reading
// order sits at [0, 0] -- used only to enumerate every reachable offset
// (OFFSETS below), not carried into any NFA state.
const fixedShapes = (() => {
  const seen = new Map();
  let layer = [normalise([[0, 0]])];
  seen.set(key(layer[0]), layer[0]);
  for (let size = 2; size <= MAXSIZE; size++) {
    const next = new Map();
    for (const shape of layer) {
      for (const [r, c] of shape) {
        for (const [dr, dc] of [UP, DOWN, LEFT, RIGHT]) {
          const grown = [r + dr, c + dc];
          if (shape.some(([a, b]) => a === grown[0] && b === grown[1])) continue;
          const norm = normalise([...shape, grown]);
          next.set(key(norm), norm);
        }
      }
    }
    layer = [...next.values()];
    for (const [k, v] of next) seen.set(k, v);
  }
  return [...seen.values()];
})();

// Every offset any shape's cell can have from its first cell, in reading
// order; OFFSETS[0] is [0, 0], the first cell itself. INDEX (0-20) is the
// only thing carried by VA/VB below.
const OFFSETS = sortCells([...new Map(
  fixedShapes.flatMap(s => s).map(o => [key(o), o])).values()]);
const OFFSET_POS = new Map(OFFSETS.map((o, i) => [key(o), i]));

// Base-5 split of an offset index into (VA, VB), both in 1-5.
const BASE = 5;
const toVA = (idx) => Math.floor(idx / BASE) + 1;
const toVB = (idx) => (idx % BASE) + 1;
const toIdx = (a, b) => (a - 1) * BASE + (b - 1);

const shape = new Shape('10x10', `1-${MAXSIZE}`, 'Raw');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const numValues = geometry.numValues;
const gridCells = graph.cells();

const va = graph.makeOverlay('VA');
const vb = graph.makeOverlay('VB');

// --- offset-valid -----------------------------------------------------
// (VA, VB) must decode to one of the 21 real offsets, and the implied first
// cell must stay on the grid: a 2-cell relation, so Pair rather than NFA.
// Memoised by the array of offset indices reachable (as a first cell) from
// this concrete cell. reachableIdx must stay a plain sorted array, not a
// Set: memo() caches by JSON.stringify(args), and JSON.stringify collapses
// every Set to "{}", so a Set argument would silently share one (wrong)
// machine across every cell.
const offsetValidKey = memo((reachableIdx) => {
  const reachableSet = new Set(reachableIdx);
  return Pair.fnToKey((a, b) => reachableSet.has(toIdx(a, b)), shape);
});

const offsetValidRules = gridCells.map(cell => {
  const reachableIdx = OFFSETS.map((o, i) => i)
    .filter(i => graph.step(cell, -OFFSETS[i][0], -OFFSETS[i][1]));
  return new Pair(offsetValidKey(reachableIdx), 'offset-valid', va.at(cell), vb.at(cell));
});

// --- same-region --------------------------------------------------------
// Two orthogonally adjacent cells with equal digits must point at the same
// first cell. Read as [digit cell, digit neighbour, VA cell, VA neighbour,
// VB cell, VB neighbour] for a neighbour at (dRow, dCol). NEXT_IDX[idx] is
// the offset index one step (dRow, dCol) further from the first cell than
// idx, or -1 if that step leaves the 21-offset catalogue.
const sameRegionNFA = memo((dRow, dCol) => {
  const nextIdx = OFFSETS.map(([dr, dc]) => {
    const found = OFFSET_POS.get(key([dr + dRow, dc + dCol]));
    return found === undefined ? -1 : found;
  });
  return NFA.encodeSpec({
    startState: { phase: 'd1' },
    transition: (state, value) => {
      if (state.phase === 'd1') return { phase: 'd2', d: value };
      if (state.phase === 'd2') return { phase: 'a1', same: state.d === value };
      if (state.phase === 'a1') return { phase: 'a2', same: state.same, au: value };
      if (state.phase === 'a2') {
        return { phase: 'b1', same: state.same, au: state.au, av: value };
      }
      if (state.phase === 'b1') {
        return { phase: 'b2', same: state.same, au: state.au, av: state.av, bu: value };
      }
      // phase 'b2': value is VB of the neighbour.
      if (!state.same) return { done: true };
      const idxU = toIdx(state.au, state.bu);
      const idxV = toIdx(state.av, value);
      return nextIdx[idxU] === idxV ? { done: true } : undefined;
    },
    accept: ({ done }) => done === true,
  }, numValues);
});

const sameRegionRules = gridCells.flatMap(cell => [RIGHT, DOWN].flatMap(([dr, dc]) => {
  const other = graph.step(cell, dr, dc);
  if (!other) return [];
  return [new NFA(sameRegionNFA(dr, dc), 'same-region',
    cell, other, va.at(cell), va.at(other), vb.at(cell), vb.at(other))];
}));

// --- has-parent ----------------------------------------------------------
// A cell that is not itself a first cell needs at least one real orthogonal
// neighbour with the same digit (same-region above already pins the offset
// arithmetic between any such pair). Read as [digit, VA, VB of the cell,
// then digit of each real neighbour in turn].
const parentNFA = memo((neighbourCount) => NFA.encodeSpec({
  startState: { phase: 'd0' },
  transition: (state, value) => {
    if (state.phase === 'd0') return { phase: 'a0', d: value };
    if (state.phase === 'a0') return { phase: 'b0', d: state.d, a: value };
    if (state.phase === 'b0') {
      const root = toIdx(state.a, value) === 0;
      return { phase: 'w', i: 0, root, d: state.d, found: false };
    }
    // phase 'w': value is the i-th neighbour's digit.
    if (state.i >= neighbourCount) return undefined;
    const found = state.found || value === state.d;
    return { phase: 'w', i: state.i + 1, root: state.root, d: state.d, found };
  },
  accept: (st) => st.phase === 'w' && st.i === neighbourCount && (st.root || st.found),
}, numValues));

const parentRules = gridCells.map(cell => {
  const dirs = [UP, DOWN, LEFT, RIGHT].filter(d => graph.step(cell, ...d));
  const neighbours = dirs.map(d => graph.step(cell, ...d));
  return new NFA(parentNFA(dirs.length), 'has-parent',
    cell, va.at(cell), vb.at(cell), ...neighbours);
});

// --- region-size -----------------------------------------------------------
// One machine per cell, over that cell and every cell that could point at it
// (window: a list of offset indices, one per reachable non-zero offset).
// Read as [digit, VA, VB of the cell, then VA, VB, digit of each window
// member in turn -- the member's offset resolves to a single points-here bit
// before its digit is read, so the machine never has to remember a whole
// member's VA value at the same time as another member's digit].
const regionSizeNFA = memo((window) => NFA.encodeSpec({
  startState: { phase: 'd0' },
  transition: (state, value) => {
    if (state.phase === 'd0') return { phase: 'a0', d: value };
    if (state.phase === 'a0') return { phase: 'b0', d: state.d, a: value };
    if (state.phase === 'b0') {
      const root = toIdx(state.a, value) === 0;
      return { phase: 'w', i: 0, root, size: state.d, count: 0 };
    }
    if (state.phase === 'w') {
      // `value` here is the member's VA -- 'w' is the state entered after
      // resolving the previous slot (or after 'b0'), not a placeholder that
      // consumes a symbol of its own; storing it as 'a' and reading VB next
      // keeps every slot at exactly 3 reads (VA, VB, digit).
      if (state.i >= window.length) return undefined;
      return { ...state, phase: 'vb', a: value };
    }
    if (state.phase === 'vb') {
      const pointsGeo = toIdx(state.a, value) === window[state.i];
      return {
        phase: 'md', i: state.i, root: state.root, size: state.size,
        count: state.count, pointsGeo,
      };
    }
    // phase 'md': value is the member's digit.
    if (!state.root) {
      return state.pointsGeo ? undefined
        : { phase: 'w', i: state.i + 1, root: false, size: state.size, count: 0 };
    }
    if (state.pointsGeo && value !== state.size) return undefined;
    const count = state.count + (state.pointsGeo ? 1 : 0);
    if (count > state.size - 1) return undefined;
    return { phase: 'w', i: state.i + 1, root: true, size: state.size, count };
  },
  accept: (st) => st.phase === 'w' && st.i === window.length &&
    (st.root ? st.count === st.size - 1 : true),
}, numValues));

const regionSizeRules = gridCells.map(cell => {
  const window = OFFSETS.map((o, i) => i)
    .filter(i => i > 0 && graph.step(cell, ...OFFSETS[i]));
  const members = window.flatMap(i => {
    const member = graph.step(cell, ...OFFSETS[i]);
    return [va.at(member), vb.at(member), member];
  });
  return new NFA(regionSizeNFA(window), 'region-size',
    cell, va.at(cell), vb.at(cell), ...members);
});

// --- Between lines -----------------------------------------------------
// Cell paths transcribed from the drawn lines and the ten circles at their
// ends; a few strokes end just short of a circle and are read as reaching
// it. Each Between's first and last cell is a circle; the rest are the
// line's own path cells.
// Row/column 10 is written 'a' (ISS cell IDs are base-17 per axis, so a
// two-digit decimal index is not a valid cell ID -- R2C10 must be R2Ca).
const LINE1_PATH = [
  'R5C5', 'R4C5', 'R3C5', 'R2C6', 'R1C6', 'R1C7', 'R1C8', 'R2C9', 'R2Ca',
  'R3Ca', 'R4C9', 'R5Ca', 'R6C9', 'R7Ca', 'R8Ca', 'R9Ca', 'RaC9',
  'RaC8', 'RaC7', 'R9C6', 'RaC5', 'RaC4', 'RaC3', 'RaC2', 'R9C1',
  'R8C1', 'R7C2', 'R6C1', 'R5C1', 'R5C2', 'R5C3',
];
const LINE4_PATH = [
  'R3C1', 'R2C2', 'R1C3', 'R1C4', 'R1C5', 'R2C5', 'R2C4', 'R3C4', 'R4C4',
  'R5C4', 'R6C4', 'R6C5', 'R7C6', 'R7C7', 'R6C8', 'R5C8', 'R4C7', 'R3C6',
];

const betweenLines = [
  new Between('R5C7', 'R6C7', 'R6C6'),
  new Between('R5C6', ...LINE1_PATH, 'R4C3'),
  new Between('R9C2', 'R9C3', 'R8C4', 'R7C4'),
  new Between('R9C4', 'R8C3', 'R7C3'),
  new Between('R2C1', ...LINE4_PATH, 'R4C6'),
];

return [
  shape,
  new Given('R3C8', 2),
  va.toVar('firstCellRow'),
  vb.toVar('firstCellCol'),
  ...offsetValidRules,
  ...sameRegionRules,
  ...parentRules,
  ...regionSizeRules,
  ...betweenLines,
];
