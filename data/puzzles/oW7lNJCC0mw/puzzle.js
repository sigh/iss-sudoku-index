// Title: The Lost Killer Islands
// Author: Patrick Junke
// Video: https://www.youtube.com/watch?v=oW7lNJCC0mw
// Source: https://sudokupad.app/gssntzkary

// Rules encoded here, in full:
//  * Normal Sudoku rules apply.
//  * Every cell is either sea or land. No 2x2 block is entirely sea, and no
//    2x2 block is entirely land.
//  * All sea cells form a single orthogonally connected group.
//  * A cell with an arrow is a dead end: a sea cell whose only orthogonally
//    adjacent sea cell is the one the arrow points at. All dead ends are
//    marked, so no other sea cell touches exactly one sea cell.
//  * Land cells form islands of four orthogonally connected cells, and two
//    different islands never touch, not even diagonally.
//  * Each island's four digits are all different and add up to 14.
//  * The two digits either side of an X add up to 10, and those two cells are
//    of the same kind (both sea or both land). The two digits either side of a
//    red dot add up to 12. All X's and red dots are given, so no other pair of
//    orthogonally adjacent cells adds to 10 or to 12.
//
// An island is four orthogonally connected cells, so it is one of the 19 fixed
// tetrominoes. That bound is what makes the islands expressible: an island is
// small enough to be named by the offset from each of its cells back to the
// island's first cell in reading order, and every such offset lies in a small
// fixed set. Two Var overlays per cell carry that offset -- VA the row part,
// VB the column part -- with a value of its own in each meaning "sea".

const UP = [-1, 0], DOWN = [1, 0], LEFT = [0, -1], RIGHT = [0, 1];
const DOWN_LEFT = [1, -1], DOWN_RIGHT = [1, 1];

// Drawn marks. The X's and red dots are the circles the source draws on cell
// edges, named by the two cells each circle sits between; the arrows are the
// two in-cell strokes, named by their cell and the neighbour they point at.
const X_PAIRS = [['R7C3', 'R7C4'], ['R1C5', 'R2C5']];
const DOT_PAIRS = [
  ['R3C6', 'R3C7'], ['R7C2', 'R7C3'], ['R8C2', 'R8C3'], ['R9C7', 'R9C8'],
  ['R6C5', 'R7C5'], ['R7C7', 'R8C7'], ['R8C5', 'R9C5'],
];
const ARROWS = [{ cell: 'R9C4', dir: UP }, { cell: 'R1C9', dir: LEFT }];

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const numValues = geometry.numValues;
const gridCells = graph.cells();

const key = (cells) => JSON.stringify(cells);
// Compiling an NFA spec is expensive and most cells share one: memoise by the
// spec's parameters so each distinct machine is built once.
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

// --- The shapes an island can be ----------------------------------------
// Every fixed tetromino, translated so its first cell in reading order sits at
// [0, 0]. An island is stored by pointing each of its cells at that first
// cell, so these offset sets are the shapes an island may take. The square
// tetromino is kept here and excluded by the no-2x2-land rule below.
const SHAPES = (() => {
  let layer = [normalise([[0, 0]])];
  for (let size = 2; size <= 4; size++) {
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
  }
  return layer.sort((a, b) => key(a).localeCompare(key(b)));
})();

// Every offset an island cell can have from its island's first cell, in
// reading order; OFFSETS[0] is [0, 0], the first cell itself.
const OFFSETS = sortCells([...new Map(
  SHAPES.flat().map(o => [key(o), o])).values()]);
const OFFSET_POS = new Map(OFFSETS.map((o, i) => [key(o), i]));
const DR_MIN = Math.min(...OFFSETS.map(o => o[0]));
const DC_MIN = Math.min(...OFFSETS.map(o => o[1]));

// --- Var encodings ------------------------------------------------------
// VA/VB: the offset from this cell back to its island's first cell, as
//   VA = dRow - DR_MIN + 1 and VB = dCol - DC_MIN + 1; SEA_A/SEA_B, one past
//   the largest offset value, mean the cell is sea. So a cell is land exactly
//   when VA is not SEA_A, and two cells are in the same island exactly when
//   they resolve to the same first cell.
const encA = (dRow) => dRow - DR_MIN + 1;
const encB = (dCol) => dCol - DC_MIN + 1;
const SEA_A = encA(Math.max(...OFFSETS.map(o => o[0]))) + 1;
const SEA_B = encB(Math.max(...OFFSETS.map(o => o[1]))) + 1;
const FIRST_A = encA(0), FIRST_B = encB(0);
const LAND_A = Array.from({ length: SEA_A - 1 }, (_, i) => i + 1);

const va = graph.makeOverlay('VA');
const vb = graph.makeOverlay('VB');

const ISLAND_SUM = 14;

// --- Per-cell overlay agreement -----------------------------------------
// The two overlays must agree about the cell: either both say sea, or together
// they name an offset an island cell can have whose first cell is still on the
// grid. Applied to [VA, VB] of one cell.
const cellAgreeKey = memo((offsets) => Pair.fnToKey(
  (a, b) => a === SEA_A
    ? b === SEA_B
    : offsets.some(([dr, dc]) => encA(dr) === a && encB(dc) === b),
  numValues));
const cellAgree = gridCells.map(cell => new Pair(
  cellAgreeKey(OFFSETS.filter(([dr, dc]) => graph.step(cell, -dr, -dc))),
  'island-offset', va.at(cell), vb.at(cell)));

// --- Island membership --------------------------------------------------
// Two land cells that touch, orthogonally or diagonally, point at the same
// first cell. Since islands are read as the sets pointing at one first cell,
// that single rule is both "an island is connected" and "two different islands
// never touch, not even diagonally". Read as
// [VA cell, VA neighbour, VB cell, VB neighbour] for a neighbour at [dr, dc].
const sameIslandNFA = memo((dRow, dCol) => NFA.encodeSpec({
  startState: { phase: 'a1' },
  transition: (state, value) => {
    if (state.phase === 'a1') return { phase: 'a2', a: value };
    if (state.phase === 'a2') {
      if (state.a === SEA_A || value === SEA_A) return { phase: 'b1', off: true };
      return value - state.a === dRow ? { phase: 'b1', off: false } : undefined;
    }
    if (state.phase === 'b1') {
      return state.off ? { phase: 'b2', off: true } : { phase: 'b2', off: false, b: value };
    }
    if (state.off) return { done: true };
    return value - state.b === dCol ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues));

// --- Island shape -------------------------------------------------------
// One machine per cell, over that cell and every cell that could point at it.
// If the cell is an island's first cell, the set of cells pointing at it must
// be exactly one fixed tetromino -- which fixes the island's membership, its
// size of four and its shape at once. If it is not a first cell, nothing may
// point at it, so every island has exactly one first cell.
// Read as [VA, VB of the cell, then VA, VB of each candidate member].
const shapeNFA = memo((window) => {
  const candidates = SHAPES.map((offsets, index) => ({ offsets, index }))
    .filter(({ offsets }) => offsets.every(
      o => OFFSET_POS.get(key(o)) === 0 || window.includes(OFFSET_POS.get(key(o)))))
    .map(({ index }) => index);
  return NFA.encodeSpec({
    startState: { phase: 'a' },
    transition: (state, value) => {
      if (state.phase === 'a') return { phase: 'b', a: value };
      if (state.phase === 'b') {
        if (state.a !== FIRST_A || value !== FIRST_B) {
          return { phase: 'w', i: 0, cand: null };
        }
        return candidates.length ? { phase: 'w', i: 0, cand: candidates } : undefined;
      }
      if (state.phase === 'w') {
        // The cell list ends here; any further symbol is not this island's.
        if (state.i >= window.length) return undefined;
        return { phase: 'wb', i: state.i, cand: state.cand, a: value };
      }
      // A member declares the offset of the window slot it sits in.
      const [dr, dc] = OFFSETS[window[state.i]];
      const points = state.a === encA(dr) && value === encB(dc);
      if (state.cand === null) {
        return points ? undefined : { phase: 'w', i: state.i + 1, cand: null };
      }
      const cand = state.cand.filter(
        index => SHAPES[index].some(
          o => OFFSET_POS.get(key(o)) === window[state.i]) === points);
      if (!cand.length) return undefined;
      return { phase: 'w', i: state.i + 1, cand };
    },
    accept: (state) => state.phase === 'w' && state.i === window.length,
  }, numValues);
});

// The window of a cell: the slots of OFFSETS whose member cell is on the grid.
const windowOf = (cell) => OFFSETS.map((o, i) => i)
  .filter(i => i > 0 && graph.step(cell, ...OFFSETS[i]));
const memberCells = (cell, window) =>
  window.map(i => graph.step(cell, ...OFFSETS[i]));

// A cell with no member cell on the grid at all (only R9C9) fits no tetromino,
// so its rule is simply that it cannot be an island's first cell.
const notFirstKey = Pair.fnToKey(
  (a, b) => !(a === FIRST_A && b === FIRST_B), numValues);
const shapeRules = gridCells.map(cell => {
  const window = windowOf(cell);
  if (!window.length) {
    return new Pair(notFirstKey, 'island-shape', va.at(cell), vb.at(cell));
  }
  return new NFA(shapeNFA(window), 'island-shape',
    va.at(cell), vb.at(cell),
    ...memberCells(cell, window).flatMap(m => [va.at(m), vb.at(m)]));
});

// --- Island sum ---------------------------------------------------------
// One machine per cell, over the same window: when the cell is an island's
// first cell, the digits of the cells pointing at it -- itself included -- add
// up to 14. Read as [VA, VB, digit of the cell, then VA, VB, digit of each
// candidate member].
const sumNFA = memo((window) => NFA.encodeSpec({
  startState: { phase: 'a' },
  transition: (state, value) => {
    if (state.phase === 'a') return { phase: 'b', a: value };
    if (state.phase === 'b') {
      const isFirst = state.a === FIRST_A && value === FIRST_B;
      return isFirst ? { phase: 'd0' } : { phase: 'skip' };
    }
    // Not a first cell: the rest of the window says nothing about this cell.
    if (state.phase === 'skip') return { phase: 'skip' };
    if (state.phase === 'd0') return { phase: 'w', i: 0, sum: value };
    if (state.phase === 'w') {
      if (state.i >= window.length) return undefined;
      return { phase: 'wb', i: state.i, sum: state.sum, a: value };
    }
    const [dr, dc] = OFFSETS[window[state.i]];
    if (state.phase === 'wb') {
      const points = state.a === encA(dr) && value === encB(dc);
      return { phase: 'wd', i: state.i, sum: state.sum, points };
    }
    const sum = state.sum + (state.points ? value : 0);
    if (sum > ISLAND_SUM) return undefined;
    return { phase: 'w', i: state.i + 1, sum };
  },
  accept: (state) => state.phase === 'skip'
    || (state.phase === 'w' && state.i === window.length && state.sum === ISLAND_SUM),
}, numValues));

const sumRules = gridCells.map(cell => {
  const window = windowOf(cell);
  return new NFA(sumNFA(window), 'island-sum',
    va.at(cell), vb.at(cell), cell,
    ...memberCells(cell, window).flatMap(m => [va.at(m), vb.at(m), m]));
});

// --- Island digits all different ----------------------------------------
// Two cells of one island that share a row, a column or a box already hold
// different digits, so only the displacements that can put two island cells in
// different rows, different columns and different boxes need a rule of their
// own. Read as [VA cell, VA other, VB cell, VB other, digit cell, digit other]
// for a cell pair at displacement [dr, dc]: when both are land and the offsets
// differ by exactly that displacement they are in one island, so their digits
// must differ.
const differNFA = memo((dRow, dCol) => NFA.encodeSpec({
  startState: { phase: 'a1' },
  transition: (state, value) => {
    if (state.phase === 'a1') return { phase: 'a2', a: value };
    if (state.phase === 'a2') {
      const on = state.a !== SEA_A && value !== SEA_A && value - state.a === dRow;
      return { phase: 'b1', on };
    }
    if (state.phase === 'b1') return { phase: 'b2', on: state.on, b: value };
    if (state.phase === 'b2') {
      return { phase: 'd1', on: state.on && value - state.b === dCol };
    }
    if (state.phase === 'd1') return { phase: 'd2', on: state.on, d: value };
    return !state.on || state.d !== value ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues));

// The displacements between two cells of one tetromino, one per unordered
// pair, keeping only those that cross both a row and a column.
const DIAGONAL_SPANS = [...new Map(SHAPES.flatMap(offsets =>
  offsets.flatMap(a => offsets.map(b => [a[0] - b[0], a[1] - b[1]])))
  .filter(([dr, dc]) => dr > 0 && dc !== 0)
  .map(d => [key(d), d])).values()];

const sameBox = (a, b) => {
  const p = parseCellId(a), q = parseCellId(b);
  return Math.floor((p.row - 1) / 3) === Math.floor((q.row - 1) / 3)
    && Math.floor((p.col - 1) / 3) === Math.floor((q.col - 1) / 3);
};

const differRules = DIAGONAL_SPANS.flatMap(([dr, dc]) => gridCells.flatMap(cell => {
  const other = graph.step(cell, dr, dc);
  if (!other || sameBox(cell, other)) return [];
  return [new NFA(differNFA(dr, dc), 'island-differ',
    va.at(cell), va.at(other), vb.at(cell), vb.at(other), cell, other)];
}));

// --- No monochrome 2x2 --------------------------------------------------
// Read as [VA of the four cells of a 2x2 block]: they are not all sea, and not
// all land.
const blockNFA = NFA.encodeSpec({
  startState: { n: 0, sea: 0 },
  transition: (state, value) => (state.n === 4 ? undefined
    : { n: state.n + 1, sea: state.sea + (value === SEA_A ? 1 : 0) }),
  accept: (state) => state.n === 4 && state.sea !== 0 && state.sea !== 4,
}, numValues);

// One template stamped onto every 2x2 block, addressed by its top-left cell.
const blockTargets = gridCells.filter(cell => graph.block(cell, 2, 2));
const blockRules = va.makeReplicate(
  new NFA(blockNFA, 'no-2x2', ...va.at(graph.block(gridCells[0], 2, 2))),
  va.at(blockTargets));

// --- Sea connectivity ---------------------------------------------------
const seaConnected = new ConnectedValues('VA', SEA_A);

// --- Arrows -------------------------------------------------------------
// An arrow cell is sea, the neighbour it points at is sea, and its other
// orthogonal neighbours are land.
const arrowRules = ARROWS.flatMap(({ cell, dir }) => {
  const target = graph.step(cell, ...dir);
  return [
    new Given(va.at(cell), SEA_A),
    new Given(va.at(target), SEA_A),
    ...graph.neighbours(cell).filter(n => n !== target)
      .map(n => new Given(va.at(n), ...LAND_A)),
  ];
});

// Every dead end is marked, so a sea cell that carries no arrow does not touch
// exactly one sea cell. Read as [VA of the cell, then VA of each orthogonal
// neighbour].
const deadEndNFA = memo((count) => NFA.encodeSpec({
  startState: { phase: 'c' },
  transition: (state, value) => {
    if (state.phase === 'c') return { phase: 'n', n: 0, sea: value === SEA_A, count: 0 };
    if (state.n === count) return undefined;
    return { phase: 'n', n: state.n + 1, sea: state.sea,
      count: state.count + (value === SEA_A ? 1 : 0) };
  },
  accept: (state) => state.n === count && (!state.sea || state.count !== 1),
}, numValues));

const arrowCells = ARROWS.map(a => a.cell);
const deadEndRules = gridCells.filter(cell => !arrowCells.includes(cell))
  .map(cell => {
    const neighbours = graph.neighbours(cell);
    return new NFA(deadEndNFA(neighbours.length), 'no-other-dead-end',
      va.at(cell), ...va.at(neighbours));
  });

// --- X's and red dots ---------------------------------------------------
// The X pair is also of one kind: either both cells are sea or both are land.
const sameKindKey = Pair.fnToKey(
  (a, b) => (a === SEA_A) === (b === SEA_A), numValues);
const xRules = X_PAIRS.flatMap(pair => [
  new X(...pair),
  new Pair(sameKindKey, 'x-same-kind', ...va.at(pair)),
]);
const dotRules = DOT_PAIRS.map(pair => new Sum(12, ...pair));

// All X's and red dots are given: every other orthogonally adjacent pair adds
// to neither 10 nor 12. The marked pairs are the ones above.
// One template per direction, stamped onto the left (resp. upper) cell of
// every orthogonally adjacent pair that carries no mark.
const marked = new Set([...X_PAIRS, ...DOT_PAIRS].map(key));
const noMarkKey = Pair.fnToKey((a, b) => a + b !== 10 && a + b !== 12, numValues);
const negativeRules = [RIGHT, DOWN].map(([dr, dc]) => {
  const targets = gridCells.filter(cell => {
    const other = graph.step(cell, dr, dc);
    return other && !marked.has(key([cell, other]));
  });
  const origin = gridCells[0];
  return graph.makeReplicate(
    new Pair(noMarkKey, 'no-x-or-dot', origin, graph.step(origin, dr, dc)),
    targets);
});

const adjacencyRules = gridCells.flatMap(cell =>
  [RIGHT, DOWN, DOWN_RIGHT, DOWN_LEFT].flatMap(([dr, dc]) => {
    const other = graph.step(cell, dr, dc);
    if (!other) return [];
    return [new NFA(sameIslandNFA(dr, dc), 'same-island',
      va.at(cell), va.at(other), vb.at(cell), vb.at(other))];
  }));

return [
  new Shape('9x9'),
  va.toVar('islandRow'),
  vb.toVar('islandCol'),
  ...cellAgree,
  ...adjacencyRules,
  ...shapeRules,
  ...sumRules,
  ...differRules,
  blockRules,
  seaConnected,
  ...arrowRules,
  ...deadEndRules,
  ...xRules,
  ...dotRules,
  ...negativeRules,
];
