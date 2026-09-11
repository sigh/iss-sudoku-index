// Title: Pentominous (Borders)
// Author: Grant Fikes
// Video: https://www.youtube.com/watch?v=24dUO8J7KpA
// Source: https://cracking-the-cryptic.web.app/sudoku/RpRNJ23dbL

// Pentominous (Borders). Rules encoded here, in full:
//  * Divide the 15x15 grid into pentominoes (five-cell regions) so that no two
//    pentominoes of the same shape -- rotations and reflections count as the
//    same shape -- share an edge.
//  * Some borders between pentominoes are already drawn: each of the 76 drawn
//    unit border segments separates two different pentominoes.
// There are no digits and no row/column/box rules, so the board is a `Raw`
// grid whose "value" is the answer letter: the name of the pentomino occupying
// the cell, one of F I L N P T U V W X Y Z as values 1-12 in that order.
//
// Because two pentominoes of the same shape never share an edge, two
// orthogonally adjacent cells carry the same letter exactly when they lie in
// the same pentomino. So the partition is recoverable from the letter grid
// alone, and a drawn border is exactly "these two letters differ".
//
// Two Var overlays per cell carry the offset from the cell back to the first
// cell of its pentomino in reading order (VA the row part, VB the column
// part). Each cell then names the pentomino it belongs to, and one machine per
// cell -- over that cell and every cell that could point at it -- pins that
// pentomino's membership, size, connectedness and exact shape together.

const RIGHT = [0, 1], DOWN = [1, 0];

// The twelve pentominoes, one orientation each, drawn as the letter they are
// named for; all rotations and reflections are generated from these below.
const PENTOMINO_ART = {
  F: ['.XX', 'XX.', '.X.'],
  I: ['X', 'X', 'X', 'X', 'X'],
  L: ['X.', 'X.', 'X.', 'XX'],
  N: ['.X', '.X', 'XX', 'X.'],
  P: ['XX', 'XX', 'X.'],
  T: ['XXX', '.X.', '.X.'],
  U: ['X.X', 'XXX'],
  V: ['X..', 'X..', 'XXX'],
  W: ['X..', 'XX.', '.XX'],
  X: ['.X.', 'XXX', '.X.'],
  Y: ['.X', 'XX', '.X', '.X'],
  Z: ['XX.', '.X.', '.XX'],
};
// Letter L is the grid value LETTERS.indexOf(L) + 1.
const LETTERS = Object.keys(PENTOMINO_ART);

// Drawn borders, as the pairs of cells they separate. Transcribed from the
// thick black wall strokes: 36 horizontal segments then 40 vertical ones.
const BORDERS = [
  [[1, 4], [2, 4]], [[1, 5], [2, 5]], [[1, 15], [2, 15]],
  [[2, 7], [3, 7]], [[2, 10], [3, 10]], [[3, 4], [4, 4]],
  [[3, 9], [4, 9]], [[3, 10], [4, 10]], [[4, 2], [5, 2]],
  [[4, 3], [5, 3]], [[4, 5], [5, 5]], [[4, 6], [5, 6]],
  [[4, 8], [5, 8]], [[4, 14], [5, 14]], [[5, 7], [6, 7]],
  [[6, 8], [7, 8]], [[6, 10], [7, 10]], [[6, 14], [7, 14]],
  [[7, 5], [8, 5]], [[7, 12], [8, 12]], [[8, 3], [9, 3]],
  [[8, 13], [9, 13]], [[10, 7], [11, 7]], [[10, 15], [11, 15]],
  [[11, 2], [12, 2]], [[11, 3], [12, 3]], [[11, 5], [12, 5]],
  [[12, 6], [13, 6]], [[12, 12], [13, 12]], [[13, 6], [14, 6]],
  [[13, 7], [14, 7]], [[13, 9], [14, 9]], [[13, 10], [14, 10]],
  [[13, 15], [14, 15]], [[14, 2], [15, 2]], [[14, 8], [15, 8]],
  [[1, 2], [1, 3]], [[2, 2], [2, 3]], [[2, 4], [2, 5]],
  [[2, 6], [2, 7]], [[2, 7], [2, 8]], [[2, 10], [2, 11]],
  [[2, 11], [2, 12]], [[2, 13], [2, 14]], [[3, 4], [3, 5]],
  [[3, 8], [3, 9]], [[4, 5], [4, 6]], [[4, 6], [4, 7]],
  [[4, 13], [4, 14]], [[5, 7], [5, 8]], [[5, 13], [5, 14]],
  [[6, 1], [6, 2]], [[7, 1], [7, 2]], [[7, 9], [7, 10]],
  [[7, 11], [7, 12]], [[7, 13], [7, 14]], [[8, 1], [8, 2]],
  [[8, 3], [8, 4]], [[8, 11], [8, 12]], [[8, 13], [8, 14]],
  [[9, 4], [9, 5]], [[9, 8], [9, 9]], [[9, 12], [9, 13]],
  [[9, 14], [9, 15]], [[10, 6], [10, 7]], [[10, 9], [10, 10]],
  [[11, 11], [11, 12]], [[11, 13], [11, 14]], [[12, 2], [12, 3]],
  [[12, 5], [12, 6]], [[13, 6], [13, 7]], [[13, 12], [13, 13]],
  [[14, 5], [14, 6]], [[14, 7], [14, 8]], [[14, 8], [14, 9]],
  [[14, 10], [14, 11]],
];

const key = (cells) => JSON.stringify(cells);
// Compiling a machine is expensive and most cells share one, so build each
// distinct machine once.
const memo = (fn) => {
  const cache = new Map();
  return (...args) => {
    const k = key(args);
    if (!cache.has(k)) cache.set(k, fn(...args));
    return cache.get(k);
  };
};
const sortCells = (cells) =>
  cells.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
// Translate a shape so its first cell in reading order sits at [0, 0]: a
// pentomino is stored as the offsets of its cells from that first cell.
const normalise = (cells) => {
  const [r0, c0] = sortCells(cells)[0];
  return sortCells(cells.map(([r, c]) => [r - r0, c - c0]));
};
const readArt = (rows) => rows.flatMap((row, r) =>
  [...row].map((ch, c) => ch === 'X' ? [r, c] : null).filter(cell => cell));
// The eight images of a shape under the symmetries of the square; duplicates
// collapse, so a symmetric pentomino yields fewer than eight.
const orientations = (cells) => {
  const seen = new Map();
  let turned = cells;
  for (let i = 0; i < 4; i++) {
    turned = turned.map(([r, c]) => [c, -r]);
    for (const image of [turned, turned.map(([r, c]) => [r, -c])]) {
      const norm = normalise(image);
      seen.set(key(norm), norm);
    }
  }
  return [...seen.values()];
};

// The 63 fixed pentominoes, each tagged with the value of the letter it is an
// orientation of.
const SHAPES = LETTERS.flatMap((letter, index) =>
  orientations(readArt(PENTOMINO_ART[letter]))
    .map(offsets => ({ offsets, letter: index + 1 })));

// Every offset a pentomino cell can have from its pentomino's first cell;
// OFFSETS[0] is [0, 0], the first cell itself.
const OFFSETS = sortCells([...new Map(
  SHAPES.flatMap(s => s.offsets).map(o => [key(o), o])).values()]);
const OFFSET_POS = new Map(OFFSETS.map((o, i) => [key(o), i]));
const DR_MIN = Math.min(...OFFSETS.map(o => o[0]));
const DC_MIN = Math.min(...OFFSETS.map(o => o[1]));
// VA holds the row part of the offset and VB the column part, shifted into the
// 1-12 value range: VA is 1-5 and VB is 1-8.
const encA = (dRow) => dRow - DR_MIN + 1;
const encB = (dCol) => dCol - DC_MIN + 1;
const FIRST_A = encA(0), FIRST_B = encB(0);

const shape = new Shape('15x15', `${LETTERS.length}`, 'Raw');
const graph = cellGraph(shape);
const numValues = graph.gridGeometry().numValues;
const gridCells = graph.cells();
const va = graph.makeOverlay('VA');
const vb = graph.makeOverlay('VB');

// --- Offset domain ------------------------------------------------------
// A cell's offset must be one a pentomino actually uses, and must point at a
// cell on the board.
const offsetKey = memo((offsets) => Pair.fnToKey(
  (a, b) => offsets.some(([dr, dc]) => encA(dr) === a && encB(dc) === b),
  shape));
const offsetRules = gridCells.map(cell => new Pair(
  offsetKey(OFFSETS.filter(([dr, dc]) => graph.step(cell, -dr, -dc))),
  'offset', va.at(cell), vb.at(cell)));

// --- Letters and membership agree ---------------------------------------
// Two orthogonally adjacent cells are in the same pentomino exactly when they
// point at the same first cell, which for a neighbour [dRow, dCol] away means
// its offset is smaller by that step. Same pentomino and same letter are the
// same thing: same letter forces same pentomino (two same-shaped pentominoes
// may not share an edge) and same pentomino forces same letter (the letter is
// the pentomino's shape). Read as [VA cell, VA neighbour, VB cell, VB
// neighbour, letter of cell, letter of neighbour].
const linkNFA = memo((dRow, dCol) => NFA.encodeSpec({
  startState: { phase: 'a1' },
  transition: (state, value) => {
    if (state.phase === 'a1') return { phase: 'a2', a: value };
    if (state.phase === 'a2') return { phase: 'b1', rowOk: value - state.a === dRow };
    if (state.phase === 'b1') return { phase: 'b2', rowOk: state.rowOk, b: value };
    if (state.phase === 'b2') {
      return { phase: 'd1', same: state.rowOk && value - state.b === dCol };
    }
    if (state.phase === 'd1') return { phase: 'd2', same: state.same, d: value };
    return (state.d === value) === state.same ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues));
const linkRules = gridCells.flatMap(cell => [RIGHT, DOWN].flatMap(([dr, dc]) => {
  const other = graph.step(cell, dr, dc);
  if (!other) return [];
  const pair = [cell, other];
  return [new NFA(linkNFA(dr, dc), 'same-pentomino',
    ...va.at(pair), ...vb.at(pair), ...pair)];
}));

// --- Pentomino shape ----------------------------------------------------
// One machine per cell, over that cell's own offset, the offsets of every cell
// that could point at it, and finally the cell's own letter. If the cell is a
// pentomino's first cell, the cells pointing at it must be exactly one fixed
// pentomino whose letter it names; if it is not, nothing may point at it.
// `window` lists the slots of OFFSETS whose cell is on the board, and `hit`
// carries whether a member's row offset matched while its column offset is
// still to be read.
const shapeNFA = memo((window) => {
  const candidates = SHAPES.filter(({ offsets }) => offsets.every(
    o => window.includes(OFFSET_POS.get(key(o))) || OFFSET_POS.get(key(o)) === 0));
  const memberSets = candidates.map(
    ({ offsets }) => new Set(offsets.map(o => OFFSET_POS.get(key(o)))));
  return NFA.encodeSpec({
    startState: { phase: 'a' },
    transition: (state, value) => {
      // The scan ends at the letter, so an accepting state takes no more cells.
      if (state.done) return undefined;
      if (state.phase === 'a') return { phase: 'b', first: value === FIRST_A };
      if (state.phase === 'b') {
        if (!state.first || value !== FIRST_B) return { phase: 'w', i: 0, cand: null };
        return { phase: 'w', i: 0, cand: candidates.map((_, j) => j) };
      }
      if (state.phase === 'w') {
        if (state.i === window.length) {
          // The window is spent; this last symbol is the cell's own letter.
          if (state.cand === null) return { done: true };
          return state.cand.some(j => candidates[j].letter === value)
            ? { done: true } : undefined;
        }
        return { phase: 'wb', i: state.i, cand: state.cand,
          hit: value === encA(OFFSETS[window[state.i]][0]) };
      }
      const points = state.hit && value === encB(OFFSETS[window[state.i]][1]);
      if (state.cand === null) {
        return points ? undefined : { phase: 'w', i: state.i + 1, cand: null };
      }
      const cand = state.cand.filter(
        j => memberSets[j].has(window[state.i]) === points);
      return cand.length ? { phase: 'w', i: state.i + 1, cand } : undefined;
    },
    accept: ({ done }) => done === true,
  }, numValues);
});
const shapeRules = gridCells.map(cell => {
  const window = OFFSETS.map((o, i) => i)
    .filter(i => i > 0 && graph.step(cell, ...OFFSETS[i]));
  const members = window.flatMap(i => {
    const member = graph.step(cell, ...OFFSETS[i]);
    return [va.at(member), vb.at(member)];
  });
  return new NFA(shapeNFA(window), 'pentomino-shape',
    va.at(cell), vb.at(cell), ...members, cell);
});

// --- Drawn borders ------------------------------------------------------
const borderRules = BORDERS.map(([a, b]) => new AllDifferent(
  makeCellId(...a), makeCellId(...b)));

return [
  shape,
  va.toVar('firstCellRow'),
  vb.toVar('firstCellCol'),
  ...offsetRules,
  ...linkRules,
  ...shapeRules,
  ...borderRules,
];
