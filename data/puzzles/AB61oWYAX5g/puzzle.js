// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=AB61oWYAX5g
// Source: https://cracking-the-cryptic.web.app/sudoku/PbmLMptRLN

// Rules encoded here, in full:
//  * Normal sudoku: 1-9 once per row, column and box.
//  * R5C5 (the grey square) belongs to no pentomino. The other 80 cells are
//    fully tiled by 16 pentominoes, each of one of the nine listed types,
//    rotated or reflected as necessary and reusable without limit.
//  * All nine listed types are used.
//  * Two pentominoes of the same type never share an edge.
//  * Digit rule per type, read inside one pentomino:
//      L, U    unique digits;
//      N, T    orthogonally adjacent digits are non-consecutive;
//      P, V    orthogonally adjacent digits are consecutive;
//      W, Y    unique digits summing to a multiple of 3;
//      Z       orthogonally adjacent digits differ by more than 5.
//  * A letter drawn in a cell names the type of the pentomino covering it.
//
// "Adjacent digits" is read as two orthogonally neighbouring cells of the same
// pentomino: the rules introduce these conditions as holding for the numbers
// in the shapes, so the relation lives inside a shape.
//
// A pentomino is small enough to be named by the offset from its first cell in
// reading order to each of its cells, so three Var overlays carry the tiling:
// VA and VB hold that offset's row and column parts, and VT holds the piece's
// type.

const RIGHT = [0, 1], DOWN = [1, 0];

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const numValues = geometry.numValues;
const gridCells = graph.cells();

// The grey square is the "central cell" the rules exempt from the tiling.
const CENTRE = 'R5C5';
const tiledCells = gridCells.filter(cell => cell !== CENTRE);

// --- The nine listed pentomino types ------------------------------------
// One drawing per type, in the standard pentomino naming the rules use, keyed
// by letter. The order is the printed legend's, top to bottom, and fixes each
// type's Var value.
const TYPE_ART = {
  L: 'X.\nX.\nX.\nXX',
  U: 'X.X\nXXX',
  N: '.X\n.X\nXX\nX.',
  T: 'XXX\n.X.\n.X.',
  P: 'XX\nXX\nX.',
  V: 'X..\nX..\nXXX',
  W: 'X..\nXX.\n.XX',
  Y: '.X\nXX\n.X\n.X',
  Z: 'XX.\n.X.\n.XX',
};
const TYPE_NAMES = Object.keys(TYPE_ART);
// TYPE.L is the Var value standing for a pentomino of type L, and so on.
const TYPE = Object.fromEntries(TYPE_NAMES.map((name, i) => [name, i + 1]));

// Types whose rule is "unique digits" (L and U outright; W and Y as part of
// "unique digits that sum to a multiple of 3").
const UNIQUE_TYPES = ['L', 'U', 'W', 'Y'].map(name => TYPE[name]);
// Types whose rule is "unique digits ... sum to a multiple of 3".
const SUM3_TYPES = ['W', 'Y'].map(name => TYPE[name]);
// The relation each remaining type imposes on two orthogonally adjacent cells
// of one pentomino. Types absent from this map impose none.
const ADJACENT_RULE = new Map([
  [TYPE.N, (a, b) => Math.abs(a - b) !== 1],
  [TYPE.T, (a, b) => Math.abs(a - b) !== 1],
  [TYPE.P, (a, b) => Math.abs(a - b) === 1],
  [TYPE.V, (a, b) => Math.abs(a - b) === 1],
  [TYPE.Z, (a, b) => Math.abs(a - b) > 5],
]);

const key = (cells) => JSON.stringify(cells);
const sortCells = (cells) =>
  cells.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
// Translate a shape so its first cell in reading order sits at [0, 0]. That
// cell anchors the piece; the rules never single it out, so any consistent
// choice of anchor would do.
const normalise = (cells) => {
  const [r0, c0] = sortCells(cells)[0];
  return sortCells(cells.map(([r, c]) => [r - r0, c - c0]));
};
const parseArt = (art) => normalise(art.split('\n').flatMap(
  (line, r) => [...line].flatMap((ch, c) => ch === 'X' ? [[r, c]] : [])));

// The eight rotations and reflections of a shape. A pentomino "type" is the
// free pentomino -- "rotated or reflected as necessary" -- so all eight images
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
// the offsets from its anchor cell, tagged with its type digit. 52 entries:
// U/T/V/W/Z 4 each, L/N/P/Y 8 each.
const SHAPES = TYPE_NAMES.flatMap(name =>
  orientations(parseArt(TYPE_ART[name])).map(
    offsets => ({ offsets, type: TYPE[name] })));

// The 19 distinct offsets, in reading order; OFFSETS[0] is [0, 0], the anchor
// cell itself. dRow runs 0..3 and dCol runs -3..3.
const OFFSETS = sortCells([...new Map(
  SHAPES.flatMap(s => s.offsets).map(o => [key(o), o])).values()]);
const OFFSET_POS = new Map(OFFSETS.map((o, i) => [key(o), i]));
const DR_MIN = Math.min(...OFFSETS.map(o => o[0]));
const DC_MIN = Math.min(...OFFSETS.map(o => o[1]));

// --- Var encodings ------------------------------------------------------
// VA/VB hold the cell's offset from its pentomino's anchor cell, shifted into
// 1..9; NONE_A/NONE_B mark R5C5, which is in no pentomino.
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
// anchor cell on the grid. Whether that anchor really holds a pentomino
// containing this cell is settled by the shape machine below.
const offsetDomain = memo((allowed) => Pair.fnToKey(
  (a, b) => allowed.some(([dr, dc]) => encA(dr) === a && encB(dc) === b),
  numValues));

const offsetRules = tiledCells.map(cell => new Pair(
  offsetDomain(OFFSETS.filter(([dr, dc]) => graph.step(cell, -dr, -dc))),
  'offset', va.at(cell), vb.at(cell)));

// --- Pentomino shape ----------------------------------------------------
// One machine per cell, over that cell and every cell that could point at it.
// If the cell is a pentomino's anchor, the set of cells pointing at it must be
// exactly one placement of the type its VT names -- which fixes the piece's
// membership, size, connectedness and shape at once. If it is not an anchor,
// nothing may point at it. Together over all cells this makes the pieces a
// partition of the tiled cells: every tiled cell points at exactly one anchor,
// and every anchor's pointer set is exactly one pentomino of a listed type.
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

// The window slots a cell has on the grid, and the cells that fill them.
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

// --- Type spread, the no-touch rule, and the adjacent-digit rules -------
// Two cells one orthogonal step apart share a pentomino exactly when their
// offsets differ by that step. Same piece means the same type; different
// pieces that touch must be of different types, which is the no-touch rule.
// So the two carry equal VT if and only if they share a piece.
// When they do share a piece, its type's adjacent-digit relation applies.
// Read as [VA cell, VA other, VB cell, VB other, VT cell, VT other,
// digit cell, digit other].
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
    if (state.phase === 't2') {
      if ((state.t === value) !== state.same) return undefined;
      // Only a shared piece carries a digit rule, so the type is dropped
      // otherwise; that keeps the two branches from multiplying states.
      return { phase: 'd1', type: state.same ? state.t : 0 };
    }
    if (state.phase === 'd1') return { phase: 'd2', type: state.type, d: value };
    const rule = ADJACENT_RULE.get(state.type);
    return !rule || rule(state.d, value) ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues));

const pieceRules = tiledCells.flatMap(cell =>
  [RIGHT, DOWN].flatMap(([dr, dc]) => {
    const other = graph.step(cell, dr, dc);
    if (!other || other === CENTRE) return [];
    return [new NFA(sharedPieceNFA(dr, dc), 'piece-pair',
      va.at(cell), va.at(other), vb.at(cell), vb.at(other),
      vt.at(cell), vt.at(other), cell, other)];
  }));

// --- Unique digits in an L, U, W or Y pentomino -------------------------
// One machine per ordered pair of cells that could share a piece: if their
// offsets differ by the step between them they are in the same piece, and if
// that piece's type is one of the four with a unique-digits rule their digits
// must differ. Pairs sharing a row, a column or a box are omitted: the sudoku
// rules already make those distinct.
// Read as [VA cell, VA other, VB cell, VB other, VT cell, digit cell,
// digit other].
const distinctNFA = memo((dRow, dCol) => NFA.encodeSpec({
  startState: { phase: 'a1' },
  transition: (state, value) => {
    if (state.phase === 'a1') return { phase: 'a2', a: value };
    if (state.phase === 'a2') {
      return { phase: 'b1', same: value - state.a === dRow };
    }
    if (state.phase === 'b1') return { phase: 'b2', same: state.same, b: value };
    if (state.phase === 'b2') {
      return { phase: 't', same: state.same && value - state.b === dCol };
    }
    if (state.phase === 't') {
      return { phase: 'd1', check: state.same && UNIQUE_TYPES.includes(value) };
    }
    if (state.phase === 'd1') return { phase: 'd2', check: state.check, d: value };
    return !state.check || value !== state.d ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues));

// The displacements between two cells of one placement of a unique-digits
// type, one per unordered pair, dropping the same-row and same-column ones.
const spans = [...new Map(SHAPES
  .filter(({ type }) => UNIQUE_TYPES.includes(type))
  .flatMap(({ offsets }) =>
    offsets.flatMap(a => offsets.map(b => [b[0] - a[0], b[1] - a[1]])))
  .filter(([dr, dc]) => dr > 0 && dc !== 0)
  .map(d => [key(d), d])).values()];

const BOX_OF = new Map(graph.boxes().flatMap(
  (box, i) => box.map(cell => [cell, i])));
const sameBox = (a, b) => BOX_OF.get(a) === BOX_OF.get(b);

const distinctRules = spans.flatMap(([dr, dc]) => tiledCells.flatMap(cell => {
  const other = graph.step(cell, dr, dc);
  if (!other || other === CENTRE || sameBox(cell, other)) return [];
  return [new NFA(distinctNFA(dr, dc), 'piece-distinct',
    va.at(cell), va.at(other), vb.at(cell), vb.at(other), vt.at(cell),
    cell, other)];
}));

// --- A W or Y pentomino's digits sum to a multiple of 3 -----------------
// One machine per cell, over the same window as the shape machine but reading
// digits too. If the cell anchors a W or Y pentomino, the digits of the cells
// pointing at it, plus its own, must total 0 mod 3; every other cell is inert.
// Only the running total mod 3 is carried, never the running sum, so the state
// count stays bounded.
// Read as [VT, VA, VB, digit of the cell, then VA, VB, digit of each candidate
// member].
const sumNFA = memo((window) => NFA.encodeSpec({
  startState: { phase: 'type' },
  transition: (state, value) => {
    if (state.phase === 'inert') return { phase: 'inert' };
    if (state.phase === 'type') {
      return SUM3_TYPES.includes(value)
        ? { phase: 'a' } : { phase: 'inert' };
    }
    if (state.phase === 'a') {
      return value === FIRST_A ? { phase: 'b' } : { phase: 'inert' };
    }
    if (state.phase === 'b') {
      return value === FIRST_B ? { phase: 'd0' } : { phase: 'inert' };
    }
    if (state.phase === 'd0') return { phase: 'w', i: 0, sum: value % 3 };
    if (state.phase === 'w') {
      // The cell list ends here; any further symbol is not this piece's.
      if (state.i >= window.length) return undefined;
      const [dr] = OFFSETS[window[state.i]];
      return { phase: 'wb', i: state.i, sum: state.sum, rowOk: value === encA(dr) };
    }
    if (state.phase === 'wb') {
      const [, dc] = OFFSETS[window[state.i]];
      return {
        phase: 'wd', i: state.i, sum: state.sum,
        points: state.rowOk && value === encB(dc),
      };
    }
    const sum = state.points ? (state.sum + value) % 3 : state.sum;
    return { phase: 'w', i: state.i + 1, sum };
  },
  accept: (state) => state.phase === 'inert'
    || (state.phase === 'w' && state.i === window.length && state.sum === 0),
}, numValues));

const sumRules = tiledCells.map(cell => {
  const window = windowOf(cell);
  const members = window.flatMap(i => {
    const member = graph.step(cell, ...OFFSETS[i]);
    return [va.at(member), vb.at(member), member];
  });
  return new NFA(sumNFA(window), 'piece-sum',
    vt.at(cell), va.at(cell), vb.at(cell), cell, ...members);
});

// --- All nine listed types are used -------------------------------------
// A cell's VT is its piece's type, so a type is used exactly when some tiled
// cell carries it.
const typesUsed = new ContainAtLeast(
  TYPE_NAMES.map(name => TYPE[name]).join('_'), ...vt.at(tiledCells));

// --- Drawn clues --------------------------------------------------------
// The four printed digits.
const GIVENS = [['R3C4', 2], ['R4C7', 3], ['R6C6', 8], ['R7C6', 1]];
// The twelve printed letters, each naming the type of the pentomino covering
// that cell. R3C4's letter is drawn as a separate glyph in the cell corner
// because the cell also shows a digit.
const LETTERS = [
  ['R2C6', 'N'], ['R2C8', 'U'], ['R3C4', 'W'], ['R3C7', 'L'], ['R4C4', 'Z'],
  ['R5C1', 'Y'], ['R5C2', 'P'], ['R6C5', 'V'], ['R7C9', 'T'], ['R8C3', 'L'],
  ['R8C5', 'Z'], ['R9C8', 'P'],
];

return [
  new Shape('9x9'),
  ...GIVENS.map(([cell, digit]) => new Given(cell, digit)),
  va.toVar('offsetRow'),
  vb.toVar('offsetCol'),
  vt.toVar('pieceType'),
  // R5C5 is in no pentomino. Its type label takes no part in any rule above,
  // so it is pinned to keep an inert cell from multiplying solutions.
  new Given(va.at(CENTRE), NONE_A),
  new Given(vb.at(CENTRE), NONE_B),
  new Given(vt.at(CENTRE), TYPE.L),
  ...LETTERS.map(([cell, name]) => new Given(vt.at(cell), TYPE[name])),
  ...offsetRules,
  ...shapeRules,
  ...pieceRules,
  ...distinctRules,
  ...sumRules,
  typesUsed,
];
