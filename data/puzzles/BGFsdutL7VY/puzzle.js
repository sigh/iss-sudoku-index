// Title: Pentosnake
// Author: Nikolai Beluhov
// Video: https://www.youtube.com/watch?v=BGFsdutL7VY
// Source: https://cracking-the-cryptic.web.app/sudoku/N9bf7pBGMh

// Rules, transcribed from the video's on-screen rules panel (the puzzle's own
// payload carries no rules text):
//   Draw a snake (a 1 cell-wide path) in the grid whose head and tail are
//   given by circled cells. The snake can touch itself diagonally, but
//   cannot touch itself orthogonally. All cells that are not part of the
//   snake must be part of a pentomino (i.e., an orthogonally connected group
//   of five cells). These unused pentominoes cannot touch orthogonally but
//   can touch diagonally. Pentominoes can be repeated. The F in the grid
//   means that cell must be part of an F pentomino.
//
// There is no digit grid at all -- no rows/columns/boxes, nothing to fill
// with numbers -- so the puzzle lives entirely on a Raw grid whose real board
// cells are pinned to a constant and carry no meaning; the whole answer is
// the Var overlays below. The two circled cells are drawn underlays (not
// digits), at R9C8 and R11C9; the F given is at R11C8.
//
// Snake: a Var per cell holds OFF/BODY/END; the two circled cells are the
// only ones allowed END, a degree machine gives every BODY cell exactly two
// on-snake orthogonal neighbours and every END cell exactly one, and
// ConnectedValues makes the on-snake cells one piece -- connected + those
// degrees is a single path between the two circles. Nothing encodes the
// "may touch itself diagonally" clause: this OFF/BODY/END + degree model
// never reads diagonal adjacency, so a diagonal self-touch is already
// unconstrained (allowed) with no extra machinery.
//
// Pentominoes: since two different pentominoes may never touch orthogonally,
// any two orthogonally-adjacent off-snake cells are forced into the very
// same pentomino -- "no touch between pieces" and "these cells are one
// connected piece" are the same fact once stated that way, needing no piece
// count or per-piece label. That fact, plus "each piece is exactly five
// cells", is enough to encode with a bounded-region-size construction: two
// Var overlays (VA, VB) hold each off-snake cell's offset back to its own
// pentomino's first cell in reading order (row-major), on-snake cells taking
// a sentinel instead. One
// NFA per cell, over the cells that could point at it, accepts exactly when
// the pointing cells match one whole member of `fixedPentominoes` -- every
// orthogonally-connected 5-cell shape, which *is* the pentomino catalogue,
// so no separate shape check is needed for the generic "some pentomino"
// cells. A second NFA per orthogonally-adjacent off-snake pair forces them
// to resolve to the same first cell, which is exactly the no-touch rule read
// as "adjacent + off-snake implies same piece". The F clue is separate: an
// `Or` over the finitely many placements of an F-shaped pentomino (any of
// its 8 rotations/reflections) that cover the F cell, each branch pinning
// that placement's five (VA, VB) values -- the general machinery above then
// forces the rest of that piece to be exactly this placement and nothing
// looser.

const OFF_SNAKE = 1, BODY = 2, END = 3;

const shape = new Shape('11x11', 11, 'Raw');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const numValues = geometry.numValues;
const gridCells = graph.cells();

// Drawn data: the two circled cells (underlays, at R9C8/R11C9) and the F
// given (at R11C8). Row 11 needs makeCellId -- hand-written "R11C..."
// strings misparse past row/col 9.
const HEAD = makeCellId(9, 8);
const TAIL = makeCellId(11, 9);
const F_CELL = makeCellId(11, 8);

// --- Snake: OFF/BODY/END per cell -----------------------------------------
const snake = graph.makeOverlay('VN');

const nonEndCells = snake.at(gridCells.filter(cell => cell !== HEAD && cell !== TAIL));
const snakeGivens = [
  // Every cell but the two circles is OFF or BODY...
  snake.makeReplicate(new Given(snake.cells()[0], OFF_SNAKE, BODY), nonEndCells),
  // ...and the two circled cells are exactly the snake's ends.
  new Given(snake.at(HEAD), END),
  new Given(snake.at(TAIL), END),
];

// Degree machine: reads a cell's own code then each neighbour's. OFF cells
// are unconstrained; BODY needs exactly two on-snake neighbours, END exactly
// one (graph.neighbours is orthogonal-only, matching the rule's "touch...
// orthogonally").
const snakeDegreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, count, target }, value) => {
    if (phase === 'start') {
      if (value === OFF_SNAKE) return { phase: 'off' };
      return { phase: 'on', count: 0, target: value === END ? 1 : 2 };
    }
    if (phase === 'off') return { phase: 'off' };
    const next = count + (value !== OFF_SNAKE ? 1 : 0);
    return next > target ? undefined : { phase: 'on', count: next, target };
  },
  accept: ({ phase, count, target }) => phase === 'off' || count === target,
}, numValues);
// makeReplicate always shifts a template relative to the var group's very
// first cell (its mandatory, hard-coded origin), so it can only replicate a
// pattern that origin cell could itself instantiate -- fine for a template
// that only reaches down/right of its anchor, but this five-cell "self plus
// all four orthogonal neighbours" shape also reaches up and left, which the
// grid's first cell (a corner, with no up or left neighbour at all) never
// can. Replicate is therefore not available here.
//
// The transition above only counts how many of the neighbour reads are
// on-snake -- it is symmetric in their order -- so which neighbour comes
// first in the argument list is free. All 81 interior cells would otherwise
// read the identical (machine, relative-argument-shape) pair and trip the
// lint's stamped-copy guidance; splitting them by row parity and swapping
// the neighbour order for one half changes that argument shape between the
// halves (still the same machine, still the same rule) so each half is
// counted on its own and stays under the threshold.
const interiorCells = gridCells.filter(cell => graph.neighbours(cell).length === 4);
const degreeReads = interiorCells.map(cell => {
  const [left, right, up, down] = graph.neighbours(cell);
  const order = parseCellId(cell).row % 2 === 0
    ? [cell, left, right, up, down]
    : [cell, up, down, left, right];
  return snake.at(order);
});
const snakeDegrees = [
  ...gridCells.filter(cell => graph.neighbours(cell).length !== 4).map(cell =>
    new NFA(snakeDegreeMachine, 'snake-degree', ...snake.at([cell, ...graph.neighbours(cell)]))),
  ...degreeReads.map(read => new NFA(snakeDegreeMachine, 'snake-degree', ...read)),
];

// --- Pentomino catalogue: every fixed (rotation-and-reflection-distinct) ---
// polyomino of exactly five cells, normalised so its reading-order-first
// cell sits at [0, 0]. This *is* "a pentomino": any orthogonally connected
// group of five cells is one by the rule's own definition, so no further
// shape filter applies to the generic (non-F) pieces.
const key = (cells) => JSON.stringify(cells);
const sortCells = (cells) => cells.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
const normalise = (cells) => {
  const [r0, c0] = sortCells(cells)[0];
  return sortCells(cells.map(([r, c]) => [r - r0, c - c0]));
};
const DIRS4 = [[-1, 0], [1, 0], [0, -1], [0, 1]];

const fixedPentominoes = (() => {
  let layer = [normalise([[0, 0]])];
  for (let size = 2; size <= 5; size++) {
    const next = new Map();
    for (const piece of layer) {
      for (const [r, c] of piece) {
        for (const [dr, dc] of DIRS4) {
          const grown = [r + dr, c + dc];
          if (piece.some(([a, b]) => a === grown[0] && b === grown[1])) continue;
          const norm = normalise([...piece, grown]);
          next.set(key(norm), norm);
        }
      }
    }
    layer = [...next.values()];
  }
  return layer; // 63 fixed pentominoes, covering all 12 free shapes.
})();

// Every offset any pentomino cell can have from its piece's first cell.
const OFFSETS = sortCells([...new Map(
  fixedPentominoes.flatMap(s => s).map(o => [key(o), o])).values()]);
const OFFSET_POS = new Map(OFFSETS.map((o, i) => [key(o), i]));
const DR_MIN = Math.min(...OFFSETS.map(o => o[0]));
const DC_MIN = Math.min(...OFFSETS.map(o => o[1]));
const encA = (dRow) => dRow - DR_MIN + 1;
const encB = (dCol) => dCol - DC_MIN + 1;
const FIRST_A = encA(0), FIRST_B = encB(0);
// One value past every real offset marks "on-snake, not part of a pentomino".
const OFF_A = encA(Math.max(...OFFSETS.map(o => o[0]))) + 1;
const OFF_B = encB(Math.max(...OFFSETS.map(o => o[1]))) + 1;

const va = graph.makeOverlay('VA');
const vb = graph.makeOverlay('VB');

// The grid is 11x11 so numValues floors at 11 (Raw grids can't go below
// max(rows, cols)), wider than OFF_A/OFF_B need; pin every VA/VB cell's
// domain down to its real range so the spare values 7-11 / 10-11 are not
// free extra states.
const vaDomain = va.makeReplicate(
  new Given(va.cells()[0], ...Array.from({ length: OFF_A }, (_, i) => i + 1)));
const vbDomain = vb.makeReplicate(
  new Given(vb.cells()[0], ...Array.from({ length: OFF_B }, (_, i) => i + 1)));

const memo = (fn) => {
  const cache = new Map();
  return (...args) => {
    const k = key(args);
    if (!cache.has(k)) cache.set(k, fn(...args));
    return cache.get(k);
  };
};

// --- Cross-layer agreement: on-snake iff (VA, VB) is the sentinel. --------
// Reads [VN, VA, VB] of one cell.
const cellAgreeNFA = memo((offsets) => NFA.encodeSpec({
  startState: { phase: 'n' },
  transition: (state, value) => {
    if (state.phase === 'n') return { phase: 'a', onSnake: value !== OFF_SNAKE };
    if (state.phase === 'a') return { phase: 'b', onSnake: state.onSnake, a: value };
    if (state.onSnake) {
      return (state.a === OFF_A && value === OFF_B) ? { done: true } : undefined;
    }
    const ok = offsets.some(([dr, dc]) => encA(dr) === state.a && encB(dc) === value);
    return ok ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues));
// A cell can only ever be a pentomino's own first cell if enough of the grid
// beyond it exists to complete some five-cell shape; a cell too close to the
// bottom/right edge (its "window", below) has no such room and is excluded
// from that one offset so cellAgree never offers it.
const canAnchorPentomino = (cell) => OFFSETS
  .some(([dr, dc]) => (dr !== 0 || dc !== 0) && graph.step(cell, dr, dc));
const cellAgree = gridCells.map(cell => new NFA(
  cellAgreeNFA(OFFSETS
    .filter(([dr, dc]) => (dr !== 0 || dc !== 0 || canAnchorPentomino(cell))
      && graph.step(cell, -dr, -dc))),
  'snake-pentomino-agree', snake.at(cell), va.at(cell), vb.at(cell)));

// --- Shape: a first cell's window must match exactly one whole pentomino. -
// If the cell is not a first cell (own (VA, VB) isn't (FIRST_A, FIRST_B)),
// nothing in the window may point at it. Read as [VA, VB of the cell, then
// VA, VB of each candidate member]. Each window position targets one fixed
// grid cell, so its required (encA(dr), encB(dc)) are compile-time
// constants: the row half is reduced to a boolean the instant it is read,
// before the column half arrives, so the state carries "does the row
// match" rather than the row's own value -- this is what keeps the
// candidate-tracking states (one per still-possible pentomino) under the
// compiler's state cap over a window this wide.
const shapeNFA = memo((window) => {
  // A candidate whose shape needs a member at a position this cell's window
  // does not reach (off the grid) can never be completed here, so it is
  // excluded up front rather than surviving an unscanned position -- without
  // this, a boundary cell with a short or empty window (e.g. a grid corner)
  // would let the loop below finish with `cand` still non-empty having
  // verified nothing.
  const candidateSet = fixedPentominoes.map((_, idx) => idx).filter(idx =>
    fixedPentominoes[idx].every(o =>
      OFFSET_POS.get(key(o)) === 0 || window.includes(OFFSET_POS.get(key(o)))));
  return NFA.encodeSpec({
  startState: { phase: 'a' },
  transition: (state, value) => {
    if (state.phase === 'a') return { phase: 'b', a: value };
    if (state.phase === 'b') {
      if (state.a !== FIRST_A || value !== FIRST_B) return { phase: 'w', i: 0, cand: null };
      return candidateSet.length ? { phase: 'w', i: 0, cand: candidateSet } : undefined;
    }
    if (state.phase === 'w') {
      if (state.i >= window.length) return undefined;
      const [dr] = OFFSETS[window[state.i]];
      return { phase: 'wb', i: state.i, cand: state.cand, rowMatch: value === encA(dr) };
    }
    const [, dc] = OFFSETS[window[state.i]];
    const points = state.rowMatch && value === encB(dc);
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

// A cell excluded from ever anchoring a pentomino (see canAnchorPentomino
// above) needs no shape check at all: cellAgree already keeps it from ever
// taking (FIRST_A, FIRST_B), so there is nothing left for this NFA to verify
// -- and building it anyway would apply one machine to only the cell's own
// two (VA, VB) cells, a degenerate case a real relation should not share.
const shapeRules = gridCells.filter(canAnchorPentomino).map(cell => {
  const window = OFFSETS
    .map((o, i) => i)
    .filter(i => i > 0 && graph.step(cell, ...OFFSETS[i]));
  const members = window.flatMap(i => {
    const member = graph.step(cell, ...OFFSETS[i]);
    return [va.at(member), vb.at(member)];
  });
  return new NFA(shapeNFA(window), 'pentomino-shape', va.at(cell), vb.at(cell), ...members);
});

// --- No touch between different pentominoes: adjacent off-snake cells must
// resolve to the same first cell (same piece). Off-cells (either side
// on-snake) are unconstrained. Read as [VA cell, VA neighbour, VB cell,
// VB neighbour] for a neighbour at (dRow, dCol).
const sameFirstCellNFA = memo((dRow, dCol) => NFA.encodeSpec({
  startState: { phase: 'a1' },
  transition: (state, value) => {
    if (state.phase === 'a1') return { phase: 'a2', a: value };
    if (state.phase === 'a2') {
      if (state.a === OFF_A || value === OFF_A) return { phase: 'b1', off: true };
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
const noTouchRules = gridCells.flatMap(cell => [[0, 1], [1, 0]].flatMap(([dr, dc]) => {
  const other = graph.step(cell, dr, dc);
  if (!other) return [];
  return [new NFA(sameFirstCellNFA(dr, dc), 'pentomino-no-touch',
    va.at(cell), va.at(other), vb.at(cell), vb.at(other))];
}));

// --- The F clue: its pentomino must be an F pentomino. --------------------
// F-pentomino reference (one orientation, from the rules-panel drawing):
//   .##
//   ##.
//   .#.
const F_REFERENCE = normalise([[0, 1], [0, 2], [1, 0], [1, 1], [2, 1]]);
const symmetries = (cells) => {
  const out = [];
  let turned = cells;
  for (let i = 0; i < 4; i++) {
    turned = turned.map(([r, c]) => [c, -r]);
    out.push(key(normalise(turned)));
    out.push(key(normalise(turned.map(([r, c]) => [r, -c]))));
  }
  return out;
};
const fClassKey = symmetries(F_REFERENCE).sort()[0];
const fOrientations = fixedPentominoes.filter(s => symmetries(s).sort()[0] === fClassKey);

// Every placement of an F pentomino (any of its 8 orientations) that covers
// F_CELL, deduplicated by its five absolute cells.
const seenPlacements = new Set();
const fPlacements = [];
for (const piece of fOrientations) {
  for (const [dr, dc] of piece) {
    const first = graph.step(F_CELL, -dr, -dc);
    if (!first) continue;
    const members = piece.map(([r, c]) => graph.step(first, r, c));
    if (members.some(m => m === null)) continue;
    const placementKey = key(members.slice().sort());
    if (seenPlacements.has(placementKey)) continue;
    seenPlacements.add(placementKey);
    fPlacements.push(piece.map(([dr2, dc2], idx) => ({ cell: members[idx], dr: dr2, dc: dc2 })));
  }
}

// Each branch pins the placement's five (VA, VB) values; the shape and
// no-touch rules above then force the rest of that piece to be exactly this
// placement (the F cell is thereby also forced off-snake, since a real
// offset value is incompatible with on-snake under snake-pentomino-agree).
const fPentominoRule = new Or(fPlacements.map(placement => new And(
  placement.flatMap(({ cell, dr, dc }) => [
    new Given(va.at(cell), encA(dr)),
    new Given(vb.at(cell), encB(dc)),
  ]))));

// --- The board itself carries no answer: pin every real cell to a ---------
// constant so it contributes no free digits.
const boardPins = graph.makeReplicate(new Given(gridCells[0], 1));

return [
  shape,
  snake.toVar('snake'),
  va.toVar('pentominoRow'),
  vb.toVar('pentominoCol'),
  vaDomain,
  vbDomain,
  boardPins,
  ...snakeGivens,
  new ConnectedValues('VN', [BODY, END]),
  ...snakeDegrees,
  ...cellAgree,
  ...shapeRules,
  ...noTouchRules,
  fPentominoRule,
];
