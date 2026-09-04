// Title: Border Count Pentominous
// Author: Gliperal
// Video: https://www.youtube.com/watch?v=eNmcbvdp1xI
// Source: https://app.crackingthecryptic.com/sudoku/9dR9Gtj6R8

// Rules encoded here, in full:
//  * The 10x10 grid is divided into twenty pentominoes (5-cell orthogonally
//    connected regions); every cell belongs to exactly one.
//  * Two pentominoes of the same shape (matching up to rotation and
//    reflection, i.e. the same free pentomino out of all twelve: F, I, L, N,
//    P, T, U, V, W, X, Y, Z) are never orthogonally adjacent.
//  * A clue outside a row/column gives the number of orthogonally-adjacent
//    cell pairs within that line whose two cells belong to different
//    pentominoes ("odd" gives the parity of that count instead of its
//    value). Only the ten labelled lines carry a clue; every other row and
//    column is unconstrained by this rule.
// There is no digit grid and no other rule: the board carries no givens and
// the answer is the tiling itself.

const RIGHT = [0, 1], DOWN = [1, 0];

// A widened Raw grid: the real content lives entirely in the VA/VB/VT
// overlays below, so the 100 grid cells themselves carry no information and
// are pinned to a single value rather than left free -- unpinned they would
// each contribute a free 12-way choice.
const NUM_VALUES = 12;
const graph = cellGraph(new Shape('10x10', NUM_VALUES, 'Raw'));
const geometry = graph.gridGeometry();
const numValues = geometry.numValues;
const gridCells = graph.cells();

// --- The twelve free pentomino types -------------------------------------
// One drawing per type, standard pentomino letters, alphabetical. The array
// index is one less than the type digit VT stores.
const TYPE_ART = [
  '.XX\nXX.\n.X.',   // 1 = F
  'XXXXX',           // 2 = I
  'X.\nX.\nX.\nXX',  // 3 = L
  '.X\n.X\nXX\nX.',  // 4 = N
  'XX\nXX\nX.',      // 5 = P
  'XXX\n.X.\n.X.',   // 6 = T
  'X.X\nXXX',        // 7 = U
  'X..\nX..\nXXX',   // 8 = V
  'X..\nXX.\n.XX',   // 9 = W
  '.X.\nXXX\n.X.',   // 10 = X
  '.X\nXX\n.X\n.X',  // 11 = Y
  'XX.\n.X.\n.XX',   // 12 = Z
];

const key = (cells) => JSON.stringify(cells);
const sortCells = (cells) =>
  cells.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
// Translate a shape so its first cell in reading order sits at [0, 0]. This
// reference cell need not be the bounding box's corner -- for several of
// these shapes (U, N, V, W, Z, Y...) that corner is not a cell of the shape
// at all -- but it exists for every shape and is unique, which is all the
// offset encoding below needs.
const normalise = (cells) => {
  const [r0, c0] = sortCells(cells)[0];
  return sortCells(cells.map(([r, c]) => [r - r0, c - c0]));
};
const parseArt = (art) => normalise(art.split('\n').flatMap(
  (line, r) => [...line].flatMap((ch, c) => ch === 'X' ? [[r, c]] : [])));

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
// the offsets from its reference cell, tagged with the digit of its type.
// 63 entries total (F 8, I 2, L 8, N 8, P 8, T 4, U 4, V 4, W 4, X 1, Y 8, Z 4).
const SHAPES = TYPE_ART.flatMap((art, i) =>
  orientations(parseArt(art)).map(offsets => ({ offsets, type: i + 1 })));

// The 21 distinct offsets, in reading order; OFFSETS[0] is [0, 0], the
// reference cell itself.
const OFFSETS = sortCells([...new Map(
  SHAPES.flatMap(s => s.offsets).map(o => [key(o), o])).values()]);
const OFFSET_POS = new Map(OFFSETS.map((o, i) => [key(o), i]));
const DR_MIN = Math.min(...OFFSETS.map(o => o[0]));
const DC_MIN = Math.min(...OFFSETS.map(o => o[1]));

// --- Var encodings --------------------------------------------------------
// VA/VB hold the cell's offset from its pentomino's reference cell, shifted
// into 1..numValues. VT holds the piece's type digit. Every one of the 100
// cells belongs to a piece, so no "not tiled" spare code is needed.
const encA = (dRow) => dRow - DR_MIN + 1;
const encB = (dCol) => dCol - DC_MIN + 1;
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

// --- Offset domain ---------------------------------------------------------
// A cell's offset must be one a pentomino actually has, and must leave its
// reference cell on the grid. Whether that reference cell really anchors a
// pentomino containing this cell is settled by the shape machine below.
const offsetDomain = memo((allowed) => Pair.fnToKey(
  (a, b) => allowed.some(([dr, dc]) => encA(dr) === a && encB(dc) === b),
  numValues));

const offsetRules = gridCells.map(cell => new Pair(
  offsetDomain(OFFSETS.filter(([dr, dc]) => graph.step(cell, -dr, -dc))),
  'offset', va.at(cell), vb.at(cell)));

// --- Pentomino shape ---------------------------------------------------
// One machine per cell, over that cell and every cell that could point at it.
// If the cell is a pentomino's reference cell, the set of cells pointing at
// it must be exactly one placement of the type its VT names -- which fixes
// the piece's membership, size, connectedness and shape at once. If it is
// not a reference cell, nothing may point at it.
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

// --- Type spread and the no-touch rule --------------------------------
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

const pieceTypeRules = gridCells.flatMap(cell =>
  [RIGHT, DOWN].flatMap(([dr, dc]) => {
    const other = graph.step(cell, dr, dc);
    if (!other) return [];
    return [new NFA(sharedPieceNFA(dr, dc), 'piece-type',
      va.at(cell), va.at(other), vb.at(cell), vb.at(other),
      vt.at(cell), vt.at(other))];
  }));

// --- Border-count outside clues -----------------------------------------
// A border between two pentominoes is an orthogonally-adjacent cell pair in
// different pieces. Above, pieceTypeRules makes "different piece" and
// "different VT" the same thing (a touching pair of the same type is
// already forbidden), so counting borders along a line is exactly counting
// VT changes between consecutive cells of that line. A numeric clue wants
// that count exactly; "odd" wants only its parity.
// Read as the line's ten VT cells, in order.
const lineCountNFA = memo((target) => NFA.encodeSpec({
  startState: { count: 0, prev: null },
  transition: ({ count, prev }, value) => {
    if (prev === null) return { count: 0, prev: value };
    const hit = value === prev ? 0 : 1;
    if (target === 'odd') return { count: (count + hit) % 2, prev: value };
    return { count: Math.min(count + hit, target + 1), prev: value };
  },
  accept: ({ count }) => target === 'odd' ? count === 1 : count === target,
}, numValues));

// Transcribed from the ten outside-clue overlays: five row clues (left) and
// five column clues (top). Unlisted rows/columns carry no clue.
const ROW_CLUES = { 2: 2, 4: 4, 5: 7, 6: 7, 8: 'odd' };
const COL_CLUES = { 2: 3, 4: 3, 6: 3, 7: 5, 8: 5 };

const borderCountRules = [
  ...Object.entries(ROW_CLUES).map(([row, target]) =>
    new NFA(lineCountNFA(target), 'border-count', ...vt.row(Number(row)))),
  ...Object.entries(COL_CLUES).map(([col, target]) =>
    new NFA(lineCountNFA(target), 'border-count', ...vt.column(Number(col)))),
];

return [
  new Shape('10x10', NUM_VALUES, 'Raw'),
  // The grid carries no digits; pin every cell so its free domain cannot
  // multiply solutions. One template Given, replicated over the whole grid.
  graph.makeReplicate(new Given(gridCells[0], 1)),
  va.toVar('offsetRow'),
  vb.toVar('offsetCol'),
  vt.toVar('pieceType'),
  ...offsetRules,
  ...shapeRules,
  ...pieceTypeRules,
  ...borderCountRules,
];
