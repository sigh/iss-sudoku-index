// Title: Pentominous
// Author: Stef
// Video: https://www.youtube.com/watch?v=MTG0DuQQyzw
// Source: https://app.crackingthecryptic.com/sudoku/jR4nn3qH92

// Rules encoded here, in full:
//  * Every cell of the 15x15 grid is part of exactly one pentomino (a
//    five-cell orthogonally-connected region).
//  * No two orthogonally adjacent pentominoes have the same shape, where
//    "shape" means free pentomino (up to rotation and reflection).
//  * A cell with a letter (F I L N P T U V W X Y Z) must lie in a pentomino
//    of that letter's shape. A pentomino may hold 0, 1 or more letters.
// Nothing is omitted.
//
// The puzzle has no digits. The board is a Raw 15x15 grid whose cells carry
// the type of the pentomino covering them (1..12 in the order F I L N P T U
// V W X Y Z, the standard Golomb naming the drawn letters use). A pentomino is
// small enough to be named by the offset from its first cell in reading order
// (the leftmost cell of its top row) to each of its cells, so VA/VB hold that
// offset's row and column parts. This is the bounded-region-size offset
// construction of mY9YBDLOoGI (Pento-doku V), extended to all twelve free
// pentominoes as in emH5qSvPTes (Pentomino-Rundreise), with that puzzle's loop
// layer dropped -- this puzzle has no loop, so only the tiling itself and the
// letter clues remain.

const NV = 12; // board values (pentomino types) 1..12; also covers VA (1..5) and VB (1..8)
const RIGHT = [0, 1], DOWN = [1, 0];

const shape = new Shape('15x15', NV, 'Raw');
const graph = cellGraph(shape);
const gridCells = graph.cells();
const cellAt = (row, col) => makeCellId(row, col);

// --- The twelve free pentominoes ----------------------------------------
// One drawing per type; the board value of a cell is TYPE_ART index + 1.
const TYPE_ART = [
  '.XX\nXX.\n.X.',         // 1 = F
  'XXXXX',                 // 2 = I
  'X.\nX.\nX.\nXX',        // 3 = L
  '.X\n.X\nXX\nX.',        // 4 = N
  'XX\nXX\nX.',            // 5 = P
  'XXX\n.X.\n.X.',         // 6 = T
  'X.X\nXXX',              // 7 = U
  'X..\nX..\nXXX',         // 8 = V
  'X..\nXX.\n.XX',         // 9 = W
  '.X.\nXXX\n.X.',         // 10 = X
  '.X\nXX\n.X\n.X',        // 11 = Y
  'XX.\n.X.\n.XX',         // 12 = Z
];
const NUM_TYPES = TYPE_ART.length;
const LETTER_ORDER = ['F', 'I', 'L', 'N', 'P', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const TYPE_OF_LETTER = new Map(LETTER_ORDER.map((letter, i) => [letter, i + 1]));

const key = (cells) => JSON.stringify(cells);
const sortCells = (cells) =>
  cells.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
// Translate a shape so its first cell in reading order sits at [0, 0].
const normalise = (cells) => {
  const [r0, c0] = sortCells(cells)[0];
  return sortCells(cells.map(([r, c]) => [r - r0, c - c0]));
};
const parseArt = (art) => normalise(art.split('\n').flatMap(
  (line, r) => [...line].flatMap((ch, c) => ch === 'X' ? [[r, c]] : [])));

// The rotations and reflections of a shape: all images of one free pentomino
// are the same type, which is what "same shape" means in the no-touch rule.
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

// SHAPES[i] = { offsets, type }: every placement a pentomino may take, as the
// offsets from its first cell, tagged with its type. 63 entries.
const SHAPES = TYPE_ART.flatMap((art, i) =>
  orientations(parseArt(art)).map(offsets => ({ offsets, type: i + 1 })));

// The 21 distinct offsets in reading order; OFFSETS[0] is [0, 0], the first
// cell itself. Rows run 0..4 and columns -3..4.
const OFFSETS = sortCells([...new Map(
  SHAPES.flatMap(s => s.offsets).map(o => [key(o), o])).values()]);
const OFFSET_POS = new Map(OFFSETS.map((o, i) => [key(o), i]));
const DR_MIN = Math.min(...OFFSETS.map(o => o[0]));
const DC_MIN = Math.min(...OFFSETS.map(o => o[1]));

// VA/VB hold the offset's row and column parts shifted into 1..5 and 1..8.
const encA = (dRow) => dRow - DR_MIN + 1;
const encB = (dCol) => dCol - DC_MIN + 1;
const FIRST_A = encA(0), FIRST_B = encB(0);

const va = graph.makeOverlay('VA');
const vb = graph.makeOverlay('VB');

// Compiling an NFA spec is expensive and many cells share one: memoise by the
// spec's parameters so each distinct machine is built once.
const memo = (fn) => {
  const cache = new Map();
  return (...args) => {
    const k = key(args);
    if (!cache.has(k)) cache.set(k, fn(...args));
    return cache.get(k);
  };
};

// The cells that could point at `cell` as their first cell, as offset indices.
// Slots are read nearest-first: the order is free (each rule checks a
// conjunction over the window and passes cells in this same order), but a scan
// that discriminates early keeps the machine's pre-minimisation state count
// down, since minimisation compares every pair of states.
const windowOf = (cell) => OFFSETS.map((o, i) => i)
  .filter(i => i > 0 && graph.step(cell, ...OFFSETS[i]))
  .sort((i, j) => {
    const [ar, ac] = OFFSETS[i], [br, bc] = OFFSETS[j];
    return (Math.abs(ar) + Math.abs(ac)) - (Math.abs(br) + Math.abs(bc))
      || ar - br || ac - bc;
  });
const memberAt = (cell, i) => graph.step(cell, ...OFFSETS[i]);

// --- Offset domain ------------------------------------------------------
// A cell's offset must be one a pentomino actually has, and must leave its
// first cell on the grid. Whether that first cell really anchors a pentomino
// containing this cell is settled by the shape machine below.
const offsetDomain = memo((allowed) => Pair.fnToKey(
  (a, b) => allowed.some(([dr, dc]) => encA(dr) === a && encB(dc) === b), NV));

const offsetRules = gridCells.map(cell => new Pair(
  offsetDomain(OFFSETS.filter(([dr, dc]) => graph.step(cell, -dr, -dc))),
  'offset', va.at(cell), vb.at(cell)));

// --- Pentomino shape ----------------------------------------------------
// One machine per cell, over that cell and every cell that could point at it.
// If the cell is a pentomino's first cell, the set of cells pointing at it
// must be exactly one placement of the type its board value names, which
// fixes the piece's membership, size, connectedness and shape at once; if it
// is not a first cell, nothing may point at it. Together over all cells this
// makes the pieces a partition of the grid.
// Read as [type, VA, VB of the cell, then VA, VB of each candidate member].
// A member's row code is reduced to "matches this slot" before its column code
// is read, which keeps the state count inside the compile cap.
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
  }, NV);
});

const shapeRules = gridCells.map(cell => {
  const window = windowOf(cell);
  const members = window.flatMap(i => [va.at(memberAt(cell, i)), vb.at(memberAt(cell, i))]);
  return new NFA(shapeNFA(window), 'piece-shape',
    cell, va.at(cell), vb.at(cell), ...members);
});

// --- Type spread and the no-touch rule -----------------------------------
// Two orthogonal neighbours share a pentomino exactly when their offsets
// differ by the step between them. Same piece means the same type; different
// pieces that touch must be of different types, which is the no-touch rule.
// So neighbours carry equal types if and only if they share a piece.
// Read as [VA cell, VA neighbour, VB cell, VB neighbour, type cell, type nb].
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
}, NV));

const pieceTypeRules = gridCells.flatMap(cell =>
  [RIGHT, DOWN].flatMap(([dr, dc]) => {
    const other = graph.step(cell, dr, dc);
    if (!other) return [];
    return [new NFA(sharedPieceNFA(dr, dc), 'piece-type',
      va.at(cell), va.at(other), vb.at(cell), vb.at(other), cell, other)];
  }));

// --- Letter clues ---------------------------------------------------------
// A cell with a letter must lie in a pentomino of that letter's shape; the
// board value already carries the piece's shared type, so this is one Given
// per lettered cell naming that type directly (the type-spread rule above
// then carries it to the rest of the piece).
const LETTERS = [
  [1, 6, 'I'], [1, 10, 'I'],
  [2, 5, 'L'], [2, 11, 'P'],
  [3, 3, 'Z'], [3, 7, 'W'], [3, 9, 'F'], [3, 13, 'L'],
  [4, 5, 'Z'], [4, 11, 'Z'],
  [5, 2, 'P'], [5, 4, 'Y'], [5, 7, 'U'], [5, 9, 'P'], [5, 12, 'V'], [5, 14, 'L'],
  [6, 1, 'L'], [6, 15, 'I'],
  [7, 3, 'T'], [7, 5, 'X'], [7, 11, 'F'], [7, 13, 'Y'],
  [9, 3, 'F'], [9, 5, 'P'], [9, 11, 'P'], [9, 13, 'N'],
  [10, 1, 'I'], [10, 15, 'Y'],
  [11, 2, 'L'], [11, 4, 'N'], [11, 7, 'Z'], [11, 9, 'W'], [11, 12, 'L'], [11, 14, 'W'],
  [12, 5, 'P'], [12, 11, 'P'],
  [13, 3, 'P'], [13, 7, 'L'], [13, 9, 'F'], [13, 13, 'T'],
  [14, 5, 'N'], [14, 11, 'N'],
  [15, 6, 'Y'], [15, 10, 'I'],
];

const letterRules = LETTERS.map(([r, c, letter]) =>
  new Given(cellAt(r, c), TYPE_OF_LETTER.get(letter)));

// --- Domains ------------------------------------------------------------
const range = (n, from) => Array.from({ length: n }, (_, k) => k + from);
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...range(NUM_TYPES, 1))),
];

return [
  shape,
  va.toVar('offsetRow'),
  vb.toVar('offsetCol'),
  ...domains,
  ...offsetRules,
  ...shapeRules,
  ...pieceTypeRules,
  ...letterRules,
];
