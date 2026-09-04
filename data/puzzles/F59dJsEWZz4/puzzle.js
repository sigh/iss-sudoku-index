// Title: Pentomino Yajilin
// Author: KNT
// Video: https://www.youtube.com/watch?v=F59dJsEWZz4
// Source: https://sudokupad.app/QMQdFfF9Fg

// Rules encoded here:
//  - Draw a loop that moves orthogonally between cells and does not visit any
//    cell more than once.
//  - Clue cells are never visited by the loop.
//  - Every other (non-clue, off-loop) cell belongs to a pentomino: a maximal
//    orthogonally-connected group of exactly five such cells. Any connected
//    5-cell polyomino is necessarily one of the 12 pentomino shapes (that is
//    the exhaustive definition of "pentomino"), so "belongs to a pentomino"
//    needs no separate shape check once membership, connectivity and the
//    exact size 5 are enforced.
//  - Pentominoes may not touch each other, even diagonally.
//  - A clue's number counts the pentomino cells in the arrow's direction, to
//    the edge of the board (other clue cells on the ray count for nothing,
//    which the encoding gets for free: a clue cell's own code is never the
//    pentomino code).
// Omitted: "no pentomino shape may repeat". No known construction compares
// the shapes of two solver-discovered components: nothing carries a
// canonical shape descriptor for an anchored group in a bounded NFA state,
// and there is no geometric congruence predicate over two such regions.
// Omitted: that the loop is a single connected cycle (as opposed to several
// disjoint ones). The loop may pass a cell adjacent to itself without
// revisiting it (nothing in the rules forbids that), so a loop-cell can have
// more than two same-state neighbours -- counting neighbours cannot tell that
// apart from a genuine branch, so single-cycle connectivity is asserted over
// the *used edges* (degree from each cell's own code below), which is sound
// but does not itself prove there is only one cycle.

// --- Main-grid codes --------------------------------------------------------
// A printed clue's own digit is not otherwise part of the puzzle's logic (the
// arrow's target is baked into its own counting rule below), but the source
// payload's answer-check convention fills every clue cell with its own digit,
// so clue codes restate that digit (+1, since main-grid codes start at 1) to
// keep this encoding's board a faithful restatement of the setter's answer.
//   1-7    -- a printed clue, one code per digit 0-6 (the digit + 1)
//   PENT   -- a pentomino cell (every pentomino cell shares this one code;
//             which cell and offset is carried by the VA/VB overlays below)
//   HORIZ/VERT/UL/UR/DL/DR -- on the loop, using the two named sides
//             (Up/Down/Left/Right) of the cell
const CLUE_DIGIT = (digit) => digit + 1;
const PENT = 9;
const HORIZ = 10, VERT = 11, UL = 12, UR = 13, DL = 14, DR = 15;
const LOOP_SHAPES = [HORIZ, VERT, UL, UR, DL, DR];
const usesUp = (code) => code === VERT || code === UL || code === UR;
const usesDown = (code) => code === VERT || code === DL || code === DR;
const usesLeft = (code) => code === HORIZ || code === UL || code === DL;
const usesRight = (code) => code === HORIZ || code === UR || code === DR;

const NORTH = [-1, 0], SOUTH = [1, 0], EAST = [0, 1], WEST = [0, -1];

// Clue cells: [row, col, digit, arrow direction]. Position and digit are the
// printed clue (the digit is also the arrow's count); direction is read from
// the drawn arrowhead in that cell. Cell ids are built with makeCellId rather
// than written as literal R#C# strings, since columns/rows past 9 use
// base-17 letters.
const CLUES = [
  [2, 12, 3, WEST], [3, 8, 4, EAST], [4, 6, 6, EAST], [4, 9, 5, WEST],
  [5, 6, 2, SOUTH], [5, 14, 2, NORTH], [6, 2, 3, SOUTH],
  [7, 11, 1, EAST], [8, 7, 3, WEST], [9, 3, 2, NORTH],
  [9, 15, 2, WEST], [10, 10, 4, NORTH], [10, 12, 3, NORTH],
  [12, 1, 0, SOUTH], [13, 12, 1, EAST],
].map(([row, col, digit, dir]) => ({ cell: makeCellId(row, col), digit, dir }));

const shape = new Shape('15x15', 15, 'Raw');
const graph = cellGraph(shape);
const numValues = graph.gridGeometry().numValues;
const gridCells = graph.cells();
const va = graph.makeOverlay('VA');
const vb = graph.makeOverlay('VB');

const isPent = (code) => code === PENT;

// --- Every fixed pentomino (5-cell polyomino), as offsets from its own first
// cell in reading order. Grown by one cell at a time from the monomino, kept
// distinct by their normalised (translated-to-origin) offset list, so the
// result is exactly the 63 fixed pentominoes (12 free shapes x their
// rotations/reflections) -- a fact used only to size the search, not the rule.
const UP = [-1, 0], DOWN = [1, 0], LEFT = [0, -1], RIGHT = [0, 1];
const key = (cells) => JSON.stringify(cells);
const sortCells = (cells) => cells.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
const normalise = (cells) => {
  const [r0, c0] = sortCells(cells)[0];
  return sortCells(cells.map(([r, c]) => [r - r0, c - c0]));
};
const fixedPentominoes = (() => {
  const seen = new Map();
  let layer = [normalise([[0, 0]])];
  for (let size = 2; size <= 5; size++) {
    const next = new Map();
    for (const poly of layer) {
      for (const [r, c] of poly) {
        for (const [dr, dc] of [UP, DOWN, LEFT, RIGHT]) {
          const grown = [r + dr, c + dc];
          if (poly.some(([a, b]) => a === grown[0] && b === grown[1])) continue;
          const norm = normalise([...poly, grown]);
          next.set(key(norm), norm);
        }
      }
    }
    layer = [...next.values()];
    for (const [k, v] of next) seen.set(k, v);
  }
  return [...seen.values()].filter(p => p.length === 5);
})();

// Every offset any pentomino cell can have from its anchor (its shape's first
// cell in reading order); OFFSETS[0] is [0, 0] -- the anchor itself.
const OFFSETS = sortCells([...new Map(
  fixedPentominoes.flatMap(p => p).map(o => [key(o), o])).values()]);
const OFFSET_POS = new Map(OFFSETS.map((o, i) => [key(o), i]));
const DR_MIN = Math.min(...OFFSETS.map(o => o[0]));
const DC_MIN = Math.min(...OFFSETS.map(o => o[1]));
const encA = (dRow) => dRow - DR_MIN + 1;             // 1..5
const encB = (dCol) => dCol - DC_MIN + 1;             // 1..8
const NONE_A = encA(Math.max(...OFFSETS.map(o => o[0]))) + 1;  // 6
const NONE_B = encB(Math.max(...OFFSETS.map(o => o[1]))) + 1;  // 9
const FIRST_A = encA(0), FIRST_B = encB(0);

const memo = (fn) => {
  const cache = new Map();
  return (...args) => {
    const k = key(args);
    if (!cache.has(k)) cache.set(k, fn(...args));
    return cache.get(k);
  };
};

// --- Main grid <-> VA agreement: a cell is a pentomino cell (main code PENT)
// exactly when its VA offset is real (not the sentinel). A Replicate cannot
// mix the main grid with a Var-cell group, so this is a plain per-cell Pair.
const pentAgreeKey = Pair.fnToKey((main, a) => (main === PENT) === (a !== NONE_A), numValues);
const pentAgree = gridCells.map(cell => new Pair(pentAgreeKey, 'pent-agree', cell, va.at(cell)));

// --- Per-cell (VA, VB) agreement: a cell's own offset pair must be either
// the sentinel pair, or a genuine anchor offset whose implied anchor cell
// (this cell minus the offset) is actually on the board. A relation between
// two single cells is a Pair, not an NFA.
const cellAgreeKey = memo((offsets) => Pair.fnToKey((a, b) => a === NONE_A
  ? b === NONE_B
  : offsets.some(([dr, dc]) => encA(dr) === a && encB(dc) === b), numValues));
const cellAgree = gridCells.map(cell => new Pair(
  cellAgreeKey(OFFSETS.filter(([dr, dc]) => graph.step(cell, -dr, -dc))),
  'cell-agree', va.at(cell), vb.at(cell)));

// --- Anchor shape validity: read as [VA, VB] of a candidate anchor cell,
// then [VA, VB] of every cell that could point at it (the window of on-grid
// offsets). If the cell's own pair says "I am an anchor" (offset 0,0), the
// members that actually point at it (VA/VB matching the offset exactly) must
// be exactly the members of one of the 63 fixed pentominoes -- which pins
// connectivity, shape and the exact size 5 all at once. If the cell's own
// pair says otherwise, nothing may point at it.
const shapeNFA = memo((window) => {
  const candidates = fixedPentominoes
    .map((offsets, index) => index)
    .filter(index => fixedPentominoes[index].every(
      o => OFFSET_POS.get(key(o)) === 0 || window.includes(OFFSET_POS.get(key(o)))));
  return NFA.encodeSpec({
    startState: { phase: 'a' },
    transition: (state, value) => {
      if (state.phase === 'a') return { phase: 'b', a: value };
      if (state.phase === 'b') {
        const isAnchor = state.a === FIRST_A && value === FIRST_B;
        if (!isAnchor) return { phase: 'w', i: 0, cand: null };
        return candidates.length ? { phase: 'w', i: 0, cand: candidates } : undefined;
      }
      if (state.phase === 'w') {
        // This symbol is the next window member's own VA -- reduce it to
        // "matches this window slot's expected offset row" immediately, so
        // the carried state is a boolean rather than a full VA value,
        // keeping this field from multiplying the candidate-list state by
        // the VA range.
        if (state.i >= window.length) return undefined;
        const [dr] = OFFSETS[window[state.i]];
        return { phase: 'vb', i: state.i, cand: state.cand, aMatch: value === encA(dr) };
      }
      // phase 'vb': this symbol is that same member's VB.
      const [, dc] = OFFSETS[window[state.i]];
      const points = state.aMatch && value === encB(dc);
      if (state.cand === null) {
        return points ? undefined : { phase: 'w', i: state.i + 1, cand: null };
      }
      const cand = state.cand.filter(idx => fixedPentominoes[idx].some(
        o => OFFSET_POS.get(key(o)) === window[state.i]) === points);
      return cand.length ? { phase: 'w', i: state.i + 1, cand } : undefined;
    },
    accept: (state) => state.phase === 'w' && state.i === window.length,
  }, numValues);
});
// The bottom-right corner has no on-grid offset at all to reach a member
// with (every real offset needs a positive dRow or dCol), so its window is
// empty and the rule reduces to a 2-cell relation: it simply cannot be a
// pentomino anchor, for lack of room.
const cornerAnchorKey = Pair.fnToKey(
  (a, b) => !(a === FIRST_A && b === FIRST_B), numValues);
const shapeRules = gridCells.map(cell => {
  const window = OFFSETS
    .map((_, i) => i)
    .filter(i => i > 0 && graph.step(cell, ...OFFSETS[i]));
  if (window.length === 0) {
    return new Pair(cornerAnchorKey, 'pentomino-shape', va.at(cell), vb.at(cell));
  }
  const members = window.flatMap(i => {
    const member = graph.step(cell, ...OFFSETS[i]);
    return [va.at(member), vb.at(member)];
  });
  return new NFA(shapeNFA(window), 'pentomino-shape', va.at(cell), vb.at(cell), ...members);
});

// --- No two pentominoes touch, not even diagonally: every king-move-adjacent
// pair of pentomino cells must point at the same anchor (so a merely-adjacent
// pair is really the same pentomino); a pair where either side is not a
// pentomino cell is unconstrained. Checked over 4 direction vectors, which
// covers every unordered king-move pair once. Read as [VA cell, VA
// neighbour, VB cell, VB neighbour].
const sameAnchorNFA = memo((dRow, dCol) => NFA.encodeSpec({
  startState: { phase: 'a1' },
  transition: (state, value) => {
    if (state.phase === 'a1') return { phase: 'a2', a: value };
    if (state.phase === 'a2') {
      if (state.a === NONE_A || value === NONE_A) return { phase: 'b1', off: true };
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
const KING_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const noTouchRules = gridCells.flatMap(cell => KING_DIRS.flatMap(([dR, dC]) => {
  const other = graph.step(cell, dR, dC);
  if (!other) return [];
  return [new NFA(sameAnchorNFA(dR, dC), 'no-pentomino-touch',
    va.at(cell), va.at(other), vb.at(cell), vb.at(other))];
}));

// --- Loop shape: each loop cell names which two of its sides the loop uses
// there; a pentomino/clue cell uses none of its sides. Edge agreement between
// every orthogonally-adjacent pair -- one side's "uses toward the other" must
// match the other's "uses back" -- makes every loop cell degree-2 (over used
// edges, so a loop cell may still sit adjacent to a same-state cell it is not
// linked to) and every pentomino/clue cell degree-0, with no dangling edge.
// A 2-regular graph is a disjoint union of simple cycles: no revisit, no
// branch. This does not by itself rule out more than one cycle -- see the
// omission noted above.
const edgeAgreeKey = (usesA, usesB) => Pair.fnToKey(
  (a, b) => usesA(a) === usesB(b), numValues);
const edgeRightKey = edgeAgreeKey(usesRight, usesLeft);
const edgeDownKey = edgeAgreeKey(usesDown, usesUp);
// Every instance is the same relation shifted by one column (or row), so
// Replicate it once per direction instead of stamping 210 individual Pairs.
const rightCells = gridCells.filter(cell => graph.step(cell, ...EAST));
const downCells = gridCells.filter(cell => graph.step(cell, ...SOUTH));
const edgeRules = [
  graph.makeReplicate(new Pair(edgeRightKey, 'edge-h', 'R1C1', 'R1C2'), rightCells),
  graph.makeReplicate(new Pair(edgeDownKey, 'edge-v', 'R1C1', 'R2C1'), downCells),
];

// Loop-shape codes usable at a cell exclude any side that would point off
// the grid, so a border cell cannot claim to use a non-existent neighbour.
const loopShapeDomain = (cell) => LOOP_SHAPES.filter(code =>
  !(usesUp(code) && !graph.step(cell, ...NORTH)) &&
  !(usesDown(code) && !graph.step(cell, ...SOUTH)) &&
  !(usesLeft(code) && !graph.step(cell, ...WEST)) &&
  !(usesRight(code) && !graph.step(cell, ...EAST)));

// --- Arrow clues: count the pentomino cells (main code PENT) from the clue
// cell to the board edge in the drawn direction.
const countMachine = memo((target) => NFA.encodeSpec({
  startState: { count: 0 },
  transition: ({ count }, value) => {
    const next = count + (isPent(value) ? 1 : 0);
    return next > target ? undefined : { count: next };
  },
  accept: ({ count }) => count === target,
}, numValues));
// A 2-cell relation is a Pair, not an NFA (R13C12's ray is only 2 cells long).
const countPairKey = memo((target) => Pair.fnToKey(
  (a, b) => (isPent(a) ? 1 : 0) + (isPent(b) ? 1 : 0) === target, numValues));
const arrowRules = CLUES.map(({ cell, digit, dir }) => {
  const ray = graph.ray(cell, ...dir).slice(1);
  return ray.length === 2
    ? new Pair(countPairKey(digit), 'arrow-count', ...ray)
    : new NFA(countMachine(digit), 'arrow-count', ...ray);
});

// --- Domains and givens ----------------------------------------------------
// Every cell first gets the widest possible main-grid domain (every clue
// digit code, PENT, and every loop shape) via one Replicate; a border cell
// then gets a narrower Given naming only its own on-grid loop shapes, which
// intersects the wide domain down rather than replacing it. VA/VB get their
// own uniform domains the same way.
const CLUE_CODES = CLUES.map(({ digit }) => CLUE_DIGIT(digit));
const rowDomainWide = graph.makeReplicate(
  new Given(gridCells[0], ...CLUE_CODES, PENT, ...LOOP_SHAPES));
const rowDomainBorders = gridCells
  .filter(cell => loopShapeDomain(cell).length < LOOP_SHAPES.length)
  .map(cell => new Given(cell, ...CLUE_CODES, PENT, ...loopShapeDomain(cell)));
const vaDomain = va.makeReplicate(new Given(va.cells()[0], 1, 2, 3, 4, 5, NONE_A));
const vbDomain = vb.makeReplicate(new Given(vb.cells()[0],
  ...Array.from({ length: NONE_B }, (_, i) => i + 1)));
// Each clue cell holds its own digit's code, restating the setter's own
// answer-check convention (the clue's printed digit fills that cell) so this
// board is a faithful restatement of the setter's board.
const clueGivens = CLUES.map(({ cell, digit }) => new Given(cell, CLUE_DIGIT(digit)));

return [
  shape,
  va.toVar('pentRow'),
  vb.toVar('pentCol'),
  rowDomainWide,
  ...rowDomainBorders,
  vaDomain,
  vbDomain,
  ...clueGivens,
  ...pentAgree,
  ...cellAgree,
  ...shapeRules,
  ...noTouchRules,
  ...edgeRules,
  ...arrowRules,
];
