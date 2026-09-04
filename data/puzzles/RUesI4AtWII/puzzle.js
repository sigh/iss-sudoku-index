// Title: Foggy Fillomino
// Author: Die Hard
// Video: https://www.youtube.com/watch?v=RUesI4AtWII
// Source: https://sudokupad.app/330kjo10ui

// Fillomino: divide the 9x9 grid along grid lines into non-overlapping regions
// of orthogonally-connected cells such that no two regions of the same size
// are orthogonally adjacent, and fill every cell of a region with that
// region's own cell count. The board's digit therefore already IS the region
// size, and only digits 1-9 are used, so no region exceeds 9 cells.
// The grid carries no other row/column/box rule -- a region's size repeats
// freely across a row or a column -- except one extra restriction: digit N
// may not appear anywhere in row N or in column N.
// Nine diagonals are marked by a short border arrow (a Little-Killer-style
// ray running from the arrow to the far edge of the board); digits on a
// marked diagonal cannot repeat, and where a total is printed they must sum
// to it.
// The fog covering the grid is a UI reveal mechanic, not a rule, and is not
// encoded.

const shape = new Shape('9x9', 9, 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

// --- Digit N banned from row N and column N -------------------------------

const rowColBans = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  const banned = new Set([row, col]);
  const allowed = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(v => !banned.has(v));
  return new Given(cell, ...allowed);
});

// Transcribed from the five printed givens.
const GIVENS = [
  ['R2C8', 5], ['R4C8', 2], ['R5C5', 4], ['R6C3', 4], ['R8C1', 7],
];
const givens = GIVENS.map(([cell, value]) => new Given(cell, value));

// --- Marked diagonals ------------------------------------------------------

// Transcribed from the payload's 9 arrows (direction + off-grid start point)
// paired with their nearest circled overlay text, each ray traced to the far
// board edge (a Little Killer-style convention, since no rules sentence gives
// another one). "?" means the diagonal is marked (no repeats) but carries no
// printed total.
const DIAGONALS = [
  { cells: ['R1C6', 'R2C7', 'R3C8', 'R4C9'], total: 12 },
  { cells: ['R1C8', 'R2C9'], total: null },
  { cells: ['R2C1', 'R1C2'], total: 15 },
  { cells: ['R6C1', 'R7C2', 'R8C3', 'R9C4'], total: 28 },
  { cells: ['R6C9', 'R7C8', 'R8C7', 'R9C6'], total: 27 },
  { cells: ['R8C9', 'R9C8'], total: null },
  { cells: ['R1C2', 'R2C3', 'R3C4', 'R4C5', 'R5C6', 'R6C7', 'R7C8', 'R8C9'], total: null },
  { cells: ['R6C1', 'R5C2', 'R4C3', 'R3C4', 'R2C5', 'R1C6'], total: 22 },
  { cells: ['R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9'], total: null },
];

const diagonalConstraints = DIAGONALS.flatMap(({ cells: diagCells, total }) => [
  new AllDifferent(...diagCells),
  ...(total !== null ? [new Sum(total, ...diagCells)] : []),
]);

// --- Region discovery --------------------------------------------------
//
// A parent-pointer tree per region, rooted at the region's first cell in
// reading order: this is the standard construction for "orthogonally
// connected run of equal sizes has that many cells" (a solver-discovered
// partition with no drawn border). Here the region's size IS the printed
// digit, so wherever this construction would normally read a separate "size"
// overlay, it instead reads the real board cell directly.
//
// Layers:
//   parent  - ROOT, or the direction of the cell one step nearer the root.
//   depth   - steps from the root, the root counting as 1.
//   rootRow
//   rootCol - which cell is the root of this cell's region.
//   subtreeCount - how many cells sit in this cell's own subtree (itself plus
//                  every descendant), used only to pin the root's count to the
//                  region's true size.
const parent = graph.makeOverlay('VP');
const depth = graph.makeOverlay('VD');
const rootRow = graph.makeOverlay('VR');
const rootCol = graph.makeOverlay('VK');
const subtreeCount = graph.makeOverlay('VS');

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

// Reads [subtreeCount(cell), parent(n1), subtreeCount(n1), parent(n2), ...]
// for the fixed neighbour order `expected` (each entry the pointer code that
// would make that neighbour a child of `cell`). `want` is how many more cells
// the still-unseen children must contribute, starting at
// subtreeCount(cell) - 1 for the cell itself; a non-child neighbour's count is
// read but ignored.
const subtreeSpecs = new Map();
const subtreeSpec = expected => {
  const key = expected.join('_');
  if (!subtreeSpecs.has(key)) {
    subtreeSpecs.set(key, NFA.encodeSpec({
      startState: { i: -1, want: 0, child: null },
      transition: (state, value) => {
        if (state.i === -1) return { i: 0, want: value - 1, child: null };
        if (state.i >= expected.length) return undefined;
        if (state.child === null) {
          return { i: state.i, want: state.want, child: value === expected[state.i] };
        }
        if (!state.child) return { i: state.i + 1, want: state.want, child: null };
        if (value > state.want) return undefined;
        return { i: state.i + 1, want: state.want - value, child: null };
      },
      accept: state => state.i === expected.length && state.want === 0,
    }, shape));
  }
  return subtreeSpecs.get(key);
};

const subtreeCounts = cells.map(cell => {
  const neighbours = neighboursOf(cell);
  const expected = neighbours.map(entry => entry.dir.back);
  return new NFA(
    subtreeSpec(expected), 'subtree cell count',
    subtreeCount.at(cell),
    ...neighbours.flatMap(({ other }) => [parent.at(other), subtreeCount.at(other)]));
});

// Reads [digit(a), digit(b), label(a), label(b)] for one orthogonal edge:
// neighbours with equal digits (= region sizes) must be the same region, i.e.
// must share a root -- the direct statement of "no two adjacent regions hold
// the same size". Used once for the root row and once for the root column.
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

// Reads [digit(a), digit(b), depth(a), depth(b)]: within a region no step may
// change the distance to the root by more than one, which is what makes
// `depth` the true distance rather than any descending chain.
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
    cell, other, rootRow.at(cell), rootRow.at(other)),
  new NFA(rootEdgeSpec, 'same region root column',
    cell, other, rootCol.at(cell), rootCol.at(other)),
  new NFA(depthEdgeSpec, 'depth changes by one',
    cell, other, depth.at(cell), depth.at(other)),
]);

// Reads [digit(cell), digit(other), depth(cell), depth(other)] and rejects
// the case where `other` could have served as the parent. Placed on the
// earlier directions of each branch, it makes the parent the first eligible
// neighbour in DIRS order, so the tree is fixed by the region rather than
// chosen.
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
      // Region size is its own cell count: the root's whole subtree is the
      // whole region.
      new SameValues(2, subtreeCount.at(cell), cell),
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
// puzzle's: every region is rooted at its own first cell in reading order (no
// clue anchors a region root the way a printed total would).
const rootOrderKeys = new Map();
const rootOrderKey = (row, col) => {
  const key = row + '_' + col;
  if (!rootOrderKeys.has(key)) {
    rootOrderKeys.set(key, Pair.fnToKey(
      (r, c) => r < row || (r === row && c <= col),
      shape));
  }
  return rootOrderKeys.get(key);
};

const rootOrder = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new Pair(rootOrderKey(row, col), 'root comes first in reading order',
    rootRow.at(cell), rootCol.at(cell));
});

const parentValues = [ROOT, ...DIRS.map(dir => dir.code)];
const domains = [
  parent.makeReplicate(new Given(parent.cells()[0], ...parentValues)),
];

return [
  shape,
  parent.toVar('parent pointer'),
  depth.toVar('depth from root'),
  rootRow.toVar('root row'),
  rootCol.toVar('root column'),
  subtreeCount.toVar('subtree cell count'),
  ...domains,
  ...rowColBans,
  ...givens,
  ...diagonalConstraints,
  ...rootOrder,
  ...parentChoice,
  ...subtreeCounts,
  ...regionEdges,
];
