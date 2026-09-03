// Title: Pentominoku for Layla
// Author: ibn Muhyiddin
// Video: https://www.youtube.com/watch?v=xcq7-hwNfEw
// Source: https://app.crackingthecryptic.com/5nyl31krz4

// Rules encoded here, in full:
//  * Normal sudoku: 1-9 once per row, column and box.
//  * R5C5 (the shaded central cell) belongs to no pentomino; the other 80
//    cells are covered by 16 pentominoes.
//  * Each pentomino is one of the eleven listed shapes, taken as free
//    pentominoes (rotations and reflections allowed), reusable without limit.
//    Its "pentominoku number" is F 6, L 2, N 3, P 4, T 5, U 8, V 7, W 8,
//    X 9, Y 1, Z 9.
//  * That number occurs exactly twice among the pentomino's five digits.
//    Other digits may repeat inside a pentomino, so no in-piece
//    all-different rule applies.
//  * Each starred cell holds its own pentomino's number. The rules say the
//    stars show only "some of" the occurrences, so an unstarred cell is not
//    forbidden from being one.
//  * Not every shape need be used, and equal shapes may touch, so neither an
//    every-shape-used constraint nor a no-touch constraint appears below.
//
// The rules list eleven of the twelve pentominoes; I is absent, so it is not
// in the catalogue. The list is introduced as "Each pentomino shape is
// associated with a number", which makes it the set of shapes in play, and
// the arithmetic agrees: an I pentomino is five cells of one row or one
// column, so normal sudoku makes its five digits distinct and no number
// could occur twice in it.
//
// A pentomino is small enough to be named by the offset from its first cell
// in reading order to each of its cells, so the tiling is carried by Var
// overlays: VA and VB hold that offset's row and column parts, VT holds the
// piece's pentominoku number, and VM flags a cell whose digit equals VT.

const RIGHT = [0, 1], DOWN = [1, 0];

const graph = cellGraph('9x9');
const numValues = graph.gridGeometry().numValues;
const gridCells = graph.cells();

// The grey 1x1 underlay sits on R5C5; the rules exempt that cell from the
// tiling. It still takes a digit under normal sudoku.
const CENTRE = 'R5C5';
const tiledCells = gridCells.filter(cell => cell !== CENTRE);

// The thirteen drawn stars, transcribed from the star glyphs.
const STARS = [
  'R1C1', 'R1C8', 'R1C9', 'R2C5', 'R2C7', 'R3C1', 'R3C2',
  'R3C9', 'R4C5', 'R4C6', 'R5C7', 'R6C9', 'R9C1',
];

// --- The eleven listed pentomino shapes ---------------------------------
// One drawing per shape, in the standard pentomino naming the rules link to,
// paired with the pentominoku number the rules give it.
const TYPE_ART = [
  { art: ['.XX', 'XX.', '.X.'], num: 6 },   // F
  { art: ['X.', 'X.', 'X.', 'XX'], num: 2 },   // L
  { art: ['.X', '.X', 'XX', 'X.'], num: 3 },   // N
  { art: ['XX', 'XX', 'X.'], num: 4 },   // P
  { art: ['XXX', '.X.', '.X.'], num: 5 },   // T
  { art: ['X.X', 'XXX'], num: 8 },   // U
  { art: ['X..', 'X..', 'XXX'], num: 7 },   // V
  { art: ['X..', 'XX.', '.XX'], num: 8 },   // W
  { art: ['.X.', 'XXX', '.X.'], num: 9 },   // X
  { art: ['.X', 'XX', '.X', '.X'], num: 1 },   // Y
  { art: ['XX.', '.X.', '.XX'], num: 9 },   // Z
];

const key = (cells) => JSON.stringify(cells);
const sortCells = (cells) =>
  cells.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
// Translate a shape so its first cell in reading order sits at [0, 0]. That
// cell is the piece's anchor throughout: every other cell of the piece stores
// its offset back to it.
const normalise = (cells) => {
  const [r0, c0] = sortCells(cells)[0];
  return sortCells(cells.map(([r, c]) => [r - r0, c - c0]));
};
const parseArt = (art) => normalise(art.flatMap(
  (line, r) => [...line].flatMap((ch, c) => ch === 'X' ? [[r, c]] : [])));

// The eight rotations and reflections of a shape. The rules use free
// pentominoes, so all eight images are the same shape.
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

// SHAPES[i] = { offsets, num } -- every orientation a pentomino may take, as
// the offsets from its anchor, tagged with its pentominoku number.
// 61 entries: X 1, T/U/V/W/Z 4 each, F/L/N/P/Y 8 each.
const SHAPES = TYPE_ART.flatMap(({ art, num }) =>
  orientations(parseArt(art)).map(offsets => ({ offsets, num })));

// The 19 distinct offsets, in reading order; OFFSETS[0] is [0, 0], the anchor
// itself. Row parts run 0..3 and column parts -3..3.
const OFFSETS = sortCells([...new Map(
  SHAPES.flatMap(s => s.offsets).map(o => [key(o), o])).values()]);
const OFFSET_POS = new Map(OFFSETS.map((o, i) => [key(o), i]));
const DR_MIN = Math.min(...OFFSETS.map(o => o[0]));
const DC_MIN = Math.min(...OFFSETS.map(o => o[1]));

// --- Var encodings ------------------------------------------------------
// VA/VB hold the cell's offset back to its pentomino's anchor, shifted into
// 1..9; NONE_A/NONE_B mark R5C5, which is in no pentomino.
// VT holds the pentominoku number of the cell's pentomino.
// VM is 2 when the cell's digit equals VT, and 1 otherwise.
const encA = (dRow) => dRow - DR_MIN + 1;
const encB = (dCol) => dCol - DC_MIN + 1;
const NONE_A = encA(Math.max(...OFFSETS.map(o => o[0]))) + 1;
const NONE_B = encB(Math.max(...OFFSETS.map(o => o[1]))) + 1;
const FIRST_A = encA(0), FIRST_B = encB(0);
const MARKED = 2, UNMARKED = 1;

const va = graph.makeOverlay('VA');
const vb = graph.makeOverlay('VB');
const vt = graph.makeOverlay('VT');
const vm = graph.makeOverlay('VM');

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
// A cell's offset must be one some pentomino actually has, and must leave its
// anchor on the grid. Whether that anchor really carries a pentomino
// containing this cell is settled by the shape machine below.
const offsetDomain = memo((allowed) => Pair.fnToKey(
  (a, b) => allowed.some(([dr, dc]) => encA(dr) === a && encB(dc) === b),
  numValues));

const offsetRules = tiledCells.map(cell => new Pair(
  offsetDomain(OFFSETS.filter(([dr, dc]) => graph.step(cell, -dr, -dc))),
  'offset', va.at(cell), vb.at(cell)));

// --- Pentomino shape ----------------------------------------------------
// One machine per cell, over that cell and every cell that could point at it.
// If the cell is an anchor, the set of cells pointing at it must be exactly
// one orientation of a shape whose pentominoku number is the cell's VT --
// which fixes that piece's membership, size, connectedness and shape at once.
// If the cell is not an anchor, nothing may point at it. Together over all 81
// cells this makes the pieces a partition of the 80 tiled cells: each tiled
// cell points at exactly one anchor, and each anchor's pointer set is exactly
// one pentomino.
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
          .filter(c => c.shape.num === state.type).map(c => c.index);
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

// The window of a cell: the slots of OFFSETS, other than the anchor slot,
// whose member cell exists on the grid.
const windowOf = (cell) => OFFSETS.map((o, i) => i)
  .filter(i => i > 0 && graph.step(cell, ...OFFSETS[i]));

const shapeRules = gridCells.map(cell => {
  const window = windowOf(cell);
  const members = window.flatMap(i => {
    const member = graph.step(cell, ...OFFSETS[i]);
    return [va.at(member), vb.at(member)];
  });
  return new NFA(shapeNFA(window), 'piece-shape',
    vt.at(cell), va.at(cell), vb.at(cell), ...members);
});

// --- The number label spreads over a piece ------------------------------
// Two orthogonal neighbours share a pentomino exactly when their offsets
// differ by the step between them; when they do, they carry the same VT. A
// pentomino is orthogonally connected, so this carries the anchor's VT to
// every cell of its piece. Neighbours in different pieces are left free to
// agree, which is what "pentominos of the same shape can be orthogonally
// adjacent" requires.
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
    return !state.same || value === state.t ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues));

const typeSpreadRules = tiledCells.flatMap(cell =>
  [RIGHT, DOWN].flatMap(([dr, dc]) => {
    const other = graph.step(cell, dr, dc);
    if (!other || other === CENTRE) return [];
    return [new NFA(sharedPieceNFA(dr, dc), 'piece-number',
      va.at(cell), va.at(other), vb.at(cell), vb.at(other),
      vt.at(cell), vt.at(other))];
  }));

// --- The marked cells ---------------------------------------------------
// VM records whether this cell is one of its pentomino's occurrences of the
// pentominoku number, so the counting machine below can add up flags instead
// of carrying the number itself through nineteen slots of state.
// Read as [digit, VT, VM] of one cell.
const markNFA = NFA.encodeSpec({
  startState: { phase: 'd' },
  transition: (state, value) => {
    if (state.phase === 'd') return { phase: 't', digit: value };
    if (state.phase === 't') return { phase: 'm', hit: value === state.digit };
    return value === (state.hit ? MARKED : UNMARKED) ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues);

const markRules = tiledCells.map(cell => new NFA(
  markNFA, 'number-match', cell, vt.at(cell), vm.at(cell)));

// --- The number occurs exactly twice in each pentomino ------------------
// One machine per cell, over the same window as the shape machine. If the
// cell is an anchor, exactly two of the five cells of its piece -- itself and
// the members pointing at it -- carry the VM flag. If it is not an anchor,
// the machine has nothing to say and accepts.
// Read as [VA, VB, VM of the cell, then VA, VB, VM of each candidate member].
const NEEDED = 2;
const countNFA = memo((window) => NFA.encodeSpec({
  startState: { phase: 'a' },
  transition: (state, value) => {
    if (state.phase === 'free') return state;
    if (state.phase === 'a') {
      return value === FIRST_A ? { phase: 'b' } : { phase: 'free' };
    }
    if (state.phase === 'b') {
      return value === FIRST_B ? { phase: 'm' } : { phase: 'free' };
    }
    if (state.phase === 'm') {
      return { phase: 'w', i: 0, n: value === MARKED ? 1 : 0 };
    }
    if (state.phase === 'w') {
      if (state.i >= window.length) return undefined;
      const [dr] = OFFSETS[window[state.i]];
      return { phase: 'wb', i: state.i, n: state.n, rowOk: value === encA(dr) };
    }
    if (state.phase === 'wb') {
      const [, dc] = OFFSETS[window[state.i]];
      return {
        phase: 'wm', i: state.i, n: state.n,
        points: state.rowOk && value === encB(dc),
      };
    }
    const n = state.n + (state.points && value === MARKED ? 1 : 0);
    if (n > NEEDED) return undefined;
    return { phase: 'w', i: state.i + 1, n };
  },
  accept: (state) => state.phase === 'free'
    || (state.phase === 'w' && state.i === window.length && state.n === NEEDED),
}, numValues));

const countRules = gridCells.map(cell => {
  const window = windowOf(cell);
  const members = window.flatMap(i => {
    const member = graph.step(cell, ...OFFSETS[i]);
    return [va.at(member), vb.at(member), vm.at(member)];
  });
  return new NFA(countNFA(window), 'number-twice',
    va.at(cell), vb.at(cell), vm.at(cell), ...members);
});

return [
  new Shape('9x9'),
  va.toVar('offsetRow'),
  vb.toVar('offsetCol'),
  vt.toVar('pentominokuNumber'),
  vm.toVar('numberOccurrence'),
  // R5C5 is in no pentomino. Its VT and VM take part in no rule above, so
  // they are pinned to keep two inert cells from multiplying solutions.
  new Given(va.at(CENTRE), NONE_A),
  new Given(vb.at(CENTRE), NONE_B),
  new Given(vt.at(CENTRE), 1),
  new Given(vm.at(CENTRE), UNMARKED),
  ...offsetRules,
  ...shapeRules,
  ...typeSpreadRules,
  ...markRules,
  ...countRules,
  // A star marks one of its pentomino's two occurrences of the number.
  ...STARS.map(cell => new Given(vm.at(cell), MARKED)),
];
