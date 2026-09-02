// Title: FillominAngel
// Author: Scott Strosahl
// Video: https://www.youtube.com/watch?v=QMe-6fKgFdc
// Source: https://cracking-the-cryptic.web.app/sudoku/jL6nGj2Dr2

// FillominAngel, 12x12. There is no Sudoku layer, so the grid is Raw: rows,
// columns and boxes carry no rule and values repeat freely.
//
// Rules encoded:
//  * Divide the grid, along its lines, into regions. Regions of the same size
//    cannot share an edge, and each given digit must be in a region of that
//    size. Regions may have no given digits in them, or more than one.
//    Label every cell with the area of its own region; those clauses then say
//    exactly one thing about that labelling: the orthogonally connected run of
//    equal labels containing a cell has that many cells. (Two equal-area
//    regions sharing an edge would merge into one longer run, which is what the
//    same-size adjacency ban rules out; an unclued or multiply-clued region
//    needs nothing extra, since the label is carried by every cell either way.)
//  * The 42 given numbers, 39 printed in cells and 3 drawn as two-digit circles.
//
// Omitted: regions of area 17 or more. A cell's label has to name its own
// region's area, and the value alphabet stops at 16, so such a region cannot be
// written down. Areas 1..16 are encoded exactly.

const MAX_AREA = 16;   // the whole value alphabet; also the largest area encoded
const ROWS = 12;
const COLS = 12;

const shape = new Shape('12x12', '1-' + MAX_AREA, 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

// Each region is modelled as a rooted tree over its own cells. Five overlays
// carry it, all of them bookkeeping rather than puzzle content:
//   parent  - ROOT, or the direction of the cell one step nearer the root;
//   subtree - how many cells hang below this one, itself included;
//   rootRow
//   rootCol - which cell is the root of this cell's region;
//   depth   - steps from the root, counting the root as 1.
// Four facts then say "the connected run of equal values has that many cells":
// a root's subtree is its whole region and equals the value written there; a
// non-root hangs off a neighbour holding the same value; two neighbours holding
// the same value must name the same root, so two equal-area regions cannot end
// up sharing an edge; and depth strictly decreases towards a root, so the
// pointers cannot cycle and every cell reaches its root.
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

// Reads [value(a), value(b), label(a), label(b)] for one orthogonal edge:
// neighbours holding the same value are in the same region and so must name
// the same root. Used once for the root's row and once for its column.
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

// Reads [value(a), value(b), depth(a), depth(b)]: within a region no step may
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

const regionEdges = edges.flatMap(({ cell, other }) => [
  new NFA(rootEdgeSpec, 'same region root row',
    cell, other, rootRow.at(cell), rootRow.at(other)),
  new NFA(rootEdgeSpec, 'same region root column',
    cell, other, rootCol.at(cell), rootCol.at(other)),
  new NFA(depthEdgeSpec, 'depth changes by one',
    cell, other, depth.at(cell), depth.at(other)),
]);

// Reads [value(cell), value(other), depth(cell), depth(other)] and rejects the
// case where `other` could have served as the parent. Placed on the earlier
// directions of each branch, it makes the parent the first eligible neighbour
// in DIRS order, so the tree is fixed by the region rather than chosen.
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
      new SameValues(2, subtree.at(cell), cell),
    ]),
    ...neighbours.map(({ dir, other }, k) => new And([
      new Given(parent.at(cell), dir.code),
      new SameValues(2, cell, other),
      new SameValues(2, rootRow.at(cell), rootRow.at(other)),
      new SameValues(2, rootCol.at(cell), rootCol.at(other)),
      new Pair(depthStep, 'one step nearer the root',
        depth.at(cell), depth.at(other)),
      ...neighbours.slice(0, k).map(earlier => new NFA(
        notParentSpec, 'earlier neighbour is not a parent',
        cell, earlier.other, depth.at(cell), depth.at(earlier.other))),
    ])),
  ]);
});

// Which cell of a region carries the root is this model's choice, not the
// puzzle's, so it is pinned to the region's first cell in reading order: a
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

// A root's row and column name a cell on the board, so they stop at 12 even
// though the alphabet runs to 16.
const boardRows = Array.from({ length: ROWS }, (_, i) => i + 1);
const boardCols = Array.from({ length: COLS }, (_, i) => i + 1);
const rootDomains = [
  rootRow.makeReplicate(new Given(rootRow.cells()[0], ...boardRows)),
  rootCol.makeReplicate(new Given(rootCol.cells()[0], ...boardCols)),
  ...cells.map(cell => {
    const { row, col } = parseCellId(cell);
    return new Pair(rootOrderKey(row, col), 'root comes first in reading order',
      rootRow.at(cell), rootCol.at(cell));
  }),
];

// Transcribed from the numbers printed in the grid: [row, col, area]. The last
// three are the ones drawn as white two-digit circles rather than cell values
// (R5C2 = 11, R11C3 = 10, R12C4 = 10); a cell value cannot hold two digits.
const GIVENS = [
  [2, 6, 2], [2, 7, 3],
  [3, 5, 2], [3, 8, 3],
  [4, 2, 5], [4, 6, 2], [4, 7, 1], [4, 11, 3],
  [5, 3, 7], [5, 10, 4], [5, 11, 9],
  [6, 2, 2], [6, 4, 2], [6, 6, 3], [6, 7, 7], [6, 9, 2], [6, 11, 3],
  [7, 2, 1], [7, 4, 1], [7, 5, 2], [7, 8, 3], [7, 9, 1], [7, 11, 4],
  [8, 2, 6], [8, 3, 2], [8, 5, 3], [8, 8, 2], [8, 10, 4], [8, 11, 7],
  [9, 2, 2], [9, 5, 4], [9, 8, 3], [9, 11, 6],
  [10, 5, 5], [10, 8, 4],
  [11, 5, 4], [11, 8, 2], [11, 10, 4],
  [12, 9, 6],
  [5, 2, 11], [11, 3, 10], [12, 4, 10],
];

return [
  shape,
  parent.toVar('parent pointer'),
  subtree.toVar('subtree size'),
  rootRow.toVar('root row'),
  rootCol.toVar('root column'),
  depth.toVar('depth from root'),
  ...GIVENS.map(([row, col, area]) => new Given(makeCellId(row, col), area)),
  ...rootDomains,
  ...parentChoice,
  ...subtreeSums,
  ...regionEdges,
];
