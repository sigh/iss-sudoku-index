// Title: Lexicon [Look-and-Say Fillomino]
// Author: MicroStudy
// Video: https://www.youtube.com/watch?v=Wc-_DSOKkwo
// Source: https://app.crackingthecryptic.com/sudoku/j26Rt4938N

// 10x10, no givens, no Sudoku layer: Fillomino numbers repeat freely, so the
// grid is Raw. The digit entry for this puzzle only goes up to 8, so a
// region can hold at most 8 cells.
//
// Rules encoded:
//  * Fillomino: divide the grid into regions of orthogonally-connected cells
//    such that no two regions of the same size share an edge; enter a number
//    into each cell equal to its region's size.
//    Equivalent and used here: every maximal orthogonally-connected group of
//    cells sharing one value is a region, and the shared value must equal
//    the group's cell count. (Proof: in any valid Fillomino grid, a region
//    R's cells all carry |R|, so R is a subset of some maximal equal-value
//    group G; G cannot extend past R, since a cell outside R adjacent to R
//    lies in some other region R' with value |R'| = |R| -- exactly the
//    forbidden "two same-size regions touch". So G = R. Conversely, if every
//    maximal equal-value group's size equals its value, two adjacent
//    equal-size groups would already be one group by maximality, so no two
//    same-size regions ever touch.) This needs no separate region-partition
//    variable beyond the identity machinery below: the board digits
//    themselves carry the partition once the identity is pinned down.
//  * Look-and-Say cages: repeats allowed inside a cage; the printed clue,
//    read as (count, value) digit pairs, gives the count of specific values
//    among the cage's cells (unnamed values are unrestricted, and a count of
//    zero forbids that value) -- exactly `LookAndSay`'s built-in semantics.
//
// Nothing is omitted.

const ROWS = 10;
const COLS = 10;
const MAX_AREA = 8; // largest region size the alphabet admits.

// Shape range must cover every layer's domain: the board's region-size digit
// (1-8), and the identity layers' row/column indices (1-10) and root
// distance (0-7). 0-10 (11 values) covers all three; Raw carries no rule of
// its own, so nothing but the restrictions below fixes each layer's range.
const shape = new Shape('10x10', '0-10', 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

// Region identity, per cell:
//   rootRow, rootCol - the (row, column) of the cell's region's root, defined
//                       as the region's first cell in reading order;
//   depth            - the cell's distance from its root (0 at the root).
// A region's shared digit equals its root's digit exactly when every member
// names the root and the root's digit counts them; the edge rule below then
// makes "same digit" and "same root" coincide, so a maximal equal-digit group
// is exactly the named region (the equivalence above).
const rootRow = graph.makeOverlay('VR');
const rootCol = graph.makeOverlay('VC');
const depth = graph.makeOverlay('VD');

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
const restrict = (overlay, values) =>
  overlay.makeReplicate(new Given(overlay.cells()[0], ...values));
const domains = [
  graph.makeReplicate(new Given(cells[0], ...range(1, MAX_AREA))),
  restrict(rootRow, range(1, ROWS)),
  restrict(rootCol, range(1, COLS)),
  restrict(depth, range(0, MAX_AREA - 1)),
];

// Reads [rootRow, rootCol, depth] of one cell. The named root must not come
// after the cell in reading order, and the cell is at depth 0 exactly when it
// is its own root.
const rootSpecs = new Map();
const rootSpec = (row, col) => {
  const key = row + '_' + col;
  if (!rootSpecs.has(key)) {
    rootSpecs.set(key, NFA.encodeSpec({
      startState: { phase: 0 },
      transition: (state, value) => {
        if (state.phase === 0) {
          return value <= row ? { phase: 1, rowEq: value === row } : undefined;
        }
        if (state.phase === 1) {
          if (state.rowEq && value > col) return undefined;
          return { phase: 2, self: state.rowEq && value === col };
        }
        if (state.phase === 2) {
          return (value === 0) === state.self ? { phase: 3 } : undefined;
        }
        return undefined;
      },
      accept: state => state.phase === 3,
    }, shape));
  }
  return rootSpecs.get(key);
};

const roots = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new NFA(rootSpec(row, col), 'root is first in reading order',
    rootRow.at(cell), rootCol.at(cell), depth.at(cell));
});

// Every cell other than a root has an orthogonal neighbour in its own region
// exactly one step nearer the root. This forces the named root to lie inside
// a connected group reaching the cell, and makes depth the true distance.
const stepDown = Pair.fnToKey((mine, other) => other === mine - 1, shape);
const descents = cells.map(cell => new Or([
  new Given(depth.at(cell), 0),
  ...graph.neighbours(cell).map(other => new And([
    new SameValues(2, rootRow.at(cell), rootRow.at(other)),
    new SameValues(2, rootCol.at(cell), rootCol.at(other)),
    new Pair(stepDown, 'one step nearer the root', depth.at(cell), depth.at(other)),
  ])),
]));

// Reads [depth(cell), digit(cell), then rootRow and rootCol of this cell and
// of every cell after it in reading order]. A root (depth 0) must be named by
// exactly its digit's worth of cells, counted from itself onward (only cells
// at or after a root in reading order can belong to it); a non-root must be
// named by nobody.
const sizeSpecs = new Map();
const sizeSpec = (row, col) => {
  const key = row + '_' + col;
  if (!sizeSpecs.has(key)) {
    sizeSpecs.set(key, NFA.encodeSpec({
      startState: { phase: 'depth' },
      transition: (state, value) => {
        if (state.phase === 'depth') {
          return { phase: 'digit', isRoot: value === 0 };
        }
        if (state.phase === 'digit') {
          // Own (rootRow, rootCol) pair is the first "later" entry; a root
          // counts it (value is the region size to match), a non-root skips
          // it (2 values) then requires zero matches.
          return state.isRoot
            ? { phase: 'row', rem: value }
            : { phase: 'skip', left: 2 };
        }
        if (state.phase === 'skip') {
          return state.left > 1
            ? { phase: 'skip', left: state.left - 1 }
            : { phase: 'row', rem: 0 };
        }
        if (state.phase === 'row') {
          return { phase: 'col', rem: state.rem, rowEq: value === row };
        }
        if (state.rowEq && value === col) {
          return state.rem > 0 ? { phase: 'row', rem: state.rem - 1 } : undefined;
        }
        return { phase: 'row', rem: state.rem };
      },
      accept: state => state.phase === 'row' && state.rem === 0,
    }, shape));
  }
  return sizeSpecs.get(key);
};

const sizes = cells.map((cell, i) => {
  const { row, col } = parseCellId(cell);
  const later = cells.slice(i);
  return new NFA(sizeSpec(row, col), 'region size equals its digit',
    depth.at(cell), cell,
    ...later.flatMap(other => [rootRow.at(other), rootCol.at(other)]));
});

// Reads [digit(a), digit(b), rootRow(a), rootRow(b), rootCol(a), rootCol(b)]
// for one orthogonal edge: the two digits are equal exactly when the two
// cells share a root. Combined with the roots/descents machinery, this is
// what turns "no two same-size regions touch" into a local rule and rules out
// a maximal equal-digit group extending past its named region.
const numberEdgeSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, mine: value };
    if (state.phase === 1) return { phase: 2, sameNumber: value === state.mine };
    if (state.phase === 2) return { phase: 3, sameNumber: state.sameNumber, mine: value };
    if (state.phase === 3) {
      return { phase: 4, sameNumber: state.sameNumber, same: value === state.mine };
    }
    if (state.phase === 4) {
      return { phase: 5, sameNumber: state.sameNumber, same: state.same, mine: value };
    }
    if (state.phase === 5) {
      const sameRegion = state.same && value === state.mine;
      return sameRegion === state.sameNumber ? { phase: 6 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 6,
}, shape);

const edges = cells.flatMap(cell => [[1, 0], [0, 1]].flatMap(([dRow, dCol]) => {
  const other = graph.step(cell, dRow, dCol);
  return other ? [[cell, other]] : [];
}));

const edgeRules = edges.map(([a, b]) => new NFA(
  numberEdgeSpec, 'equal digits exactly within a region',
  a, b, rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b)));

// Transcribed from the 19 drawn cages. Each clue is a look-and-say
// (count, value) digit-pair string.
const CAGES = [
  [51, [[2, 2], [2, 3], [2, 4], [3, 2], [3, 3], [3, 4], [4, 2], [4, 3], [4, 4]]],
  [13, [[1, 1], [1, 2], [2, 1]]],
  [23, [[3, 1], [4, 1], [5, 1]]],
  [33, [[5, 2], [5, 3], [6, 1], [6, 2]]],
  [32, [[5, 4], [5, 5], [6, 3], [6, 4]]],
  [22, [[3, 5], [3, 6], [3, 7], [4, 5]]],
  [12, [[1, 4], [1, 5], [2, 5]]],
  [45, [[1, 6], [1, 7], [2, 7], [2, 8], [3, 8]]],
  [34, [[1, 9], [2, 9], [3, 9], [3, 10]]],
  [13, [[4, 9], [4, 10], [5, 9]]],
  [13, [[5, 10], [6, 10]]],
  [21, [[7, 9], [8, 8], [8, 9], [8, 10]]],
  [13161718, [[6, 6], [6, 7], [7, 6], [7, 7]]],
  [12, [[8, 1], [9, 1], [10, 1], [10, 2], [10, 3]]],
  [13, [[8, 2], [8, 3], [9, 3]]],
  [23, [[9, 4], [9, 5], [10, 4]]],
  [27, [[7, 4], [8, 4], [8, 5]]],
  [23, [[9, 6], [9, 7], [9, 8], [9, 9]]],
  [1305, [[4, 6], [4, 7], [4, 8], [5, 8]]],
];
const cageRules = CAGES.map(([clue, coords]) =>
  new LookAndSay(clue, ...coords.map(([row, col]) => makeCellId(row, col))));

return [
  shape,
  rootRow.toVar('root row'),
  rootCol.toVar('root column'),
  depth.toVar('distance to root'),
  ...domains,
  ...roots,
  ...descents,
  ...sizes,
  ...edgeRules,
  ...cageRules,
];
