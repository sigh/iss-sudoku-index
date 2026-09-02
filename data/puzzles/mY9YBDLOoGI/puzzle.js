// Title: Pento-doku V
// Author: WombatBreath
// Video: https://www.youtube.com/watch?v=mY9YBDLOoGI
// Source: https://app.crackingthecryptic.com/sudoku/2QNMDD7mjr

// Rules encoded here, in full:
//  * Normal sudoku: 1-9 once per row, column and box.
//  * R5C5 is even and belongs to no pentomino. The other 80 cells are covered
//    by 16 pentominoes, each of one of the nine listed types.
//  * Every listed type is used at least once.
//  * The top-left cell of a pentomino holds that type's digit:
//    1=I, 2=W, 3=T, 4=L, 5=V, 6=X, 7=N, 8=Y, 9=P.
//  * Digits do not repeat within a pentomino.
//  * Two pentominoes of the same type are never orthogonally adjacent.
//  * White dot = consecutive, black dot = 1:2, V = sum 5. Not all are given,
//    so no negative constraint applies to unmarked edges.
//
// "Top-left cell" is read as the first cell in reading order: the leftmost
// cell of the pentomino's topmost row. The phrase orders top before left, so
// top is the primary key and left the tie-break. The bounding box's top-left
// corner is not a reading, because for several listed types (X, N, Y, V, W)
// that corner is not a cell of the shape and so could hold no digit.
//
// A pentomino is small enough to be named by the offset from its top-left cell
// to each of its cells, so three Var overlays carry the tiling: VA and VB hold
// that offset's row and column parts, and VT holds the piece's type.

const RIGHT = [0, 1], DOWN = [1, 0];

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const numValues = geometry.numValues;
const gridCells = graph.cells();

// R5C5 carries the grey square and is the "central even cell" the rules
// exempt from the tiling.
const CENTRE = 'R5C5';
const tiledCells = gridCells.filter(cell => cell !== CENTRE);

// --- Drawn symbols ------------------------------------------------------
// Transcribed from the drawn edge marks: white-filled dots, black-filled dots
// and the "V" text marks, each sitting on the border between two cells.
const WHITE_DOTS = [
  ['R1C1', 'R1C2'], ['R1C1', 'R2C1'], ['R3C4', 'R3C5'], ['R4C5', 'R4C6'],
  ['R4C7', 'R4C8'], ['R4C7', 'R5C7'], ['R7C4', 'R7C5'], ['R7C7', 'R7C8'],
];
const BLACK_DOTS = [
  ['R2C1', 'R2C2'], ['R2C7', 'R2C8'], ['R3C7', 'R4C7'], ['R4C6', 'R4C7'],
  ['R5C2', 'R5C3'], ['R6C1', 'R6C2'], ['R7C8', 'R7C9'], ['R7C9', 'R8C9'],
  ['R8C2', 'R9C2'], ['R9C5', 'R9C6'],
];
const V_MARKS = [
  ['R1C4', 'R1C5'], ['R2C1', 'R3C1'], ['R2C4', 'R3C4'], ['R2C8', 'R3C8'],
  ['R5C2', 'R6C2'], ['R7C2', 'R8C2'], ['R7C3', 'R8C3'], ['R8C6', 'R9C6'],
];

// --- The nine listed pentomino types ------------------------------------
// One drawing per type, in the standard pentomino naming the rules use. The
// array index is one less than the type's digit, so TYPE_ART[t - 1] is the
// shape whose top-left cell must hold digit t.
const TYPE_ART = [
  'XXXXX',                 // 1 = I
  'X..\nXX.\n.XX',         // 2 = W
  'XXX\n.X.\n.X.',         // 3 = T
  'X.\nX.\nX.\nXX',        // 4 = L
  'X..\nX..\nXXX',         // 5 = V
  '.X.\nXXX\n.X.',         // 6 = X
  '.X\n.X\nXX\nX.',        // 7 = N
  '.X\nXX\n.X\n.X',        // 8 = Y
  'XX\nXX\nX.',            // 9 = P
];

const key = (cells) => JSON.stringify(cells);
const sortCells = (cells) =>
  cells.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
// Translate a shape so its first cell in reading order sits at [0, 0]; that
// cell is the "top-left cell" the digit rule names.
const normalise = (cells) => {
  const [r0, c0] = sortCells(cells)[0];
  return sortCells(cells.map(([r, c]) => [r - r0, c - c0]));
};
const parseArt = (art) => normalise(art.split('\n').flatMap(
  (line, r) => [...line].flatMap((ch, c) => ch === 'X' ? [[r, c]] : [])));

// The eight rotations and reflections of a shape. A pentomino "type" is the
// free pentomino, so all eight images are the same type.
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
// the offsets from its top-left cell, tagged with the digit of its type.
// 47 entries: I 2, X 1, T/V/W 4 each, L/N/P/Y 8 each.
const SHAPES = TYPE_ART.flatMap((art, i) =>
  orientations(parseArt(art)).map(offsets => ({ offsets, type: i + 1 })));

// The 21 distinct offsets, in reading order; OFFSETS[0] is [0, 0], the
// top-left cell itself.
const OFFSETS = sortCells([...new Map(
  SHAPES.flatMap(s => s.offsets).map(o => [key(o), o])).values()]);
const OFFSET_POS = new Map(OFFSETS.map((o, i) => [key(o), i]));
const DR_MIN = Math.min(...OFFSETS.map(o => o[0]));
const DC_MIN = Math.min(...OFFSETS.map(o => o[1]));

// --- Var encodings ------------------------------------------------------
// VA/VB hold the cell's offset from its pentomino's top-left cell, shifted
// into 1..9; NONE_A/NONE_B mark R5C5, which is in no pentomino.
// VT holds the type digit of the cell's pentomino, so equal VT on two
// orthogonal neighbours means exactly "same pentomino" once the no-touch rule
// is in force.
const encA = (dRow) => dRow - DR_MIN + 1;
const encB = (dCol) => dCol - DC_MIN + 1;
const NONE_A = encA(Math.max(...OFFSETS.map(o => o[0]))) + 1;
const NONE_B = encB(Math.max(...OFFSETS.map(o => o[1]))) + 1;
const FIRST_A = encA(0), FIRST_B = encB(0);

const va = graph.makeOverlay('VA');
const vb = graph.makeOverlay('VB');
const vt = graph.makeOverlay('VT');

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

// --- Offset domain ------------------------------------------------------
// A cell's offset must be one a pentomino actually has, and must leave its
// top-left cell on the grid. Whether that top-left cell really anchors a
// pentomino containing this cell is settled by the shape machine below.
const offsetDomain = memo((allowed) => Pair.fnToKey(
  (a, b) => allowed.some(([dr, dc]) => encA(dr) === a && encB(dc) === b),
  numValues));

const offsetRules = tiledCells.map(cell => new Pair(
  offsetDomain(OFFSETS.filter(([dr, dc]) => graph.step(cell, -dr, -dc))),
  'offset', va.at(cell), vb.at(cell)));

// --- Pentomino shape ----------------------------------------------------
// One machine per cell, over that cell and every cell that could point at it.
// If the cell is a pentomino's top-left cell, the set of cells pointing at it
// must be exactly one placement of the type its VT names -- which fixes the
// piece's membership, size, connectedness and shape at once. If it is not a
// top-left cell, nothing may point at it.
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

const shapeRules = gridCells.map(cell => {
  const window = OFFSETS.map((o, i) => i)
    .filter(i => i > 0 && graph.step(cell, ...OFFSETS[i]));
  const members = window.flatMap(i => {
    const member = graph.step(cell, ...OFFSETS[i]);
    return [va.at(member), vb.at(member)];
  });
  return new NFA(shapeNFA(window), 'piece-shape',
    vt.at(cell), va.at(cell), vb.at(cell), ...members);
});

// --- Type digit ---------------------------------------------------------
// The top-left cell of a pentomino holds its type's digit.
// Read as [VA, VB, VT, digit] of one cell.
const typeDigitNFA = NFA.encodeSpec({
  startState: { phase: 'a' },
  transition: (state, value) => {
    if (state.phase === 'a') return { phase: 'b', firstA: value === FIRST_A };
    if (state.phase === 'b') {
      return { phase: 't', first: state.firstA && value === FIRST_B };
    }
    if (state.phase === 't') return { phase: 'd', first: state.first, type: value };
    return !state.first || value === state.type ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues);

const typeDigitRules = tiledCells.map(cell => new NFA(
  typeDigitNFA, 'type-digit', va.at(cell), vb.at(cell), vt.at(cell), cell));

// --- Type spread and the no-touch rule ----------------------------------
// Two orthogonal neighbours share a pentomino exactly when their offsets
// differ by the step between them. Same piece means the same type; different
// pieces that touch must be of different types, which is the no-touch rule.
// So neighbours carry equal VT if and only if they share a piece. Read as
// [VA cell, VA neighbour, VB cell, VB neighbour, VT cell, VT neighbour].
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

const pieceTypeRules = tiledCells.flatMap(cell =>
  [RIGHT, DOWN].flatMap(([dr, dc]) => {
    const other = graph.step(cell, dr, dc);
    if (!other || other === CENTRE) return [];
    return [new NFA(sharedPieceNFA(dr, dc), 'piece-type',
      va.at(cell), va.at(other), vb.at(cell), vb.at(other),
      vt.at(cell), vt.at(other))];
  }));

// --- Digits do not repeat in a pentomino --------------------------------
// One machine per ordered pair of cells that could share a piece: if their
// offsets differ by the step between them they are in the same piece, and
// their digits must differ. Pairs sharing a row or a column are left to the
// sudoku rules, which already make them distinct.
// Read as [VA cell, VA other, VB cell, VB other, digit cell, digit other].
const distinctNFA = memo((dRow, dCol) => NFA.encodeSpec({
  startState: { phase: 'a1' },
  transition: (state, value) => {
    if (state.phase === 'a1') return { phase: 'a2', a: value };
    if (state.phase === 'a2') {
      return { phase: 'b1', same: value - state.a === dRow };
    }
    if (state.phase === 'b1') return { phase: 'b2', same: state.same, b: value };
    if (state.phase === 'b2') {
      return { phase: 'd1', same: state.same && value - state.b === dCol };
    }
    if (state.phase === 'd1') return { phase: 'd2', same: state.same, d: value };
    return !state.same || value !== state.d ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues));

// The displacements between two cells of one placement, one per unordered
// pair, dropping the same-row and same-column ones.
const spans = [...new Map(SHAPES.flatMap(({ offsets }) =>
  offsets.flatMap(a => offsets.map(b => [b[0] - a[0], b[1] - a[1]])))
  .filter(([dr, dc]) => dr > 0 && dc !== 0)
  .map(d => [key(d), d])).values()];

const distinctRules = spans.flatMap(([dr, dc]) => tiledCells.flatMap(cell => {
  const other = graph.step(cell, dr, dc);
  if (!other || other === CENTRE) return [];
  return [new NFA(distinctNFA(dr, dc), 'piece-distinct',
    va.at(cell), va.at(other), vb.at(cell), vb.at(other), cell, other)];
}));

// --- Every listed type is used ------------------------------------------
// A cell's VT is its piece's type, so a type is used exactly when some tiled
// cell carries it.
const typesUsed = new ContainAtLeast(
  TYPE_ART.map((_, i) => i + 1).join('_'), ...vt.at(tiledCells));

return [
  new Shape('9x9'),
  // The grey square marks the central cell, which the rules call even.
  new Given(CENTRE, 2, 4, 6, 8),
  va.toVar('offsetRow'),
  vb.toVar('offsetCol'),
  vt.toVar('pieceType'),
  // R5C5 is in no pentomino. Its type label takes no part in any rule above,
  // so it is pinned to keep an inert cell from multiplying solutions.
  new Given(va.at(CENTRE), NONE_A),
  new Given(vb.at(CENTRE), NONE_B),
  new Given(vt.at(CENTRE), 1),
  ...offsetRules,
  ...shapeRules,
  ...typeDigitRules,
  ...pieceTypeRules,
  ...distinctRules,
  typesUsed,
  ...WHITE_DOTS.map(pair => new WhiteDot(...pair)),
  ...BLACK_DOTS.map(pair => new BlackDot(...pair)),
  ...V_MARKS.map(pair => new V(...pair)),
];
