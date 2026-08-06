// Title: Shredded
// Author: LibardiA
// Video: https://www.youtube.com/watch?v=Jy7zl_S5xj8
// Source: https://app.crackingthecryptic.com/817bobvnn5

// Rules encoded, all of them:
//  - The main grid is the reassembled 9x9 Sudoku: 1-9 once per row, column, box.
//  - The centre cell of each box holds that box's reading-order number.
//  - Digits in cages sum to the clue and are all different.
//  - Along blue lines, every segment of a line inside a 3x3 box sums to the same
//    total as that line's other segments.
//
// The nine detached 3x3 pieces live on a 13x13 canvas, so they are held in a VP
// overlay rather than on the main grid, and each piece is copied into the box
// named by its own centre digit.  Cages, givens and blue fragments stay at their
// drawn canvas positions on that overlay.
//
// The white canvas strokes trace grid lines outside the nine black outlines and
// are decoration; they are not encoded.

const grid = cellGraph('9x9');
const canvasGraph = grid.makeOverlay('VP');
const BOXES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// The nine black 3x3 outlines, as the canvas cell at each one's top-left corner.
const pieces = [
  [1, 3], [2, 7], [3, 11], [5, 2], [6, 6], [7, 10], [9, 1], [10, 5], [11, 9],
];

// Overlay box i carries piece i's nine cells in local reading order, which lets
// a canvas (row, col) address an overlay cell.
const canvasCell = new Map();
const localOffsets = BOXES.map((_, k) => [Math.floor(k / 3), k % 3]);
pieces.forEach(([top, left], i) =>
  canvasGraph.box(i + 1).forEach((cell, k) =>
    canvasCell.set(
      makeCellId(top + localOffsets[k][0], left + localOffsets[k][1]), cell)));
const vp = (row, col) => canvasCell.get(makeCellId(row, col));
const pieceAt = (row, col) => pieces.findIndex(
  ([top, left]) => row >= top && row < top + 3 && col >= left && col < left + 3);
const centre = pieces.map(([top, left]) => vp(top + 1, left + 1));

// Each box's reading-order number appears as exactly one piece's centre.
const distinctCentres = new AllDifferent(...centre);

// A piece whose centre reads N is box N, so its nine cells are the nine cells of
// box N, position for position.  The first Or branch is "this centre is not N".
const placement = pieces.flatMap(([top, left], i) =>
  BOXES.map(box => new Or([
    new Given(centre[i], ...BOXES.filter(value => value !== box)),
    new And(grid.box(box).map((gridCell, k) => new SameValues(
      2, vp(top + localOffsets[k][0], left + localOffsets[k][1]), gridCell))),
  ])));

// Canvas givens and killer cages, transcribed from the drawn digits and cages.
const givens = [[3, 11, 4], [4, 13, 6], [7, 3, 4]].map(
  ([row, col, value]) => new Given(vp(row, col), value));
const cages = [
  [12, [[3, 4], [3, 5]]],
  [28, [[2, 8], [2, 9], [3, 8], [3, 9]]],
  [9, [[4, 7], [4, 8]]],
  [8, [[5, 2], [5, 3]]],
  [10, [[6, 4], [7, 4]]],
  [5, [[8, 6], [8, 7]]],
  [10, [[7, 11], [7, 12]]],
  [10, [[12, 10], [13, 9], [13, 10]]],
].map(([total, cells]) => new Cage(total, ...cells.map(cell => vp(...cell))));

// The seven blue strokes, transcribed from their drawn waypoints: `cells` are the
// canvas cells the stroke covers, in stroke order.  `cuts` are the ends that run
// out to the piece's black outline instead of stopping at a cell centre -- the
// shredding cut -- each given as the direction the stroke leaves in and the cell
// it leaves through.
const fragments = [
  { cells: [[3, 3], [2, 4]], cuts: [['down', [3, 3]]] },
  { cells: [[6, 6], [6, 7]], cuts: [['up', [6, 6]]] },
  {
    cells: [[7, 10], [8, 10], [9, 11], [9, 10]],
    cuts: [['up', [7, 10]], ['left', [9, 10]]],
  },
  { cells: [[12, 10], [13, 9]], cuts: [['left', [13, 9]]] },
  { cells: [[12, 7], [11, 6], [10, 5]], cuts: [['right', [12, 7]]] },
  { cells: [[11, 1]], cuts: [['down', [11, 1]]] },
  { cells: [[8, 8]], cuts: [['right', [8, 8]]] },
];

// Box `a`'s neighbour in each direction, over boxes numbered 1-9 in reading
// order; null when the board edge is that way.
const NEIGHBOUR = {
  down: a => (a <= 6 ? a + 3 : null),
  right: a => (a % 3 !== 0 ? a + 1 : null),
};
const OPPOSITE = { down: 'up', right: 'left' };
// Pairwise keys over two centre digits, i.e. over two box numbers: "the second
// box is directly below / directly right of the first", and its negation.
const adjacentKey = {};
const separateKey = {};
for (const [dir, step] of Object.entries(NEIGHBOUR)) {
  adjacentKey[dir] = Pair.fnToKey((a, b) => step(a) === b, grid.gridGeometry());
  separateKey[dir] = Pair.fnToKey((a, b) => step(a) !== b, grid.gridGeometry());
}

// A cut's offset along the edge it crosses: the local column for a vertical cut,
// the local row for a horizontal one.  Two cuts can be the two halves of one
// severed line only if they cross opposite edges at the same offset.
const cuts = fragments.flatMap((fragment, f) =>
  fragment.cuts.map(([dir, [row, col]]) => {
    const piece = pieceAt(row, col);
    const [top, left] = pieces[piece];
    const vertical = dir === 'up' || dir === 'down';
    return { f, dir, piece, offset: vertical ? col - left : row - top };
  }));
const joins = cuts.filter(cut => OPPOSITE[cut.dir]).flatMap(from =>
  cuts.filter(to => to.dir === OPPOSITE[from.dir] && to.offset === from.offset)
    .map(to => ({ from, to })));
const joinPair = (join, keys) => new Pair(
  keys[join.from.dir], join.from.dir,
  centre[join.from.piece], centre[join.to.piece]);

// Every cut end continues into the piece across that edge, so each cut is joined
// to one of the opposite-edge cuts that could meet it.
const rejoined = cuts.map(cut => new Or(
  joins.filter(join => join.from === cut || join.to === cut)
    .map(join => joinPair(join, adjacentKey))));

// Two fragments belong to one blue line exactly when their cuts meet, so their
// segment sums are equal unless the placement keeps the two pieces apart.  A
// three-segment line is covered by its two joins in turn.
const segmentSums = joins.map(join => new Or([
  joinPair(join, separateKey),
  new EqualSum(
    fragments[join.from.f].cells.map(cell => vp(...cell)),
    fragments[join.to.f].cells.map(cell => vp(...cell))),
]));

return [
  new Shape('9x9'),
  canvasGraph.toVar('canvas cells of the nine separated 3x3 pieces'),
  distinctCentres,
  ...placement,
  ...givens,
  ...cages,
  ...rejoined,
  ...segmentSums,
];
