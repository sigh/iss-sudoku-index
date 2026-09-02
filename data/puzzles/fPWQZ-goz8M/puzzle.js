// Title: Heterocut
// Author: Nikola Zivanovic
// Video: https://www.youtube.com/watch?v=fPWQZ-goz8M
// Source: https://cracking-the-cryptic.web.app/sudoku/6jDFjgn3m4

// Rules encoded here, in full:
//  * Divide the 7x12 grid into shapes of 2, 3, 4 or 5 squares. A shape is a
//    set of orthogonally connected cells and every cell lies in exactly one
//    shape.
//  * No two shapes are identical, even after rotation or reflection.
//  * Each arrow lies across one edge between two cells. That edge is a cut --
//    the two cells lie in different shapes -- and the arrow points at the
//    bigger of the two shapes, so the shape the head enters has more cells
//    than the shape the tail leaves.
// Nothing is omitted. There is no digit layer: the answer is the division.
//
// Counting the catalogue. The free polyominoes of 2 to 5 cells are 1 domino,
// 2 trominoes, 5 tetrominoes and 12 pentominoes: 20 shapes covering 88 cells
// between them. The grid holds 7*12 = 84 cells and no shape may be used twice,
// so shapes totalling exactly 4 cells go unused, and the only such subset is a
// single tetromino. Every one of the other 19 shapes is therefore used exactly
// once, which makes each shape's candidate placements a finite catalogue: the
// encoding is one Or per shape over its placements.

const ROWS = 7, COLS = 12;
const shape = new Shape('7x12', 13, 'Raw');
const graph = cellGraph(shape);

// The 15 drawn arrows, as [tail cell, head cell]. Each is a short stroke lying
// across one grid edge, with the head in the neighbouring cell it points into.
const ARROWS = [
  [[2, 2], [2, 3]],
  [[3, 2], [3, 3]],
  [[4, 3], [4, 4]],
  [[5, 1], [5, 2]],
  [[6, 2], [6, 3]],
  [[7, 1], [7, 2]],
  [[2, 4], [2, 5]],
  [[5, 4], [5, 5]],
  [[7, 4], [7, 5]],
  [[5, 6], [5, 7]],
  [[6, 6], [6, 7]],
  [[3, 8], [3, 7]],
  [[2, 10], [2, 9]],
  [[3, 12], [3, 11]],
  [[6, 12], [6, 11]],
].map(([tail, head]) => [makeCellId(...tail), makeCellId(...head)]);

// --- The shape catalogue -------------------------------------------------

const key = (cells) => JSON.stringify(cells);
const normalise = (cells) => {
  const top = Math.min(...cells.map(([r]) => r));
  const left = Math.min(...cells.map(([, c]) => c));
  return cells.map(([r, c]) => [r - top, c - left])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
};

// Every fixed (translation-only) polyomino of each size, grown one cell at a
// time from the single cell. Growing by an orthogonal neighbour is what makes
// the members of a shape orthogonally connected.
const fixedBySize = [null, [[[0, 0]]]];
for (let size = 2; size <= 5; size++) {
  const grown = new Map();
  for (const cells of fixedBySize[size - 1]) {
    for (const [r, c] of cells) {
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const [nr, nc] = [r + dr, c + dc];
        if (cells.some(([a, b]) => a === nr && b === nc)) continue;
        const norm = normalise([...cells, [nr, nc]]);
        grown.set(key(norm), norm);
      }
    }
  }
  fixedBySize[size] = [...grown.values()];
}

// The eight rotations and reflections of a shape. "Shapes cannot be identical,
// even being rotated/reflected" compares shapes up to exactly this group, so
// the classes below are the things the rule forbids repeating.
const symmetries = (cells) => {
  const out = [];
  let turned = cells;
  for (let i = 0; i < 4; i++) {
    turned = normalise(turned.map(([r, c]) => [c, -r]));
    out.push(turned, normalise(turned.map(([r, c]) => [r, -c])));
  }
  return out;
};

// One entry per free shape of the given size: the list of its distinct fixed
// orientations. Classes are ordered by the lexicographically smallest of their
// orientations, which for the twelve pentominoes gives
//   1 #####      2 ####/#...   3 ####/.#..  4 ###/##.
//   5 ###/#.#    6 ###/#../#.. 7 ###/.#./.#.  8 ###./..##
//   9 ##./.##/.#. 10 ##./.##/..# 11 ##./.#./.## 12 .#./###/.#.
// and for the five tetrominoes 1 ####, 2 ###/#.., 3 ###/.#., 4 ##/##,
// 5 ##./.## ; the trominoes are 1 ### and 2 ##/#. .
const freeClasses = (size) => {
  const byCanonical = new Map();
  for (const cells of fixedBySize[size]) {
    const canonical = symmetries(cells).map(key).sort()[0];
    if (!byCanonical.has(canonical)) byCanonical.set(canonical, []);
    byCanonical.get(canonical).push(cells);
  }
  return [...byCanonical.keys()].sort().map(k => byCanonical.get(k));
};

const CLASSES = { 2: freeClasses(2), 3: freeClasses(3), 4: freeClasses(4), 5: freeClasses(5) };

// Consequences of the arrow rule that a single placement already breaks, so a
// placement meeting one of them is not a candidate for any shape. The rule
// itself is still stated in full below, over the size layer; these only keep
// each Or to the placements the rule leaves live.
//  - a shape covering both cells of an arrow would make the cut it marks
//    disappear;
//  - a 5 covering an arrow's tail leaves no room for a bigger shape at the
//    head;
//  - a 2 covering an arrow's head leaves no room for a smaller one at the tail.
const isCandidate = (cells, size) => {
  const covers = new Set(cells);
  if (ARROWS.some(([tail, head]) => covers.has(tail) && covers.has(head))) return false;
  if (size === 5 && ARROWS.some(([tail]) => covers.has(tail))) return false;
  if (size === 2 && ARROWS.some(([, head]) => covers.has(head))) return false;
  return true;
};

// Every way one free shape can be laid on the grid, as a list of cell ids.
const placements = (orientations, size) => orientations.flatMap((cells) => {
  const height = Math.max(...cells.map(([r]) => r)) + 1;
  const width = Math.max(...cells.map(([, c]) => c)) + 1;
  const laid = [];
  for (let top = 1; top + height - 1 <= ROWS; top++) {
    for (let left = 1; left + width - 1 <= COLS; left++) {
      const placed = cells.map(([r, c]) => makeCellId(top + r, left + c));
      if (isCandidate(placed, size)) laid.push(placed);
    }
  }
  return laid;
});

// --- Naming the shape that covers each cell ------------------------------
// A cell carries the identity of its shape, so a cell claimed by two different
// shapes is a contradiction. There are 20 shapes and a grid carries at most 16
// values, so the name is split across two layers:
//   the main grid: 1-12 index the twelve pentomino classes, 13 = "some shape
//     of 2 to 4 cells covers me";
//   VS: 1 the domino, 2-3 the trominoes, 4-8 the tetrominoes, 9 = "a pentomino
//     covers me".
// One Pair per cell keeps the two layers agreeing about which half the cell's
// shape lives in, so a branch need only write its own layer and no cell is
// left with a free value.

const PENTOMINO = 9;                       // the VS code for "a pentomino covers me"
const NOT_PENTOMINO = 13;                  // the grid code for "a smaller shape covers me"
const SMALL_CODE = { 2: 1, 3: 2, 4: 4 };   // first VS code of each smaller size
const VS_SIZE = [0, 2, 3, 3, 4, 4, 4, 4, 4, 5];  // VS code -> cells in that shape

const vs = graph.makeOverlay('VS');
const omitted = new Var('T', 'omitted tetromino', 1);
const OMITTED = omitted.cells()[0];

const layersAgree = Pair.fnToKey(
  (main, small) => (small === PENTOMINO) === (main <= 12), shape);
// The arrow's head cell lies in a shape with more cells than its tail cell's.
const headIsBigger = Pair.fnToKey(
  (tail, head) => tail < VS_SIZE.length && head < VS_SIZE.length
    && VS_SIZE[head] > VS_SIZE[tail], shape);

// One Or per shape, over that shape's placements; the chosen branch writes the
// shape's own name onto each cell it covers. The five tetromino Ors carry an
// extra branch naming the tetromino in VT as the one left out: VT holds a
// single value, so at most one tetromino may take that escape, and placing all
// five would need 88 cells in an 84-cell grid, so exactly four are placed.
const shapeChoices = [
  ...CLASSES[5].map((orientations, i) => new Or(
    placements(orientations, 5).map(cells => new And(
      cells.map(cell => new Given(cell, i + 1)))))),
  ...[2, 3, 4].flatMap(size => CLASSES[size].map((orientations, i) => new Or([
    ...(size === 4 ? [new Given(OMITTED, i + 1)] : []),
    ...placements(orientations, size).map(cells => new And(
      cells.map(cell => new Given(vs.at(cell), SMALL_CODE[size] + i)))),
  ]))),
];

// Every cell lies in exactly one shape, so a shape's name appears on exactly as
// many cells as the shape has cells, and no more: the 19 shapes then account
// for 2 + 3 + 3 + 4*4 + 12*5 = 84 cells, the whole grid. On the main grid that
// is five cells for each pentomino class and 13 on the other 24 cells; on VS it
// is 2 for the domino, 3 for each tromino, 4 for each tetromino that is used,
// and 9 on the 60 cells of the twelve pentominoes. Which tetromino is missing
// is the value in VT, so the VS census is one branch per candidate.
// A shape is orthogonally connected, so the cells carrying one shape's name
// form a single connected region of that shape's size. This holds for every
// name that is certainly in use: the twelve pentomino codes on the main grid,
// and the domino and tromino codes on VS. The tetromino codes cannot take it,
// because one of the five names no shape at all; the "covered by the other
// layer" codes 13 and 9 name many shapes at once and are left alone.
const connectedShapes = [
  ...CLASSES[5].map((_, i) => new ConnectedValues('', i + 1, 5)),
  new ConnectedValues('VS', SMALL_CODE[2], 2),
  ...CLASSES[3].map((_, i) => new ConnectedValues('VS', SMALL_CODE[3] + i, 3)),
];

const repeated = (value, times) => new Array(times).fill(value);
const gridCensus = new ContainExact(
  [...CLASSES[5].flatMap((_, i) => repeated(i + 1, 5)),
    ...repeated(NOT_PENTOMINO, 24)].join('_'),
  ...graph.cells());
const smallCensus = new Or(CLASSES[4].map((_, missing) => new And([
  new Given(OMITTED, missing + 1),
  new ContainExact(
    [...repeated(SMALL_CODE[2], 2),
      ...CLASSES[3].flatMap((_, i) => repeated(SMALL_CODE[3] + i, 3)),
      ...CLASSES[4].flatMap((_, i) => i === missing ? [] : repeated(SMALL_CODE[4] + i, 4)),
      ...repeated(PENTOMINO, 60)].join('_'),
    ...vs.cells()),
])));

return [
  shape,
  vs.toVar('shape of 2-4 cells covering this cell'),
  omitted,

  // Layer domains: VS uses codes 1-9, VT names one of the five tetrominoes.
  vs.makeReplicate(new Given(vs.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  new Given(OMITTED, 1, 2, 3, 4, 5),
  ...graph.cells().map(cell => new Pair(layersAgree, 'layers', cell, vs.at(cell))),

  ...shapeChoices,
  gridCensus,
  smallCensus,
  ...connectedShapes,

  ...ARROWS.map(([tail, head]) =>
    new Pair(headIsBigger, 'arrow', vs.at(tail), vs.at(head))),
];
