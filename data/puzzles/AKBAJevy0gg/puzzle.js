// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=AKBAJevy0gg
// Source: https://cracking-the-cryptic.web.app/sudoku/4bn87PGj77

// Pentominous on the white 10x10 grid. Rules encoded here, in full:
//  * Divide the grid into pentominoes (regions of five orthogonally connected
//    cells).
//  * A cell carrying a letter lies in a pentomino of that letter's shape, as
//    drawn in the diagram below the grid.
//  * Two pentominoes of the same letter may not share an edge.
//
// The board holds one letter per cell -- the letter of the pentomino covering
// it -- so the value range is the twelve letters rather than digits, and the
// grid is `Raw`: a letter repeats freely along a row or column.
//
// Because same-letter pentominoes may not touch, the pentominoes ARE the
// orthogonally connected same-letter groups, and the third rule needs no
// separate machinery beyond making that identification explicit.
//
// A pentomino is five cells, so it is named by the offset from each of its
// cells back to the piece's first cell in reading order. Two Var overlays
// carry that naming: VO is which of the letter's fixed orientations the piece
// takes, VK is which cell of that orientation this cell is. (VO, VK) plus the
// letter give the offset, and the two overlays are pinned by the true piece,
// so they add no symmetry of their own.

// The twelve coloured blocks of the diagram below the grid, as drawn, each
// named by the letter printed inside it. Canvas rows 11-16, columns 1-10.
const LEGEND = {
  F: [[13, 6], [14, 5], [14, 6], [14, 7], [15, 7]],
  I: [[11, 1], [12, 1], [13, 1], [14, 1], [15, 1]],
  L: [[12, 6], [12, 7], [12, 8], [12, 9], [13, 9]],
  N: [[15, 5], [15, 6], [16, 6], [16, 7], [16, 8]],
  P: [[11, 2], [11, 3], [12, 2], [12, 3], [13, 2]],
  T: [[14, 2], [15, 2], [16, 1], [16, 2], [16, 3]],
  U: [[14, 9], [14, 10], [15, 10], [16, 9], [16, 10]],
  V: [[11, 8], [11, 9], [11, 10], [12, 10], [13, 10]],
  W: [[14, 3], [15, 3], [15, 4], [16, 4], [16, 5]],
  X: [[12, 4], [13, 3], [13, 4], [13, 5], [14, 4]],
  Y: [[11, 4], [11, 5], [11, 6], [11, 7], [12, 5]],
  Z: [[13, 7], [13, 8], [14, 8], [15, 8], [15, 9]],
};

// Letter value: 1..12 in this order.
const LETTERS = Object.keys(LEGEND);

const key = (value) => JSON.stringify(value);
const memo = (fn) => {
  const cache = new Map();
  return (...args) => {
    const k = key(args);
    if (!cache.has(k)) cache.set(k, fn(...args));
    return cache.get(k);
  };
};

// Reading order, and translated so the first cell in reading order is [0, 0].
const sortCells = (cells) =>
  cells.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
const normalise = (cells) => {
  const sorted = sortCells(cells);
  const [r0, c0] = sorted[0];
  return sorted.map(([r, c]) => [r - r0, c - c0]);
};

// The diagram shows twelve shapes -- the whole free-pentomino set, with each of
// the six chiral pentominoes appearing once. A letter therefore names its shape
// up to rotation and reflection, so all eight symmetries are generated here and
// deduplicated. ORIENTS[letter index] lists that letter's distinct fixed forms.
const ORIENTS = LETTERS.map((letter) => {
  const forms = new Map();
  let turned = LEGEND[letter];
  for (let i = 0; i < 4; i++) {
    turned = turned.map(([r, c]) => [c, -r]);
    for (const form of [turned, turned.map(([r, c]) => [r, -c])]) {
      const norm = normalise(form);
      forms.set(key(norm), norm);
    }
  }
  return [...forms.values()];
});

// Every offset a cell can have from its piece's first cell; index 0 of an
// orientation is always [0, 0], the first cell itself.
const OFFSETS = [...new Map(ORIENTS.flat().flat()
  .filter(([r, c]) => r !== 0 || c !== 0)
  .map(o => [key(o), o])).values()];

const shape = new Shape('10x10', LETTERS.length, 'Raw');
const graph = cellGraph(shape);
const gridCells = graph.cells();

const vo = graph.makeOverlay('VO');
const vk = graph.makeOverlay('VK');

// Decoding of a cell's three values. `letter`, `orient` and `index` are the
// 1-based cell values; the piece's cell list is ORIENTS[letter - 1][orient - 1]
// and this cell sits at entry `index - 1` of it.
const orientOf = (letter, orient) => ORIENTS[letter - 1][orient - 1] || null;
const offsetOf = (letter, orient, index) => {
  const cells = orientOf(letter, orient);
  return cells && index <= cells.length ? cells[index - 1] : null;
};
const indexOf = (letter, orient, offset) => {
  const cells = orientOf(letter, orient);
  if (!cells) return null;
  const at = cells.findIndex(o => o[0] === offset[0] && o[1] === offset[1]);
  return at < 0 ? null : at + 1;
};

// --- The piece a cell claims fits on the board --------------------------
// Read as [letter, VO, VK] of one cell: the orientation must exist for the
// letter, the index must exist in the orientation, and the whole piece --
// anchored at this cell's first cell -- must lie inside the grid.
const fitsNFA = memo((allowed) => NFA.encodeSpec({
  startState: { phase: 'letter' },
  transition: (state, value) => {
    if (state.done) return undefined;
    if (state.phase === 'letter') return { phase: 'orient', letter: value };
    if (state.phase === 'orient') {
      if (!orientOf(state.letter, value)) return undefined;
      return { phase: 'index', letter: state.letter, orient: value };
    }
    return allowed.some(
      ([l, o, k]) => l === state.letter && o === state.orient && k === value)
      ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, shape));

const fitsRules = gridCells.map(cell => {
  // The (letter, orientation, index) triples whose piece stays on the grid.
  const allowed = [];
  ORIENTS.forEach((orients, l) => orients.forEach((cells, o) => {
    cells.forEach(([dr, dc], k) => {
      const fits = cells.every(
        ([r, c]) => graph.step(cell, r - dr, c - dc) !== null);
      if (fits) allowed.push([l + 1, o + 1, k + 1]);
    });
  }));
  return new NFA(fitsNFA(allowed), 'piece-fits', cell, vo.at(cell), vk.at(cell));
});

// --- A piece and its member cells ---------------------------------------
// One machine per ordered pair (A, B) with B at offset `delta` from A, read as
// [letter, VO, VK of A, then of B]. Two claims must agree:
//   * A is a first cell whose piece has a member at `delta`; and
//   * B's own offset back to its first cell is `delta`, i.e. B claims A.
// Neither may hold without the other, and where they do the two cells are the
// same piece, so they carry the same letter and orientation and B's index is
// the one `delta` occupies. That makes every cell a member of exactly one
// piece and every piece exactly five cells of the drawn shape.
const memberNFA = memo((delta) => NFA.encodeSpec({
  startState: { phase: 'letterA' },
  transition: (state, value) => {
    if (state.done) return undefined;
    if (state.phase === 'letterA') return { phase: 'orientA', letter: value };
    if (state.phase === 'orientA') {
      if (!orientOf(state.letter, value)) return undefined;
      return { phase: 'indexA', letter: state.letter, orient: value };
    }
    if (state.phase === 'indexA') {
      const offset = offsetOf(state.letter, state.orient, value);
      if (!offset) return undefined;
      const isFirst = offset[0] === 0 && offset[1] === 0;
      const member = indexOf(state.letter, state.orient, delta);
      return isFirst && member !== null
        ? { phase: 'letterB', letter: state.letter, orient: state.orient }
        : { phase: 'otherB' };
    }
    // A does own a member at `delta`: B must be that member.
    if (state.phase === 'letterB') {
      return value === state.letter
        ? { phase: 'orientB', letter: state.letter, orient: state.orient }
        : undefined;
    }
    if (state.phase === 'orientB') {
      if (value !== state.orient) return undefined;
      return { phase: 'checkB', want: indexOf(state.letter, state.orient, delta) };
    }
    if (state.phase === 'checkB') {
      return value === state.want ? { done: true } : undefined;
    }
    // A does not own a member at `delta`: B must not claim A either.
    if (state.phase === 'otherB') return { phase: 'otherO', letter: value };
    if (state.phase === 'otherO') {
      if (!orientOf(state.letter, value)) return undefined;
      return { phase: 'otherK', letter: state.letter, orient: value };
    }
    const offset = offsetOf(state.letter, state.orient, value);
    if (!offset) return undefined;
    return offset[0] === delta[0] && offset[1] === delta[1]
      ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, shape));

const memberRules = gridCells.flatMap(cell => OFFSETS.flatMap(delta => {
  const other = graph.step(cell, ...delta);
  if (!other) return [];
  return [new NFA(memberNFA(delta), 'piece-member',
    cell, vo.at(cell), vk.at(cell), other, vo.at(other), vk.at(other))];
}));

// --- Same-letter pieces may not share an edge ---------------------------
// One machine per orthogonally adjacent ordered pair, read as [letter, VO, VK
// of A, then of B]: equal letters force B's offset to be A's offset plus the
// step between them, which says the two cells belong to the same piece.
const noTouchNFA = memo((step) => NFA.encodeSpec({
  startState: { phase: 'letterA' },
  transition: (state, value) => {
    if (state.done) return undefined;
    if (state.phase === 'letterA') return { phase: 'orientA', letter: value };
    if (state.phase === 'orientA') {
      if (!orientOf(state.letter, value)) return undefined;
      return { phase: 'indexA', letter: state.letter, orient: value };
    }
    if (state.phase === 'indexA') {
      const offset = offsetOf(state.letter, state.orient, value);
      if (!offset) return undefined;
      return {
        phase: 'letterB',
        letter: state.letter,
        want: [offset[0] + step[0], offset[1] + step[1]],
      };
    }
    if (state.phase === 'letterB') {
      // Different letters: nothing to check, consume B's two overlay cells.
      if (value !== state.letter) return { skip: 2 };
      return { phase: 'orientB', letter: state.letter, want: state.want };
    }
    if (state.skip) {
      return state.skip > 1 ? { skip: state.skip - 1 } : { done: true };
    }
    if (state.phase === 'orientB') {
      const index = orientOf(state.letter, value)
        && indexOf(state.letter, value, state.want);
      return index ? { phase: 'checkB', want: index } : undefined;
    }
    return value === state.want ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, shape));

const noTouchRules = gridCells.flatMap(cell => [[0, 1], [1, 0]].flatMap(step => {
  const other = graph.step(cell, ...step);
  if (!other) return [];
  return [new NFA(noTouchNFA(step), 'letter-no-touch',
    cell, vo.at(cell), vk.at(cell), other, vo.at(other), vk.at(other))];
}));

// --- Lettered cells -----------------------------------------------------
// The letters printed in the white grid, from the payload's cell values.
const CLUES = {
  R1C3: 'P',
  R3C2: 'F', R3C3: 'I', R3C4: 'L', R3C5: 'L', R3C7: 'I', R3C8: 'N',
  R8C4: 'P', R8C5: 'U', R8C6: 'Z', R8C7: 'Z', R8C8: 'L', R8C9: 'Y',
};

const clues = Object.entries(CLUES).map(
  ([cell, letter]) => new Given(cell, LETTERS.indexOf(letter) + 1));

return [
  shape,
  vo.toVar('orientation'),
  vk.toVar('pieceIndex'),
  ...clues,
  ...fitsRules,
  ...memberRules,
  ...noTouchRules,
];
