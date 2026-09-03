// Title: Fillomino Sudoku
// Author: spxtr
// Video: https://www.youtube.com/watch?v=14WKDmkXn3Y
// Source: https://cracking-the-cryptic.web.app/sudoku/HQGn6PG27m

// Rules encoded here:
//  * Normal sudoku rules do NOT apply, except that each of 3, 4 and 5 is
//    entered once in every row, every column and every 3x3 box. Those are the
//    only digits that may appear; the other 54 cells stay empty.
//  * The grid is completely and uniquely covered by polyominoes of size 3, 4
//    and 5 -- every cell lies in exactly one piece -- and two pieces of equal
//    size may not share an edge.
//  * Every entered 3, 4 or 5 lies in a piece of its own size. A piece may hold
//    more than one entered digit, which are then all of that one value.
//
// Nothing is omitted. "Completely and uniquely covered" is taken as an exact
// cover, which is what a size-per-cell layer expresses: one size for every
// cell, so no cell is left out and none is covered twice.

const SIDE = 9;
const MAX_AREA = 5;              // the largest polyomino size the rules allow
const EMPTY = 0;                 // a cell with no entered digit
const DIGITS = [3, 4, 5];

// Raw: 54 of the 81 cells are empty, so rows and columns repeat a value and
// none of the automatic latin rules applies. The alphabet is widened to 0-9 so
// that 0 can mean "empty" and so a root's row/column index below fits a Var.
const shape = new Shape('9x9', '0-9', 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

// ---------------------------------------------------------------- digits ---

const digitDomain = graph.makeReplicate(new Given(cells[0], EMPTY, ...DIGITS));

// The twelve printed digits: [row, col, digit]. Each also carries a solid
// background square whose colour restates the digit (green 3, red 4, blue 5),
// which adds nothing to encode.
const GIVENS = [
  [1, 9, 5], [2, 4, 4], [2, 7, 3], [3, 1, 4], [3, 4, 3], [3, 5, 5],
  [4, 3, 3], [4, 4, 5], [6, 5, 4], [7, 1, 3], [8, 3, 5], [9, 9, 4],
];

// A Raw grid has no boxes of its own, so the drawn 3x3 tiling is rebuilt here.
const BOX_ORIGINS = [1, 4, 7];
const boxes = BOX_ORIGINS.flatMap(
  row => BOX_ORIGINS.map(col => graph.block(makeCellId(row, col), 3, 3)));
const oneEach = [...graph.rows(), ...graph.columns(), ...boxes].map(
  unit => new ContainExact(DIGITS.join('_'), ...unit));

// ------------------------------------------------------------ polyominoes ---

// The cover is carried by one size per cell: a piece is then the orthogonally
// connected run of equal sizes containing a cell, and the two remaining
// clauses -- a piece of size n has n cells, and equal-sized pieces do not touch
// -- together say exactly that such a run has as many cells as its own value.
const size = graph.makeOverlay('VZ');
const sizeDomain = size.makeReplicate(
  new Given(size.cells()[0], ...DIGITS));

// Each piece is modelled as a rooted tree over its own cells. Five more
// overlays carry that tree; all of them are bookkeeping rather than puzzle
// content:
//   parent  - ROOT, or the direction of the cell one step nearer the root;
//   subtree - how many cells hang below this one, itself included;
//   rootRow
//   rootCol - which cell is the root of this cell's piece;
//   depth   - steps from the root, counting the root as 1.
// Four facts then say "the connected run of equal sizes has that many cells":
// a root's subtree is its whole piece and equals the size written there; a
// non-root hangs off a neighbour of the same size; two neighbours of the same
// size must name the same root, so two equal-sized pieces cannot end up sharing
// an edge; and depth strictly decreases towards a root, so the pointers cannot
// cycle and every cell reaches its root.
const ROOT = 1;
const DIRS = [
  // `back` is the pointer value a neighbour in this direction uses to point
  // back at the cell we started from.
  { code: 2, back: 3, dRow: -1, dCol: 0 },
  { code: 3, back: 2, dRow: 1, dCol: 0 },
  { code: 4, back: 5, dRow: 0, dCol: -1 },
  { code: 5, back: 4, dRow: 0, dCol: 1 },
];
const parent = graph.makeOverlay('VP');
const subtree = graph.makeOverlay('VS');
const rootRow = graph.makeOverlay('VR');
const rootCol = graph.makeOverlay('VC');
const depth = graph.makeOverlay('VD');

const neighboursOf = cell => DIRS
  .map(dir => ({ dir, other: graph.step(cell, dir.dRow, dir.dCol) }))
  .filter(entry => entry.other);

// Reads [subtree(cell), then parent(n), subtree(n) for each neighbour n in a
// fixed order]. `expected[i]` is the pointer value that makes neighbour i a
// child of this cell. The state carries only how much of the cell's own subtree
// count is still unaccounted for, so it never climbs past MAX_AREA - 1.
const subtreeSpecs = new Map();
const subtreeSpec = expected => {
  const key = expected.join('_');
  if (!subtreeSpecs.has(key)) {
    subtreeSpecs.set(key, NFA.encodeSpec({
      startState: { i: -1, rem: null, child: null },
      transition: (state, value) => {
        if (state.i === -1) return { i: 0, rem: value - 1, child: null };
        if (state.i >= expected.length) return undefined;
        if (state.child === null) {
          return { i: state.i, rem: state.rem, child: value === expected[state.i] };
        }
        const rem = state.child ? state.rem - value : state.rem;
        return rem < 0 ? undefined : { i: state.i + 1, rem, child: null };
      },
      accept: state => state.i === expected.length && state.rem === 0,
    }, shape));
  }
  return subtreeSpecs.get(key);
};

const subtreeSums = cells.map(cell => {
  const neighbours = neighboursOf(cell);
  return new NFA(
    subtreeSpec(neighbours.map(entry => entry.dir.back)),
    'subtree size',
    subtree.at(cell),
    ...neighbours.flatMap(
      ({ other }) => [parent.at(other), subtree.at(other)]));
});

// Reads [size(a), size(b), label(a), label(b)] for one orthogonal edge:
// neighbours of the same size are in the same piece and so must name the same
// root. Used once for the root's row and once for its column.
const rootEdgeSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, mine: value };
    if (state.phase === 1) return { phase: 2, same: value === state.mine };
    if (state.phase === 2) return { phase: 3, same: state.same, label: value };
    if (state.phase === 3) {
      return (!state.same || value === state.label) ? { phase: 4 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 4,
}, shape);

// Reads [size(a), size(b), depth(a), depth(b)]: within a piece no step may
// change the distance to the root by more than one, which is what makes `depth`
// the true distance rather than any descending chain.
const depthEdgeSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, mine: value };
    if (state.phase === 1) return { phase: 2, same: value === state.mine };
    if (state.phase === 2) return { phase: 3, same: state.same, depth: value };
    if (state.phase === 3) {
      return (!state.same || Math.abs(value - state.depth) <= 1)
        ? { phase: 4 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 4,
}, shape);

const edges = cells.flatMap(cell => DIRS
  .filter(dir => dir.dRow > 0 || dir.dCol > 0)   // each edge once
  .flatMap(dir => {
    const other = graph.step(cell, dir.dRow, dir.dCol);
    return other ? [{ cell, other }] : [];
  }));

const pieceEdges = edges.flatMap(({ cell, other }) => [
  new NFA(rootEdgeSpec, 'same piece root row',
    size.at(cell), size.at(other), rootRow.at(cell), rootRow.at(other)),
  new NFA(rootEdgeSpec, 'same piece root column',
    size.at(cell), size.at(other), rootCol.at(cell), rootCol.at(other)),
  new NFA(depthEdgeSpec, 'depth changes by one',
    size.at(cell), size.at(other), depth.at(cell), depth.at(other)),
]);

// Reads [size(cell), size(other), depth(cell), depth(other)] and rejects the
// case where `other` could have served as the parent. Placed on the earlier
// directions of each branch, it makes the parent the first eligible neighbour
// in DIRS order, so the tree is fixed by the piece rather than chosen.
const notParentSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, mine: value };
    if (state.phase === 1) return { phase: 2, same: value === state.mine };
    if (state.phase === 2) return { phase: 3, same: state.same, depth: value };
    if (state.phase === 3) {
      return (state.same && value === state.depth - 1) ? undefined : { phase: 4 };
    }
    return undefined;
  },
  accept: state => state.phase === 4,
}, shape);

const depthStep = Pair.fnToKey((mine, other) => other === mine - 1, shape);

const parentChoice = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  const neighbours = neighboursOf(cell);
  return new Or([
    new And([
      new Given(parent.at(cell), ROOT),
      new Given(depth.at(cell), 1),
      new Given(rootRow.at(cell), row),
      new Given(rootCol.at(cell), col),
      new SameValues(2, subtree.at(cell), size.at(cell)),
    ]),
    ...neighbours.map(({ dir, other }, k) => new And([
      new Given(parent.at(cell), dir.code),
      new SameValues(2, size.at(cell), size.at(other)),
      new SameValues(2, rootRow.at(cell), rootRow.at(other)),
      new SameValues(2, rootCol.at(cell), rootCol.at(other)),
      new Pair(depthStep, 'one step nearer the root',
        depth.at(cell), depth.at(other)),
      ...neighbours.slice(0, k).map(earlier => new NFA(
        notParentSpec, 'earlier neighbour is not a parent',
        size.at(cell), size.at(earlier.other),
        depth.at(cell), depth.at(earlier.other))),
    ])),
  ]);
});

// Which cell of a piece carries the root is this model's choice, not the
// puzzle's, so it is pinned to the piece's first cell in reading order: a
// cell's root never comes after the cell itself.
const rootOrderKeys = new Map();
const rootOrderKey = (row, col) => {
  const key = row + '_' + col;
  if (!rootOrderKeys.has(key)) {
    rootOrderKeys.set(key, Pair.fnToKey(
      (r, c) => r < row || (r === row && c <= col), shape));
  }
  return rootOrderKeys.get(key);
};

// A root's row and column name a cell on this board, so they run 1-9 even
// though the alphabet also carries 0.
const onBoard = Array.from({ length: SIDE }, (_, i) => i + 1);
const rootDomains = [
  rootRow.makeReplicate(new Given(rootRow.cells()[0], ...onBoard)),
  rootCol.makeReplicate(new Given(rootCol.cells()[0], ...onBoard)),
  ...cells.map(cell => {
    const { row, col } = parseCellId(cell);
    return new Pair(rootOrderKey(row, col), 'root comes first in reading order',
      rootRow.at(cell), rootCol.at(cell));
  }),
];

// No piece holds more than MAX_AREA cells, so neither a subtree count nor a
// depth can exceed it.
const counterValues = Array.from({ length: MAX_AREA }, (_, i) => i + 1);
const counterDomains = [
  subtree.makeReplicate(new Given(subtree.cells()[0], ...counterValues)),
  depth.makeReplicate(new Given(depth.cells()[0], ...counterValues)),
];

// An entered digit must equal the size of the piece holding it; an empty cell
// says nothing about its piece.
const digitMatchesSize = Pair.fnToKey(
  (digit, area) => digit === EMPTY || digit === area, shape);
const digitsInMatchingPiece = cells.map(cell => new Pair(
  digitMatchesSize, 'entered digit equals its polyomino size',
  cell, size.at(cell)));

return [
  shape,
  size.toVar('polyomino size'),
  parent.toVar('parent pointer'),
  subtree.toVar('subtree size'),
  rootRow.toVar('root row'),
  rootCol.toVar('root column'),
  depth.toVar('depth from root'),
  digitDomain,
  ...GIVENS.map(([row, col, digit]) => new Given(makeCellId(row, col), digit)),
  ...oneEach,
  sizeDomain,
  ...counterDomains,
  ...rootDomains,
  ...parentChoice,
  ...subtreeSums,
  ...pieceEdges,
  ...digitsInMatchingPiece,
];
