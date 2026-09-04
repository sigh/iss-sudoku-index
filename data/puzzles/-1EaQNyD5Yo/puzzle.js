// Title: Pentominous
// Author: Elyot Grant
// Video: https://www.youtube.com/watch?v=-1EaQNyD5Yo
// Source: https://app.crackingthecryptic.com/sudoku/rf8N7NJRp3

// Rules encoded here, in full:
//  - Divide the 80 white cells of the grid into pentominoes (orthogonally
//    connected five-cell regions); the 64 black cells hold no pentomino.
//  - No two pentominoes of the same shape -- up to rotation and reflection --
//    may share an edge.
// There is no digit content at all: no sudoku layer, no given, no clue.
//
// A pentomino is small enough to be named by the offset from its top-left
// cell (first cell in reading order: leftmost cell of the topmost row) to
// each of its cells. Three whole-grid Var overlays over the white cells only
// carry the tiling: VA/VB hold that offset's row and column parts, VT holds
// the piece's free-pentomino type (1-12, in the PENTOMINO_TYPES order below).

const shape = new Shape('12x12', 12, 'Raw');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const numValues = geometry.numValues;
const gridCells = graph.cells();

// The 64 black cells, transcribed as 1-based (row, col) pairs from the drawn
// 1x1 black-filled underlay squares. Everything else is white. Built via
// geometry.makeCellId so row/col past 9 get the solver's own cell-id digit,
// not a literal two-digit string.
const BLACK_COORDS = [
  [1, 3], [1, 4], [1, 6], [1, 8], [1, 9], [1, 10], [1, 11], [1, 12],
  [2, 12],
  [3, 1], [3, 3], [3, 4], [3, 6], [3, 7], [3, 9], [3, 10], [3, 12],
  [4, 3], [4, 4], [4, 6], [4, 7], [4, 9], [4, 10], [4, 12],
  [5, 1], [5, 12],
  [6, 3], [6, 4], [6, 6], [6, 7], [6, 9], [6, 10], [6, 12],
  [7, 1], [7, 3], [7, 4], [7, 6], [7, 7], [7, 9], [7, 10],
  [8, 1], [8, 12],
  [9, 3], [9, 4], [9, 6], [9, 7], [9, 9], [9, 10], [9, 12],
  [10, 1], [10, 3], [10, 4], [10, 6], [10, 7], [10, 9], [10, 10], [10, 12],
  [12, 3], [12, 4], [12, 6], [12, 7], [12, 8], [12, 9], [12, 10],
];
const BLACK_CELLS = BLACK_COORDS.map(([r, c]) => geometry.makeCellId(r - 1, c - 1));
const blackSet = new Set(BLACK_CELLS);
if (blackSet.size !== 64) throw new Error('black-cell list has duplicates');
const tiledCells = gridCells.filter(cell => !blackSet.has(cell));
const whiteSet = new Set(tiledCells);
if (tiledCells.length !== 80) throw new Error('the white area is not 80 cells');

// --- The twelve free pentominoes, as (row, col) offsets from an arbitrary
// origin. Their order fixes the type numbers 1-12 stamped on the type layer.
const PENTOMINO_TYPES = [
  ['F', [[0, 1], [0, 2], [1, 0], [1, 1], [2, 1]]],
  ['I', [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]]],
  ['L', [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1]]],
  ['N', [[0, 1], [1, 1], [2, 0], [2, 1], [3, 0]]],
  ['P', [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0]]],
  ['T', [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1]]],
  ['U', [[0, 0], [0, 2], [1, 0], [1, 1], [1, 2]]],
  ['V', [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]]],
  ['W', [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2]]],
  ['X', [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]]],
  ['Y', [[0, 1], [1, 0], [1, 1], [2, 1], [3, 1]]],
  ['Z', [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2]]],
];

const key = (cells) => JSON.stringify(cells);
const sortCells = (cells) => cells.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
// Translate a shape so its first cell in reading order sits at [0, 0]; that
// cell is the "top-left cell" the offset overlay is anchored on.
const normalise = (cells) => {
  const [r0, c0] = sortCells(cells)[0];
  return sortCells(cells.map(([r, c]) => [r - r0, c - c0]));
};

// The eight rotations and reflections of a shape. A pentomino "type" is the
// free pentomino, so all eight images (fewer when the shape has symmetry)
// are the same type.
const orientations = (cells) => {
  const out = new Map();
  let turned = cells;
  for (let i = 0; i < 4; i++) {
    turned = turned.map(([r, c]) => [c, -r]);
    for (const image of [turned, turned.map(([r, c]) => [r, -c])]) {
      const norm = normalise(image);
      out.set(key(norm), norm);
    }
  }
  return [...out.values()];
};

// SHAPES[i] = { offsets, type } -- every placement a pentomino may take, as
// the offsets from its top-left cell, tagged with its type number (1-12).
// 63 entries: X 1, I 2, T/U/V/W/Z 4 each, F/L/N/P/Y 8 each.
const SHAPES = PENTOMINO_TYPES.flatMap(([, cells], i) =>
  orientations(cells).map(offsets => ({ offsets, type: i + 1 })));
if (SHAPES.length !== 63) throw new Error('expected 63 oriented pentominoes');

// The 21 distinct offsets, in reading order; OFFSETS[0] is [0, 0], the
// top-left cell itself.
const OFFSETS = sortCells([...new Map(
  SHAPES.flatMap(s => s.offsets).map(o => [key(o), o])).values()]);
const OFFSET_POS = new Map(OFFSETS.map((o, i) => [key(o), i]));
const DR_MIN = Math.min(...OFFSETS.map(o => o[0]));
const DC_MIN = Math.min(...OFFSETS.map(o => o[1]));

// --- Var encodings -------------------------------------------------------
// VA/VB hold the cell's offset from its pentomino's top-left cell, shifted
// into 1..numValues. VT holds the free-pentomino type number of the cell's
// pentomino, so equal VT on two orthogonal neighbours means exactly "same
// pentomino" once the no-touch rule below is in force. All three overlays are
// scoped to the 80 white cells only -- a black cell belongs to no pentomino
// and carries none of them.
const encA = (dRow) => dRow - DR_MIN + 1;
const encB = (dCol) => dCol - DC_MIN + 1;
const FIRST_A = encA(0), FIRST_B = encB(0);

const va = graph.makeOverlay('VA', tiledCells);
const vb = graph.makeOverlay('VB', tiledCells);
const vt = graph.makeOverlay('VT', tiledCells);

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

// A step landing off the grid or on a black cell is not a real neighbour for
// tiling purposes; a pentomino can only ever be built from white cells.
const whiteStep = (cell, dr, dc) => {
  const other = graph.step(cell, dr, dc);
  return other && whiteSet.has(other) ? other : null;
};

// --- Offset domain ---------------------------------------------------------
// A cell's offset must be one a pentomino actually has, and must leave its
// top-left cell on the white area. Whether that top-left cell really anchors
// a pentomino containing this cell is settled by the shape machine below.
const offsetDomain = memo((allowed) => Pair.fnToKey(
  (a, b) => allowed.some(([dr, dc]) => encA(dr) === a && encB(dc) === b),
  numValues));

const offsetRules = tiledCells.map(cell => new Pair(
  offsetDomain(OFFSETS.filter(([dr, dc]) => whiteStep(cell, -dr, -dc))),
  'offset', va.at(cell), vb.at(cell)));

// --- Pentomino shape ---------------------------------------------------
// One machine per white cell, over that cell and every white cell that could
// point at it. If the cell is a pentomino's top-left cell, the set of cells
// pointing at it must be exactly one placement of the type its VT names --
// which fixes the piece's membership, size, connectedness and shape at once.
// If it is not a top-left cell, nothing may point at it.
// Read as [VT, VA, VB of the cell, then VA, VB of each candidate member].
const shapeNFA = memo((window) => {
  const candidates = SHAPES.map((shape, index) => ({ shape, index }))
    .filter(({ shape }) => shape.offsets.every(
      o => OFFSET_POS.get(key(o)) === 0 || window.includes(OFFSET_POS.get(key(o)))));
  return NFA.encodeSpec({
    startState: { phase: 'type' },
    transition: (state, value) => {
      if (state.phase === 'type') return { phase: 'a', type: value };
      if (state.phase === 'a') {
        return { phase: 'b', type: state.type, firstA: value === FIRST_A };
      }
      if (state.phase === 'b') {
        if (!state.firstA || value !== FIRST_B) return { phase: 'w', i: 0, cand: null };
        const cand = candidates
          .filter(c => c.shape.type === state.type).map(c => c.index);
        return cand.length ? { phase: 'w', i: 0, cand } : undefined;
      }
      if (state.phase === 'w') {
        // The cell list ends here; any further symbol is not this piece's.
        if (state.i >= window.length) return undefined;
        const [dr] = OFFSETS[window[state.i]];
        return { phase: 'wb', i: state.i, cand: state.cand, rowOk: value === encA(dr) };
      }
      // A member declares the offset of the window slot it sits in.
      const [, dc] = OFFSETS[window[state.i]];
      const points = state.rowOk && value === encB(dc);
      if (state.cand === null) {
        return points ? undefined : { phase: 'w', i: state.i + 1, cand: null };
      }
      const cand = state.cand.filter(
        index => SHAPES[index].offsets.some(
          o => OFFSET_POS.get(key(o)) === window[state.i]) === points);
      if (!cand.length) return undefined;
      return { phase: 'w', i: state.i + 1, cand };
    },
    accept: (state) => state.phase === 'w' && state.i === window.length,
  }, numValues);
});

const shapeRules = tiledCells.map(cell => {
  const window = OFFSETS.map((o, i) => i)
    .filter(i => i > 0 && whiteStep(cell, ...OFFSETS[i]));
  const members = window.flatMap(i => {
    const member = whiteStep(cell, ...OFFSETS[i]);
    return [va.at(member), vb.at(member)];
  });
  return new NFA(shapeNFA(window), 'piece-shape',
    vt.at(cell), va.at(cell), vb.at(cell), ...members);
});

// --- No-touch between differently-shaped pentominoes ----------------------
// Two orthogonal neighbours share a pentomino exactly when their offsets
// differ by the step between them. Same piece means the same type; different
// pieces that touch must be of different types -- the puzzle's only rule.
// So neighbours carry equal VT if and only if they share a piece.
// Read as [VA cell, VA neighbour, VB cell, VB neighbour, VT cell, VT neighbour].
const sharedPieceNFA = memo((dRow, dCol) => NFA.encodeSpec({
  startState: { phase: 'a1' },
  transition: (state, value) => {
    if (state.phase === 'a1') return { phase: 'a2', a: value };
    if (state.phase === 'a2') {
      return { phase: 'b1', same: value - state.a === dRow };
    }
    if (state.phase === 'b1') return { phase: 'b2', same: state.same, b: value };
    if (state.phase === 'b2') {
      return { phase: 't1', same: state.same && value - state.b === dCol };
    }
    if (state.phase === 't1') return { phase: 't2', same: state.same, t: value };
    return (state.t === value) === state.same ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues));

const RIGHT = [0, 1], DOWN = [1, 0];
const pieceTypeRules = tiledCells.flatMap(cell =>
  [RIGHT, DOWN].flatMap(([dr, dc]) => {
    const other = whiteStep(cell, dr, dc);
    if (!other) return [];
    return [new NFA(sharedPieceNFA(dr, dc), 'piece-type',
      va.at(cell), va.at(other), vb.at(cell), vb.at(other),
      vt.at(cell), vt.at(other))];
  }));

return [
  shape,
  va.toVar('offsetRow'),
  vb.toVar('offsetCol'),
  vt.toVar('pieceType'),
  // The grid carries no digit meaning at all; pin every cell (white and
  // black alike) to a constant so it contributes no freedom of its own.
  graph.makeReplicate(new Given(gridCells[0], 1)),
  ...offsetRules,
  ...shapeRules,
  ...pieceTypeRules,
];
