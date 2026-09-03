// Title: Killer Sudomino
// Author: AnalyticalNinja
// Video: https://www.youtube.com/watch?v=UyvzaLg1NM4
// Source: https://app.crackingthecryptic.com/sudoku/mGtft8fRN9

// Normal sudoku on a 9x9 with no given digits. The grid is also divided into
// coloured regions, none of which is drawn, and the rules encoded here are:
//  * Every cell lies in exactly one region, and a region is one orthogonally
//    connected group of cells.
//  * Two orthogonally adjacent regions never hold the same number of cells.
//  * Digits do not repeat inside a region. With nine symbols that also caps a
//    region at nine cells.
//  * A digit equal to the size of its own region cannot be placed in it.
//  * A cage clue is two things at once: the sum of the digits in the cage, and
//    the combined cell count of all regions that overlap the cage. Digits do not
//    repeat in a cage.
//  * A diagonal clue is likewise both the sum of the digits along the diagonal
//    and the combined cell count of all regions those cells lie in.
//
// Nothing is omitted.
//
// The first two region clauses together say exactly one thing about a per-cell
// region-size value: the orthogonally connected run of equal sizes containing a
// cell has that many cells. That is the Fillomino condition, on a size overlay
// rather than on the printed digits.

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const geometry = cellGeometry(shape);
const cells = graph.cells();

// Cage totals and cells, transcribed from the drawn cages, ordered by their
// top-left cell.
const CAGES = [
  [8, 'R1C2', 'R2C1', 'R2C2'],
  [11, 'R1C6', 'R1C7'],
  [8, 'R1C9', 'R2C9'],
  [13, 'R2C6', 'R2C7'],
  [11, 'R3C3', 'R3C4', 'R4C4'],
  [12, 'R3C6', 'R3C7'],
  [8, 'R4C1', 'R4C2'],
  [19, 'R5C1', 'R5C2', 'R6C1', 'R6C2'],
  [23, 'R5C8', 'R5C9', 'R6C8'],
  [8, 'R6C4', 'R6C5', 'R6C6'],
  [6, 'R7C3', 'R8C3', 'R9C3'],
  [23, 'R7C4', 'R8C4', 'R9C4'],
  [9, 'R8C7', 'R8C8'],
];

// The two outside arrows, transcribed from the drawn clue: one on the top frame
// at the C6/C7 border aimed down-right, one on the right frame at the R6/R7
// border aimed down-left. Each starts in the cell it points into and runs to
// the grid edge.
const DIAGONALS = [
  [8, graph.ray('R1C7', 1, 1)],
  [8, graph.ray('R7C9', 1, -1)],
];

// Five overlays carry the region layout. All of it is bookkeeping: the puzzle
// never draws a region, a root or a pointer.
//   size    - how many cells the region holds; constant across the region.
//   parent  - ROOT, or the direction of the cell one step nearer the root.
//   depth   - steps from the root, the root counting as 1.
//   rootRow
//   rootCol - which cell is the root of this cell's region.
const size = graph.makeOverlay('VG');
const parent = graph.makeOverlay('VP');
const depth = graph.makeOverlay('VD');
const rootRow = graph.makeOverlay('VR');
const rootCol = graph.makeOverlay('VK');

// Three more overlays carry the digits collected below each cell. The digits of
// a region are all different, so the region's digits form a *set*, and a set of
// 1-9 splits into three three-bit bands that each fit one 9-valued Var cell. A
// cell holds the set of digits in its own subtree, stored as bitmask + 1.
const BANDS = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
const MAX_SET = 8;             // bitmask 0-7 stored as 1-8
const bands = [
  graph.makeOverlay('VA'),     // digits 1-3
  graph.makeOverlay('VB'),     // digits 4-6
  graph.makeOverlay('VE'),     // digits 7-9
];
const bandCells = cell => bands.map(band => band.at(cell));
const popCount = mask => (mask & 1) + ((mask >> 1) & 1) + ((mask >> 2) & 1);

const ROOT = 1;
const DIRS = [
  // `back` is the pointer value a neighbour in this direction uses to point
  // back at the cell we started from.
  { code: 2, back: 3, dRow: -1, dCol: 0 },
  { code: 3, back: 2, dRow: 1, dCol: 0 },
  { code: 4, back: 5, dRow: 0, dCol: -1 },
  { code: 5, back: 4, dRow: 0, dCol: 1 },
];
const neighboursOf = cell => DIRS
  .map(dir => ({ dir, other: graph.step(cell, dir.dRow, dir.dCol) }))
  .filter(entry => entry.other);

// Reads [set(cell), digit(cell), then parent(n), set(n) for each neighbour n in
// a fixed order], for one band of three digits. `expected[i]` is the pointer
// value that makes neighbour i a child of this cell. The state carries the part
// of the cell's own set still to be accounted for: the cell's own digit if it
// falls in this band, then each child's set, each of which must still be
// available. Consuming every child's set disjointly is what makes the digits of
// a region all different; ending empty is what makes the set exactly the union.
const bandSpecs = new Map();
const bandSpec = (b, expected) => {
  const key = b + ':' + expected.join('_');
  if (!bandSpecs.has(key)) {
    bandSpecs.set(key, NFA.encodeSpec({
      startState: { i: -2, rem: 0, child: null },
      transition: (state, value) => {
        if (state.i === -2) {
          return value <= MAX_SET
            ? { i: -1, rem: value - 1, child: null } : undefined;
        }
        if (state.i === -1) {
          const at = BANDS[b].indexOf(value);
          if (at < 0) return { i: 0, rem: state.rem, child: null };
          const bit = 1 << at;
          return (state.rem & bit)
            ? { i: 0, rem: state.rem ^ bit, child: null } : undefined;
        }
        if (state.i >= expected.length) return undefined;
        if (state.child === null) {
          return { i: state.i, rem: state.rem, child: value === expected[state.i] };
        }
        if (!state.child) return { i: state.i + 1, rem: state.rem, child: null };
        if (value > MAX_SET) return undefined;
        const mask = value - 1;
        return (state.rem & mask) === mask
          ? { i: state.i + 1, rem: state.rem ^ mask, child: null } : undefined;
      },
      accept: state => state.i === expected.length && state.rem === 0,
    }, shape));
  }
  return bandSpecs.get(key);
};

const subtreeSets = cells.flatMap(cell => {
  const neighbours = neighboursOf(cell);
  const expected = neighbours.map(entry => entry.dir.back);
  return bands.map((band, b) => new NFA(
    bandSpec(b, expected), 'subtree digit set',
    band.at(cell), cell,
    ...neighbours.flatMap(({ other }) => [parent.at(other), band.at(other)])));
});

// Reads [size(a), size(b), label(a), label(b)] for one orthogonal edge:
// neighbours whose regions hold the same number of cells are in the same region
// and so must name the same root. Used once for the root's row and once for its
// column. This is the clause "no two adjacent regions have the same size":
// adjacent cells agreeing on the size cannot be in different regions.
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

// Reads [size(a), size(b), depth(a), depth(b)]: within a region no step may
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
    return other ? [{ cell, other, dir }] : [];
  }));

const regionEdges = edges.flatMap(({ cell, other }) => [
  new NFA(rootEdgeSpec, 'same region root row',
    size.at(cell), size.at(other), rootRow.at(cell), rootRow.at(other)),
  new NFA(rootEdgeSpec, 'same region root column',
    size.at(cell), size.at(other), rootCol.at(cell), rootCol.at(other)),
  new NFA(depthEdgeSpec, 'depth changes by one',
    size.at(cell), size.at(other), depth.at(cell), depth.at(other)),
]);

// Reads [size(cell), size(other), depth(cell), depth(other)] and rejects the
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

// Reads [size(root), then the root's three band sets]. The root's subtree is the
// whole region, so the number of digits collected there is the number of cells
// in the region: this is the clause "a region's size is its own cell count".
const rootSizeSpec = NFA.encodeSpec({
  startState: { i: -1, want: 0 },
  transition: (state, value) => {
    if (state.i === -1) return { i: 0, want: value };
    if (state.i >= bands.length || value > MAX_SET) return undefined;
    const want = state.want - popCount(value - 1);
    return want < 0 ? undefined : { i: state.i + 1, want };
  },
  accept: state => state.i === bands.length && state.want === 0,
}, shape);

const parentChoice = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  const neighbours = neighboursOf(cell);
  return new Or([
    new And([
      new Given(parent.at(cell), ROOT),
      new Given(depth.at(cell), 1),
      new Given(rootRow.at(cell), row),
      new Given(rootCol.at(cell), col),
      new NFA(rootSizeSpec, 'region size is its cell count',
        size.at(cell), ...bandCells(cell)),
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

// Which cell of a region carries the root is this model's choice, not the
// puzzle's, so it is pinned: every region is rooted at its first cell in
// reading order. Read against (rootRow, rootCol) of each cell, this says the
// named root is at or before that cell, and the only cell of a region that can
// satisfy it for every member is the region's own first cell.
const rootOrderKeys = new Map();
const rootOrderKey = (row, col) => {
  const key = row + '_' + col;
  if (!rootOrderKeys.has(key)) {
    rootOrderKeys.set(key, Pair.fnToKey(
      (r, c) => r < row || (r === row && c <= col), shape));
  }
  return rootOrderKeys.get(key);
};

const rootOrder = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new Pair(rootOrderKey(row, col), 'root comes first in reading order',
    rootRow.at(cell), rootCol.at(cell));
});

// "Numbers that match a coloured region's size cannot be placed into the cells
// in that region": the digit and its own region's cell count differ.
const sizeExclusions = cells.map(
  cell => new AllDifferent(cell, size.at(cell)));

// Reads [rootRow(a), rootRow(b), rootCol(a), rootCol(b)] and accepts only when
// the two cells name different roots, i.e. lie in different regions.
const differentRootSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, mine: value };
    if (state.phase === 1) return { phase: 2, sameRow: value === state.mine };
    if (state.phase === 2) return { phase: 3, sameRow: state.sameRow, col: value };
    if (state.phase === 3) {
      return (!state.sameRow || value !== state.col) ? { phase: 4 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 4,
}, shape);

// Every way of splitting a clue's cells into groups.
const setPartitions = (items) => {
  if (items.length === 0) return [[]];
  const [first, ...rest] = items;
  return setPartitions(rest).flatMap(partition => [
    [[first], ...partition],
    ...partition.map(
      (block, i) => partition.map((b, j) => (i === j ? [first, ...b] : b))),
  ]);
};

// A clue's region half counts each overlapping region once, however many of the
// clue's cells it holds, so it is a sum over the *distinct* regions the clue
// meets. Which of the clue's cells share a region is not local -- two cells of
// one cage can be joined by a path of region cells that leaves the cage -- so
// the rule is a disjunction over every way of grouping the clue's cells, each
// branch equating the root labels inside a group, separating the roots of
// different groups, and summing one region size per group. Exactly one grouping
// matches the layout the overlays hold, so the disjunction is the rule itself
// and not a relaxation. A cage of at most four cells gives at most 15 branches.
const regionCount = (clueCells, total) => new Or(
  setPartitions(clueCells).map(partition => new And([
    ...partition.flatMap(block => block.slice(1).flatMap(cell => [
      new SameValues(2, rootRow.at(block[0]), rootRow.at(cell)),
      new SameValues(2, rootCol.at(block[0]), rootCol.at(cell)),
    ])),
    ...partition.flatMap((block, i) => partition.slice(i + 1).map(
      other => new NFA(differentRootSpec, 'clue cells in different regions',
        rootRow.at(block[0]), rootRow.at(other[0]),
        rootCol.at(block[0]), rootCol.at(other[0])))),
    new Sum(total, ...partition.map(block => size.at(block[0]))),
  ])));

const parentValues = [ROOT, ...DIRS.map(dir => dir.code)];
const setValues = Array.from({ length: MAX_SET }, (_, i) => i + 1);
const domains = [
  parent.makeReplicate(new Given(parent.cells()[0], ...parentValues)),
  ...bands.map(band => band.makeReplicate(
    new Given(band.cells()[0], ...setValues))),
];

return [
  shape,
  size.toVar('region size'),
  parent.toVar('parent pointer'),
  depth.toVar('depth from root'),
  rootRow.toVar('root row'),
  rootCol.toVar('root column'),
  bands[0].toVar('subtree digits 1-3'),
  bands[1].toVar('subtree digits 4-6'),
  bands[2].toVar('subtree digits 7-9'),
  ...domains,
  ...rootOrder,
  ...parentChoice,
  ...subtreeSets,
  ...regionEdges,
  ...sizeExclusions,

  // Digit halves of the printed clues.
  ...CAGES.map(([total, ...cage]) => new Cage(total, ...cage)),
  ...DIAGONALS.map(([total, ray]) => LittleKiller.fromCells(total, ray, geometry)),

  // Region halves of the same clues.
  ...CAGES.map(([total, ...cage]) => regionCount(cage, total)),
  ...DIAGONALS.map(([total, ray]) => regionCount(ray, total)),
];
