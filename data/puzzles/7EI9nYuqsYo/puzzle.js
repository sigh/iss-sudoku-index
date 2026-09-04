// Title: Pentominous Star Battle
// Author: Jesper
// Video: https://www.youtube.com/watch?v=7EI9nYuqsYo
// Source: https://app.crackingthecryptic.com/sudoku/2f4fTR6t6B

// Rules encoded here, in full:
//  * No digits anywhere. R6C6, R6C7, R7C6, R7C7 are shaded and belong to no
//    pentomino; the other 140 cells are exactly covered by 28 pentominoes,
//    each one of the 12 standard free pentomino types (a rotation or
//    reflection does not change type).
//  * Two pentominoes of the same type are never orthogonally adjacent.
//  * Some borders between pentominoes are already drawn and must be
//    respected (49 unit wall segments; the 8 further segments on the
//    shaded hole's own boundary are implied by the coverage rule and add
//    nothing, so they are not separately encoded).
//  * Some cells of the tiling carry a star. Exactly 2 stars appear in each
//    row, each column, and among all cells belonging to pentominoes of each
//    of the 12 types (summed over every piece of that type, wherever it
//    sits) -- not 2 per individual piece.
//  * Stars may not be orthogonally or diagonally adjacent.
//
// A pentomino is small enough to be named by the offset from its top-left
// cell (the first cell in reading order) to each of its cells, so two Var
// overlays carry the tiling -- VA and VB hold that offset's row and column
// parts. A third overlay VT holds the piece's type, and a fourth VU masks
// VT by whether the cell is starred, which is what lets a single
// ContainExact state the per-type star count without knowing the partition
// in advance.

const RIGHT = [0, 1], DOWN = [1, 0];
const STAR = 1, NO_STAR = 2;
const SENTINEL = 13; // VU's "this cell has no star" marker

// A Raw grid: no digits, so no rows/columns/boxes all-different. Every real
// rule below is stated explicitly. The value range is widened to 13 to
// carry VU's 12 types plus its sentinel; the board's own cells are
// restricted back down to the two star markers below.
const shape = new Shape('12x12', 13, 'Raw');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const numValues = geometry.numValues;
const gridCells = graph.cells();

// The shaded 2x2 hole at the centre, drawn as underlays in the source.
const HOLE = new Set(['R6C6', 'R6C7', 'R7C6', 'R7C7']);
const tiledCells = gridCells.filter(cell => !HOLE.has(cell));

// --- Drawn interior walls -------------------------------------------------
// Transcribed from the drawn wall segments between pentomino pieces. The
// further segments on the shaded hole's own boundary are omitted: they carry
// no information beyond "this cell has no pentomino", which the hole
// exclusion already states.
// Row/col pairs, not hand-written ids: row/col 10, 11, 12 are not "10",
// "11", "12" in a cell id (the id packs each coordinate into one base-16
// digit), so these go through makeCellId.
const GIVEN_WALL_COORDS = [
  [[1, 5], [1, 6]], [[1, 6], [1, 7]], [[2, 6], [2, 7]], [[2, 7], [2, 8]],
  [[2, 9], [2, 10]], [[2, 10], [3, 10]], [[2, 10], [2, 11]], [[3, 9], [3, 10]],
  [[3, 12], [4, 12]], [[4, 12], [5, 12]], [[3, 8], [4, 8]], [[2, 2], [3, 2]],
  [[2, 3], [3, 3]], [[3, 1], [4, 1]], [[4, 4], [4, 5]], [[4, 3], [5, 3]],
  [[4, 6], [5, 6]], [[5, 7], [5, 8]], [[6, 8], [7, 8]], [[6, 8], [6, 9]],
  [[5, 9], [6, 9]], [[5, 10], [6, 10]], [[7, 11], [7, 12]], [[5, 4], [6, 4]],
  [[6, 2], [7, 2]], [[11, 1], [12, 1]], [[11, 3], [12, 3]], [[11, 4], [12, 4]],
  [[11, 3], [11, 4]], [[9, 3], [10, 3]], [[9, 5], [10, 5]], [[10, 4], [10, 5]],
  [[10, 5], [11, 5]], [[10, 6], [10, 7]], [[11, 6], [11, 7]], [[11, 7], [12, 7]],
  [[11, 8], [12, 8]], [[11, 9], [12, 9]], [[12, 8], [12, 9]], [[11, 12], [12, 12]],
  [[9, 11], [10, 11]], [[10, 10], [10, 11]], [[10, 9], [10, 10]], [[9, 8], [10, 8]],
  [[8, 5], [8, 6]], [[8, 6], [9, 6]], [[8, 7], [9, 7]], [[8, 8], [8, 9]],
  [[7, 10], [8, 10]],
];
const GIVEN_WALLS = GIVEN_WALL_COORDS.map(
  ([a, b]) => [makeCellId(...a), makeCellId(...b)]);

// --- The twelve free pentomino types --------------------------------------
// One drawing per type. TYPE_NAMES[t - 1] names the type VT === t stands for.
const TYPE_NAMES = ['F', 'I', 'L', 'N', 'P', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const TYPE_ART = [
  'XX.\n.XX\n.X.',   // F
  'XXXXX',           // I
  'X.\nX.\nX.\nXX',  // L
  '.X\n.X\nXX\nX.',  // N
  'XX\nXX\nX.',      // P
  'XXX\n.X.\n.X.',   // T
  'X.X\nXXX',        // U
  'X..\nX..\nXXX',   // V
  'X..\nXX.\n.XX',   // W
  '.X.\nXXX\n.X.',   // X
  '.X\nXX\n.X\n.X',  // Y
  'XX.\n.X.\n.XX',   // Z
];

const key = (cells) => JSON.stringify(cells);
const sortCells = (cells) =>
  cells.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
// Translate a shape so its first cell in reading order sits at [0, 0]; that
// cell is this encoding's "top-left cell" anchor.
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
// the offsets from its top-left cell, tagged with its type digit.
// 63 entries total (I 2, X 1, T/V/W/U/Z 4 each, L/N/P/Y/F 8 each).
const SHAPES = TYPE_ART.flatMap((art, i) =>
  orientations(parseArt(art)).map(offsets => ({ offsets, type: i + 1 })));

// The 21 distinct offsets, in reading order; OFFSETS[0] is [0, 0], the
// top-left cell itself.
const OFFSETS = sortCells([...new Map(
  SHAPES.flatMap(s => s.offsets).map(o => [key(o), o])).values()]);
const OFFSET_POS = new Map(OFFSETS.map((o, i) => [key(o), i]));
const DR_MIN = Math.min(...OFFSETS.map(o => o[0]));
const DC_MIN = Math.min(...OFFSETS.map(o => o[1]));

// --- Var encodings ---------------------------------------------------------
// VA/VB hold the cell's offset from its pentomino's top-left cell, shifted
// into 1..; NONE_A/NONE_B mark a hole cell, which is in no pentomino.
// VT holds the type digit of the cell's pentomino, so equal VT on two
// orthogonal neighbours means exactly "same pentomino" once the no-touch
// rule is in force. VU masks VT by whether the cell holds a star.
const encA = (dRow) => dRow - DR_MIN + 1;
const encB = (dCol) => dCol - DC_MIN + 1;
const NONE_A = encA(Math.max(...OFFSETS.map(o => o[0]))) + 1;
const NONE_B = encB(Math.max(...OFFSETS.map(o => o[1]))) + 1;
const FIRST_A = encA(0), FIRST_B = encB(0);

const va = graph.makeOverlay('VA');
const vb = graph.makeOverlay('VB');
const vt = graph.makeOverlay('VT');
const vu = graph.makeOverlay('VU');

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
// top-left cell on the grid. Whether that top-left cell really anchors a
// pentomino containing this cell is settled by the shape machine below.
const offsetDomain = memo((allowed) => Pair.fnToKey(
  (a, b) => allowed.some(([dr, dc]) => encA(dr) === a && encB(dc) === b),
  numValues));

const offsetRules = tiledCells.map(cell => new Pair(
  offsetDomain(OFFSETS.filter(([dr, dc]) => graph.step(cell, -dr, -dc))),
  'offset', va.at(cell), vb.at(cell)));

// --- Pentomino shape ---------------------------------------------------
// One machine per cell, over that cell and every cell that could point at it.
// If the cell is a pentomino's top-left cell, the set of cells pointing at it
// must be exactly one placement of the type its VT names -- which fixes the
// piece's membership, size, connectedness and shape at once. If it is not a
// top-left cell (including every hole cell), nothing may point at it.
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

const pieceTypeRules = tiledCells.flatMap(cell =>
  [RIGHT, DOWN].flatMap(([dr, dc]) => {
    const other = graph.step(cell, dr, dc);
    if (!other || HOLE.has(other)) return [];
    return [new NFA(sharedPieceNFA(dr, dc), 'piece-type',
      va.at(cell), va.at(other), vb.at(cell), vb.at(other),
      vt.at(cell), vt.at(other))];
  }));

// --- Given walls force different pieces ------------------------------
// A drawn wall between two orthogonally adjacent cells means they are in
// different pentominoes -- the offset-derived "same piece" test above must
// come out false for that pair, independent of type. Read in the same
// grouped-by-axis order as sharedPieceNFA: [VA first, VA second, VB first,
// VB second].
const notSamePieceNFA = memo((dRow, dCol) => NFA.encodeSpec({
  startState: { phase: 'a1' },
  transition: (state, value) => {
    if (state.phase === 'a1') return { phase: 'a2', a: value };
    if (state.phase === 'a2') {
      return { phase: 'b1', same: value - state.a === dRow };
    }
    if (state.phase === 'b1') return { phase: 'b2', same: state.same, b: value };
    // phase 'b2'
    const same = state.same && value - state.b === dCol;
    return same ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, numValues));

const wallRules = GIVEN_WALLS.map(([a, b]) => {
  const pa = parseCellId(a), pb = parseCellId(b);
  const dRow = pb.row - pa.row, dCol = pb.col - pa.col;
  return new NFA(notSamePieceNFA(dRow, dCol), 'given-wall',
    va.at(a), va.at(b), vb.at(a), vb.at(b));
});

// --- Star / type link -------------------------------------------------
// VU is VT when the cell is starred, and the sentinel otherwise -- masking
// each starred cell's own pentomino type onto one layer, and every unstarred
// cell (including every hole cell) onto a value no per-type rule reads.
// Read as [cell (star marker), VT, VU].
const starTypeNFA = NFA.encodeSpec({
  startState: { phase: 's' },
  transition: (state, value) => {
    if (state.phase === 's') return { phase: 't', starred: value === STAR };
    if (state.phase === 't') return { phase: 'u', starred: state.starred, type: value };
    // phase 'u'
    const expected = state.starred ? state.type : SENTINEL;
    return value === expected ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues);

const starTypeRules = gridCells.map(cell =>
  new NFA(starTypeNFA, 'star-type', cell, vt.at(cell), vu.at(cell)));

// --- Exactly two stars per pentomino type -----------------------------
// One ContainExact over the whole VU layer names every type's count at once;
// SENTINEL is left unnamed, so it (every unstarred cell) is unrestricted.
const perTypeCounts = TYPE_NAMES.map((_, i) => i + 1)
  .flatMap(t => [t, t]).join('_');
const starsPerType = new ContainExact(perTypeCounts, ...vu.at(gridCells));

// --- Exactly two stars per row and column ------------------------------
// The board itself carries the star marker (Raw grid, no digits), so a
// house's own cells are read directly; a hole cell always reads NO_STAR.
// One Replicate stamps the same two-value restriction over every grid cell
// instead of 144 identical Given copies.
const starRestrict = [graph.makeReplicate(
  new Given(gridCells[0], STAR, NO_STAR), gridCells)];
const starsPerHouse = [...graph.rows(), ...graph.columns()]
  .map(house => new ContainExact(`${STAR}_${STAR}`, ...house));

// --- Stars do not touch, including diagonally --------------------------
// One Replicate per king-move offset stamps the relation over every edge at
// that offset (same construction as the validated XObunchQvR4.1 /
// aceUogoL-QM.4 / A7CPYMUnafw star-battle no-touch pattern).
const notBothStars = Pair.fnToKey((a, b) => !(a === STAR && b === STAR), numValues);
const KING_OFFSETS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const starNoTouch = KING_OFFSETS.map(([dRow, dCol]) => {
  const targets = graph.cells().filter(cell => graph.step(cell, dRow, dCol) !== null);
  const origin = targets[0];
  const neighbour = graph.step(origin, dRow, dCol);
  return new Replicate(
    [new Pair(notBothStars, 'stars do not touch', origin, neighbour)],
    Replicate.encodeTargetCells(targets, origin, graph),
    origin,
  );
});

// --- Hole cells are pinned, not solved ----------------------------------
// A hole cell holds no star, no offset (NONE_A/NONE_B) and an arbitrary real
// type (never read: excluded from pieceTypeRules, and VU always reads
// SENTINEL for it since it is never starred).
const holePins = [...HOLE].flatMap(cell => [
  new Given(cell, NO_STAR),
  new Given(va.at(cell), NONE_A),
  new Given(vb.at(cell), NONE_B),
  new Given(vt.at(cell), 1),
]);

return [
  shape,
  va.toVar('offsetRow'),
  vb.toVar('offsetCol'),
  vt.toVar('pieceType'),
  vu.toVar('starType'),
  ...starRestrict,
  ...holePins,
  ...offsetRules,
  ...shapeRules,
  ...pieceTypeRules,
  ...wallRules,
  ...starTypeRules,
  starsPerType,
  ...starsPerHouse,
  ...starNoTouch,
];
