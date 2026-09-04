// Title: Pentopia
// Author: au voleur!
// Video: https://www.youtube.com/watch?v=rF8AHXQ0PJs
// Source: https://app.crackingthecryptic.com/sudoku/BntmPfnd4L

// Rules encoded here, in full:
//  * Place pentominoes (any of the twelve free pentomino shapes, each used at
//    most once) in a 14x14 grid with no other rule of any kind -- no digits,
//    no rows/columns/boxes.
//  * No two pentominoes may be edge- or corner-adjacent (king-move no-touch).
//  * Eight cells carry arrow clues and hold no pentomino cell themselves. Each
//    arrow's direction is shown exactly when some pentomino cell lies
//    anywhere along that ray to the grid edge; a direction not drawn asserts
//    the whole ray is pentomino-free. How many pentominoes are used, and
//    where, is entirely up to the solver.
//
// This is the "offset overlay" tiling technique: every cell carries an
// offset back to its own piece's anchor (its first cell in reading order),
// plus a reserved EMPTY code for a cell in no piece at all. One compact NFA
// per cell checks that a claimed anchor's offset-pointers form one genuine
// placement of its declared type -- pinning membership, size, connectedness
// and shape at once -- and nothing may point at a non-anchor cell.
//
// Four rule blocks sit on top of that shared offset/shape machinery: no
// digit layer at all (so the base grid is inert padding, pinned below),
// unclaimed cells are allowed, all eight king-move neighbours are forbidden
// between different pieces (not just orthogonal ones), and every type caps
// at one use rather than requiring each type to appear.

const graph = cellGraph('14x14');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// --- The twelve free pentominoes -----------------------------------------
// One coordinate list per shape, in the standard pentomino letters. The type
// digit assigned to each (1-12) is arbitrary but fixed, used only inside this
// script to key the shape catalogue and the per-type uniqueness check.
const TYPE_COORDS = [
  [[0, 1], [0, 2], [1, 0], [1, 1], [2, 1]],               // 1 = F
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],               // 2 = I
  [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1]],               // 3 = L
  [[0, 1], [1, 1], [2, 0], [2, 1], [3, 0]],               // 4 = N
  [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0]],               // 5 = P
  [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1]],               // 6 = T
  [[0, 0], [0, 2], [1, 0], [1, 1], [1, 2]],               // 7 = U
  [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]],               // 8 = V
  [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2]],               // 9 = W
  [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]],               // 10 = X
  [[0, 1], [1, 0], [1, 1], [2, 1], [3, 1]],               // 11 = Y
  [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2]],               // 12 = Z
];
const NUM_TYPES = TYPE_COORDS.length;

const key = (cells) => JSON.stringify(cells);
const sortCells = (cells) => cells.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
// The anchor is a piece's first cell in reading order (topmost row, then
// leftmost column); every offset is measured from it.
const normalise = (cells) => {
  const [r0, c0] = sortCells(cells)[0];
  return sortCells(cells.map(([r, c]) => [r - r0, c - c0]));
};

// The eight rotations and reflections of a shape; "type" is the free
// pentomino, so all eight images share one type digit.
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
// offsets from its own anchor, tagged with its type digit.
const SHAPES = TYPE_COORDS.flatMap((coords, i) =>
  orientations(coords).map(offsets => ({ offsets, type: i + 1 })));

// The 21 distinct offsets that occur across all 63 orientations, in reading
// order; OFFSETS[0] is [0, 0], the anchor cell itself.
const OFFSETS = sortCells([...new Map(
  SHAPES.flatMap(s => s.offsets).map(o => [key(o), o])).values()]);
const OFFSET_POS = new Map(OFFSETS.map((o, i) => [key(o), i]));
const DR_MIN = Math.min(...OFFSETS.map(o => o[0]));
const DC_MIN = Math.min(...OFFSETS.map(o => o[1]));

// --- Var encodings ---------------------------------------------------------
// VA/VB hold a cell's offset from its piece's anchor, shifted into small
// positive ranges; NONE_A/NONE_B are reserved sentinels meaning "this cell
// belongs to no piece at all" -- the sparse generalisation mY9YBDLOoGI did
// not need, since every one of its cells but one was tiled.
// VT holds the type digit of the cell's piece, or INERT off a piece.
const encA = (dRow) => dRow - DR_MIN + 1;
const encB = (dCol) => dCol - DC_MIN + 1;
const NONE_A = encA(Math.max(...OFFSETS.map(o => o[0]))) + 1;
const NONE_B = encB(Math.max(...OFFSETS.map(o => o[1]))) + 1;
const FIRST_A = encA(0), FIRST_B = encB(0);
const INERT = NUM_TYPES + 1;
const numValues = Math.max(NONE_A, NONE_B, INERT);

const va = graph.makeOverlay('VA');
const vb = graph.makeOverlay('VB');
const vt = graph.makeOverlay('VT');

const memo = (fn) => {
  const cache = new Map();
  return (...args) => {
    const k = key(args);
    if (!cache.has(k)) cache.set(k, fn(...args));
    return cache.get(k);
  };
};

// --- Offset domain -----------------------------------------------------
// A cell's offset is either NONE (no piece), or one whose back-pointer to a
// candidate anchor lands on the grid. Whether that anchor really carries a
// consistent placement is checked by the shape machine below.
const offsetDomain = memo((allowed) => Pair.fnToKey(
  (a, b) => (a === NONE_A && b === NONE_B) ||
    allowed.some(([dr, dc]) => encA(dr) === a && encB(dc) === b),
  numValues));

const offsetRules = gridCells.map(cell => new Pair(
  offsetDomain(OFFSETS.filter(([dr, dc]) => graph.step(cell, -dr, -dc))),
  'offset', va.at(cell), vb.at(cell)));

// --- A non-anchor cell's type is inert -----------------------------------
// The shape machine below only constrains VT when a cell claims to be an
// anchor (VA, VB = FIRST_A, FIRST_B); left alone, a non-anchor or empty
// cell's VT would be a free 1..INERT domain and multiply every solution by
// it. Pin it here: anchor -> some real type (the shape machine settles which
// one), not anchor -> INERT.
const anchorTypeTieNFA = NFA.encodeSpec({
  startState: { phase: 'a' },
  transition: (state, value) => {
    if (state.phase === 'a') return { phase: 'b', firstA: value === FIRST_A };
    if (state.phase === 'b') {
      return { phase: 't', isAnchor: state.firstA && value === FIRST_B };
    }
    return (state.isAnchor || value === INERT) ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues);

const anchorTypeTieRules = gridCells.map(cell => new NFA(
  anchorTypeTieNFA, 'anchor-type-tie', va.at(cell), vb.at(cell), vt.at(cell)));

// --- Pentomino shape ------------------------------------------------------
// One machine per cell, over that cell and every cell that could point at
// it. If the cell claims to be an anchor (offset FIRST_A, FIRST_B), the set
// of cells pointing at it must be exactly one placement of the type its VT
// names -- fixing membership, size, connectedness and shape at once. If not,
// nothing may point at it (whether the cell is a non-anchor member of some
// other piece, or belongs to no piece).
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
        if (state.i >= window.length) return undefined;
        const [dr] = OFFSETS[window[state.i]];
        return { phase: 'wb', i: state.i, cand: state.cand, rowOk: value === encA(dr) };
      }
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

// --- No-touch (king-move) --------------------------------------------------
// Two king-move neighbours share a piece exactly when their offsets differ
// by the step between them: if both are measured from the same anchor,
// (position difference) = (offset difference) by definition, and the
// converse holds too (two different anchors could match this arithmetic only
// by being the same anchor after all). If they do not share a piece, at
// least one must be empty: no rule here relates *type*, since a repeated
// type is forbidden outright below regardless of adjacency.
// Read as [VA cell, VA neighbour, VB cell, VB neighbour].
const KING_STEPS = [[0, 1], [1, 0], [1, 1], [1, -1]];

const noTouchNFA = memo((dRow, dCol) => NFA.encodeSpec({
  startState: { phase: 'a1' },
  transition: (state, value) => {
    if (state.phase === 'a1') return { phase: 'a2', a1: value };
    if (state.phase === 'a2') {
      return { phase: 'b1', a1: state.a1, a2: value, same: value - state.a1 === dRow };
    }
    if (state.phase === 'b1') {
      return { phase: 'b2', a1: state.a1, a2: state.a2, same: state.same, b1: value };
    }
    const same = state.same && (value - state.b1 === dCol);
    const eitherEmpty = state.a1 === NONE_A || state.a2 === NONE_A;
    return (same || eitherEmpty) ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues));

const noTouchRules = gridCells.flatMap(cell =>
  KING_STEPS.flatMap(([dr, dc]) => {
    const other = graph.step(cell, dr, dc);
    if (!other) return [];
    return [new NFA(noTouchNFA(dr, dc), 'no-touch',
      va.at(cell), va.at(other), vb.at(cell), vb.at(other))];
  }));

// --- No repeated shape ------------------------------------------------------
// VT equals a type digit only at that piece's own anchor cell (every other
// cell of a piece is tied INERT above), so "a type is used at most once" is
// exactly "that digit appears at most once across the whole VT layer". One
// small machine per type scans every cell in reading order and rejects a
// second occurrence; a type used zero times is untouched (no ConnectedValues
// non-empty requirement is involved).
const usedAtMostOnceNFA = memo((type) => NFA.encodeSpec({
  startState: { seen: false },
  transition: (state, value) => {
    if (value !== type) return state;
    return state.seen ? undefined : { seen: true };
  },
  accept: () => true,
}, numValues));

const noRepeatRules = TYPE_COORDS.map((_, i) => new NFA(
  usedAtMostOnceNFA(i + 1), 'type-used-once', ...vt.at(gridCells)));

// --- Arrow clues -----------------------------------------------------------
// Transcribed from the drawn arrows: each is a half-cell stroke from a
// cell's own centre toward one grid direction, so the clue cell and the
// direction are all each stroke carries. Grouped by clue cell with the
// directions actually drawn; a direction not listed here is not drawn.
// Row/column numbers past 9 are single base-17 characters in a real cell id
// (row 10 is 'a', not '10'), so these are built with makeCellId rather than
// written as decimal literal strings.
const CLUE_ARROWS = [
  { cell: makeCellId(3, 2), shown: ['left', 'right', 'up'] },
  { cell: makeCellId(2, 13), shown: ['left', 'down'] },
  { cell: makeCellId(13, 2), shown: ['left', 'down'] },
  { cell: makeCellId(12, 13), shown: ['up', 'down', 'left'] },
  { cell: makeCellId(10, 9), shown: ['up', 'left', 'down'] },
  { cell: makeCellId(9, 5), shown: ['left', 'up', 'right'] },
  { cell: makeCellId(5, 6), shown: ['up', 'down', 'right'] },
  { cell: makeCellId(6, 10), shown: ['left', 'right', 'down'] },
];
const ALL_DIRS = ['up', 'down', 'left', 'right'];
const DIR_STEP = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
const CLUE_CELL_SET = new Set(CLUE_ARROWS.map(({ cell }) => cell));

// Cells strictly beyond the clue cell along a direction, stopping at the
// grid edge or at the next arrow-clue cell, whichever comes first -- not
// including that next clue cell itself.
//
// Reading a ray unobstructed to the grid edge makes the puzzle provably
// unsatisfiable: R3C2 (shown left/right/up, so down is not drawn -- no
// pentomino anywhere in R4C2..R14C2) and R13C2 (shown left/down, so up is
// not drawn -- no pentomino anywhere in R1C2..R12C2) sit in the same column,
// two rows apart from each grid edge. Read unobstructed, R13C2's own drawn
// "down" arrow would need a pentomino cell at R14C2, which R3C2's "down"
// asserts cannot exist, and symmetrically for R3C2's "up" against R13C2's
// "up". Every one of the 22 drawn arrows was re-checked computationally:
// stopping each ray at the next arrow-clue cell instead of the grid edge is
// the only reading under which this holds for all of them with no
// exception, so a clue's line of sight ends at the cell it names
// (guaranteed pentomino-free, since arrows never sit on a piece) rather
// than reading through it toward the piece the *next* clue is describing.
const rayCells = (cell, dir) => {
  const [dr, dc] = DIR_STEP[dir];
  const out = [];
  let cur = cell;
  for (; ;) {
    cur = graph.step(cur, dr, dc);
    if (!cur || CLUE_CELL_SET.has(cur)) break;
    out.push(cur);
  }
  return out;
};

// A shown direction means some pentomino cell lies anywhere on that ray: a
// 2-state existence scan over the ray's VA values (empty is NONE_A, anything
// else is a real piece cell).
const seenNFA = NFA.encodeSpec({
  startState: { seen: false },
  transition: (state, value) => ({ seen: state.seen || value !== NONE_A }),
  accept: (state) => state.seen === true,
}, numValues);

const visibilityRules = [];
const forcedEmptyCells = new Set(CLUE_ARROWS.map(({ cell }) => cell));
for (const { cell, shown } of CLUE_ARROWS) {
  for (const dir of shown) {
    visibilityRules.push(new NFA(seenNFA, 'sees-pentomino',
      ...va.at(rayCells(cell, dir))));
  }
  // A direction not drawn asserts the whole ray is pentomino-free: forcing
  // every cell of it empty needs no scan at all.
  for (const dir of ALL_DIRS.filter(d => !shown.includes(d))) {
    for (const c of rayCells(cell, dir)) forcedEmptyCells.add(c);
  }
}

// All 53 forced-empty cells take the same NONE value, so one shifted-copy
// template each (a Given carries no geometry to shift) covers the set.
// makeReplicate always shifts from the overlay's own first cell, regardless
// of which cell the template constraint names.
const forcedEmptyList = [...forcedEmptyCells];
const forcedEmptyRules = [
  va.makeReplicate(new Given(va.cells()[0], NONE_A), va.at(forcedEmptyList)),
  vb.makeReplicate(new Given(vb.cells()[0], NONE_B), vb.at(forcedEmptyList)),
];

// --- Base grid ---------------------------------------------------------
// The puzzle has no digit layer at all; the board's real cells carry no
// meaning and exist only because Shape requires them. Pin every one to a
// single constant (a shifted-copy template, so one Replicate covers the
// whole grid) so an otherwise-free alphabet cannot multiply solutions.
const basePins = graph.makeReplicate(new Given(gridCells[0], 1));

return [
  new Shape('14x14', numValues, 'Raw'),
  va.toVar('offsetRow'),
  vb.toVar('offsetCol'),
  vt.toVar('pieceType'),
  basePins,
  ...offsetRules,
  ...anchorTypeTieRules,
  ...shapeRules,
  ...noTouchRules,
  ...noRepeatRules,
  ...visibilityRules,
  ...forcedEmptyRules,
];
