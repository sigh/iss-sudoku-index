// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=YsDJO6MHSjU
// Source: https://cracking-the-cryptic.web.app/sudoku/BpGttT8BLr

// Rules encoded here:
//  - Divide the 10x10 grid into pentominoes (five-cell orthogonally connected
//    regions).
//  - No two pentominoes of the same shape, counting rotations and reflections
//    as the same shape, may share an edge.
//  - A cell holding a letter is part of a pentomino with the shape that letter
//    names, using the standard pentomino alphabet drawn in the legend below the
//    grid.
//  - The legend is a reference list, and the rules say not all of its shapes
//    need be used, so it places no constraint of its own.
// The grid has no Sudoku layer at all: it is a Raw grid whose cell values are
// pentomino letters, so letters repeat freely along rows and columns.
//
// Two of the twelve letter clues, T and U, are drawn as thick strokes on the
// cell lattice rather than as cell contents. Each stroke's bounding box is a
// 2x2 block of cells and its centre falls on the lattice corner those four
// cells share, so the drawing does not say which of the four carries the clue.
// Each is encoded as a disjunction over its four candidate cells.

const LETTERS = ['F', 'I', 'L', 'N', 'P', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

// The twelve pentominoes as the legend under the grid draws them, each as
// [row, col] offsets of its five cells.
const PENTOMINOES = {
  F: [[0, 1], [0, 2], [1, 0], [1, 1], [2, 1]],
  I: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
  L: [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1]],
  N: [[0, 1], [1, 1], [2, 0], [2, 1], [3, 0]],
  P: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0]],
  T: [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1]],
  U: [[0, 0], [0, 2], [1, 0], [1, 1], [1, 2]],
  V: [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]],
  W: [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2]],
  X: [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]],
  Y: [[0, 1], [1, 0], [1, 1], [2, 1], [3, 1]],
  Z: [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2]],
};

// The ten letter clues printed inside grid cells, as [row, column, letter].
const LETTER_GIVENS = [
  [1, 1, 'F'], [1, 4, 'I'], [1, 7, 'L'], [2, 9, 'N'], [5, 1, 'P'],
  [6, 10, 'V'], [9, 2, 'W'], [10, 4, 'X'], [10, 7, 'Y'], [10, 10, 'Z'],
];

// The two letter clues drawn as strokes, as the top-left cell of the 2x2 block
// each stroke's bounding box covers: the T spans R4C4-R5C5 and the U spans
// R6C6-R7C7.
const STROKE_GIVENS = [
  ['T', 4, 4],
  ['U', 6, 6],
];

// Rotations and reflections of a pentomino, normalised so that the first cell
// in reading order sits at (0, 0) and deduplicated: a shape with symmetry has
// fewer than eight distinct forms, and X has only one.
const TRANSFORMS = [
  ([r, c]) => [r, c], ([r, c]) => [-r, c], ([r, c]) => [r, -c],
  ([r, c]) => [-r, -c], ([r, c]) => [c, r], ([r, c]) => [-c, r],
  ([r, c]) => [c, -r], ([r, c]) => [-c, -r],
];
const normalise = (cells) => {
  const sorted = [...cells].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const [baseRow, baseCol] = sorted[0];
  return sorted.map(([r, c]) => [r - baseRow, c - baseCol]);
};
const orientationsOf = (cells) => {
  const forms = new Map();
  for (const t of TRANSFORMS) {
    const form = normalise(cells.map(t));
    forms.set(JSON.stringify(form), form);
  }
  return [...forms.values()];
};

// A cell's state is the triple (letter, orientation, offset within that
// oriented shape). Normalising each orientation to its reading-order-first
// cell keeps the offset inside rows 0..4 and columns -4..4, so the row part
// fits values 1..5 and the column part values 1..9 once shifted by COL_SHIFT.
const COL_SHIFT = 5;
const tuples = [];
LETTERS.forEach((letter, letterIndex) => {
  orientationsOf(PENTOMINOES[letter]).forEach((form, formIndex) => {
    for (const [dRow, dCol] of form) {
      tuples.push({
        l: letterIndex + 1,
        o: formIndex + 1,
        r: dRow + 1,
        c: dCol + COL_SHIFT,
      });
    }
  });
});
const tupleKey = (l, o, r, c) => `${l},${o},${r},${c}`;
const tupleIndex = new Map(
  tuples.map((t, i) => [tupleKey(t.l, t.o, t.r, t.c), i]));

// Prefixes of a valid tuple, so a scan can reject a dead branch as soon as the
// letter/orientation/row part cannot be completed.
const validLO = new Set(tuples.map(t => `${t.l},${t.o}`));
const validLOR = new Set(tuples.map(t => `${t.l},${t.o},${t.r}`));

// For each tuple, the tuple of the cell one step away inside the same oriented
// shape, or -1 when the shape has no cell there.
const NORTH = 0, SOUTH = 1, EAST = 2, WEST = 3;
const STEPS = [[-1, 0], [1, 0], [0, 1], [0, -1]];
const NEIGHBOUR = tuples.map(t => STEPS.map(
  ([dr, dc]) => tupleIndex.get(tupleKey(t.l, t.o, t.r + dr, t.c + dc)) ?? -1));

const shape = new Shape('10x10', LETTERS.length, 'Raw');
const graph = cellGraph(shape);
const orientation = graph.makeOverlay('VO');
const offsetRow = graph.makeOverlay('VR');
const offsetCol = graph.makeOverlay('VC');

// The whole puzzle is one scan, run once per row and once per column. It reads
// each cell as four symbols -- letter, orientation, offset row, offset column
// -- and carries between cells what the next cell along the scan must be:
//
//   w >= 0  the shape of the cell just read continues this way, so the next
//           cell is exactly tuple w (same letter, same orientation, the
//           adjacent offset);
//   w < 0   the shape stops here, so the next cell starts another pentomino:
//           its letter must differ from b (that is the no-two-same-shapes-
//           adjacent rule, since equal letters would mean equal shapes) and
//           its own shape must not reach back the way we came.
//
// `accept` requires w < 0 at the end of the scan, and the scan starts with
// w < 0, so no pentomino may run off either end of the line.
const makeScan = (forward, backward) => NFA.encodeSpec({
  startState: { p: 0, w: -1, b: 0 },
  transition: (s, value) => {
    switch (s.p) {
      case 0:  // letter
        if (s.w >= 0) {
          return tuples[s.w].l === value ? { p: 1, w: s.w } : undefined;
        }
        return value === s.b ? undefined : { p: 1, w: -1, l: value };
      case 1:  // orientation
        if (s.w >= 0) {
          return tuples[s.w].o === value ? { p: 2, w: s.w } : undefined;
        }
        return validLO.has(`${s.l},${value}`)
          ? { p: 2, w: -1, l: s.l, o: value } : undefined;
      case 2:  // offset row
        if (s.w >= 0) {
          return tuples[s.w].r === value ? { p: 3, w: s.w } : undefined;
        }
        return validLOR.has(`${s.l},${s.o},${value}`)
          ? { p: 3, w: -1, l: s.l, o: s.o, r: value } : undefined;
      default: {  // offset column, completing the cell's tuple
        let index;
        if (s.w >= 0) {
          if (tuples[s.w].c !== value) return undefined;
          index = s.w;
        } else {
          index = tupleIndex.get(tupleKey(s.l, s.o, s.r, value));
          if (index === undefined) return undefined;
          if (NEIGHBOUR[index][backward] >= 0) return undefined;
        }
        const next = NEIGHBOUR[index][forward];
        return next >= 0
          ? { p: 0, w: next } : { p: 0, w: -1, b: tuples[index].l };
      }
    }
  },
  accept: (s) => s.p === 0 && s.w < 0,
  maxDepth: 40,
}, shape);

const acrossScan = makeScan(EAST, WEST);
const downScan = makeScan(SOUTH, NORTH);
const scanCells = (cells) => cells.flatMap(
  cell => [cell, orientation.at(cell), offsetRow.at(cell), offsetCol.at(cell)]);

const letterValue = (letter) => LETTERS.indexOf(letter) + 1;

return [
  shape,
  orientation.toVar('Orientation'),
  offsetRow.toVar('Offset row'),
  offsetCol.toVar('Offset column'),

  ...LETTER_GIVENS.map(
    ([row, col, letter]) => new Given(makeCellId(row, col), letterValue(letter))),
  // Each stroke clue applies to one of the four cells of the block it covers.
  ...STROKE_GIVENS.map(([letter, row, col]) => new Or(
    graph.block(makeCellId(row, col), 2, 2).map(
      cell => new Given(cell, letterValue(letter))))),

  ...graph.rows().map(
    (row, i) => new NFA(acrossScan, `row ${i + 1}`, ...scanCells(row))),
  ...graph.columns().map(
    (col, i) => new NFA(downScan, `column ${i + 1}`, ...scanCells(col))),
];
