// Title: Cave Fillomino
// Author: Jesper Josefsson
// Video: https://www.youtube.com/watch?v=UoCckyR8fFA
// Source: https://tinyurl.com/y4uxa62s

// 10x10 grid. No Sudoku layer: the grid is Raw, so rows, columns and boxes
// carry no rule and values repeat freely.
//
// Rules encoded:
//  * Standard Fillomino. Divide the grid into orthogonally connected regions;
//    a cell's value is the size of the region it belongs to; no two regions
//    of equal size share an edge. Those two clauses collapse to one
//    statement about the filled grid: the orthogonally connected run of
//    equal values containing a cell has exactly that many cells.
//  * Cave (hybrid): some cells are shaded gray ("walls"); every wall cell is
//    orthogonally connected to the grid's edge through other wall cells
//    (several separate wall regions are allowed, each reaching the edge);
//    all remaining cells together form exactly one orthogonally connected
//    area (the "cave").
//  * Every circled cell is inside the cave, and its own digit equals the
//    number of cave cells visible from it by an orthogonal line of sight
//    (the cell itself included), where wall cells block the view.
//  * The top-right cell (R1C10) is a wall from the start.
//  * The 18 given numbers.
//
// Omitted:
//  * Polyominoes of area 17 or more. A Fillomino value has to name its own
//    region's area, and the value alphabet stops at CellGeometry.MAX_SIZE =
//    16, so a region that size or larger cannot be written down. Areas
//    1..16 are encoded exactly.
//  * "Within one orthogonally-connected group of wall cells, no digit
//    repeats." No practical ISS construction is known for a per-component
//    AllDifferent over an unanchored, unbounded-count partition. Every other
//    clause is encoded.

const MAX_AREA = 16;
const SIDE = 10;
const WALL = 1;
const CAVE = 2;

const shape = new Shape(`${SIDE}x${SIDE}`, '1-' + MAX_AREA, 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

// --- Fillomino: a rooted tree per region -----------------------------------
// Each region is modelled as a rooted tree over its own cells, carried by
// five whole-grid overlays (bookkeeping, not puzzle content):
//   parent  - ROOT, or the direction of the cell one step nearer the root;
//   subtree - how many cells hang below this one, itself included;
//   rootRow
//   rootCol - which cell is the root of this cell's region;
//   depth   - steps from the root, counting the root as 1.
// A root's subtree is its whole region and equals the value written there; a
// non-root hangs off a neighbour holding the same value; two neighbours
// holding the same value must name the same root, so two equal-area regions
// cannot end up sharing an edge; and subtree counts strictly grow towards a
// root, so the pointers cannot cycle and every cell reaches its root.
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
// child of this cell. The state carries only how much of the cell's own
// subtree count is still unaccounted for, so it never climbs past MAX_AREA-1.
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

// Reads [value(cell), value(other), depth(cell), depth(other)] and rejects
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

// A root's row and column name a cell on the board, so they stop at SIDE even
// though the alphabet runs to MAX_AREA.
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

// --- Cave / walls ------------------------------------------------------
// Rule: every wall cell reaches the grid's edge through other wall cells
// (several separate wall regions are allowed); all non-wall cells together
// form exactly one connected area. Widen the shading layer by one cell on
// every side and pin that ring to WALL, so ConnectedValues(WALL) reads as
// "every wall region touches the ring" (several allowed, merged into one
// component through the ring itself) rather than forcing one single wall
// mass. The cave then just needs a plain ConnectedValues(CAVE) on the same
// layer, since the rule wants exactly one connected cave and the ring never
// holds CAVE.
// Validated on a small 4x4 fixture: a wall not touching the border is
// rejected, two separate border-touching wall regions are accepted, and a
// wall barrier that splits the cave into two islands is rejected.
const shadeLayer = cellGraph(`${SIDE + 2}x${SIDE + 2}`).makeOverlay('VG');
const shadeVar = shadeLayer.toVar('wall or cave');
const shadeAt = (cell) => {
  const { row, col } = parseCellId(cell);
  return shadeVar.cell(row + 1, col + 1);
};
const gridShadeCells = new Set(cells.map(shadeAt));
const ringShadeCells = shadeLayer.cells().filter(cell => !gridShadeCells.has(cell));

// Drawn: the grid's top-right cell (row 1, column SIDE) starts shaded as a
// wall.
const WALL_GIVEN_CELL = makeCellId(1, SIDE);

// Drawn: every large-circled cell is stated to be inside the cave.
const CIRCLES = [
  [1, 4], [2, 5], [3, 4], [4, 1], [4, 2], [4, 5],
  [5, 5], [5, 6], [6, 3], [6, 8], [7, 1], [10, 10],
];

const shading = [
  shadeVar,
  shadeLayer.makeReplicate(new Given(shadeVar.cell(1), WALL, CAVE)),
  ...ringShadeCells.map(cell => new Given(cell, WALL)),
  new Given(shadeAt(WALL_GIVEN_CELL), WALL),
  ...CIRCLES.map(([row, col]) => new Given(shadeAt(makeCellId(row, col)), CAVE)),
  new ConnectedValues('VG', WALL),
  new ConnectedValues('VG', CAVE),
];

// --- Cave visibility ---------------------------------------------------
// A circled cell's own digit is the number of cave cells visible from it by
// an orthogonal ray, itself included, stopped by the first wall or the grid
// edge. Four directional "run length" overlays carry this per cell, along
// the recurrence (validated on a 10-case accept/reject fixture):
//   run(c) = 1                    if c is a wall (dummy, never read further)
//   run(c) = 1                    if c is cave and the next cell that way is
//                                  a wall, or c is the last cell before the
//                                  grid edge
//   run(c) = 1 + run(next cell)   if c is cave and the next cell that way is
//                                  also cave
// A circled cell's digit then equals the sum of its four runs minus 3 (the
// cell itself is counted once in each of the four directions).
// Each overlay only needs to be built out to the farthest circled cell in
// its row/column, not the whole grid, to stay inside the search-cell budget.
const runSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    // Reject an out-of-{WALL,CAVE} shade value immediately -- otherwise the
    // compiler carries all 16 grid values through myShade/neighShade and
    // blows the 4096-state limit (myShade x neighShade x neighRun).
    if (state.phase === 0) {
      return (value === WALL || value === CAVE) ? { phase: 1, myShade: value } : undefined;
    }
    if (state.phase === 1) {
      return (value === WALL || value === CAVE)
        ? { phase: 2, myShade: state.myShade, neighShade: value } : undefined;
    }
    if (state.phase === 2) {
      return {
        phase: 3, myShade: state.myShade, neighShade: state.neighShade,
        neighRun: value,
      };
    }
    if (state.phase === 3) {
      const expected = (state.myShade === CAVE && state.neighShade === CAVE)
        ? 1 + state.neighRun : 1;
      return value === expected ? { phase: 4 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 4,
}, shape);

const rowRange = new Map();  // row -> { minCol, maxCol } over circled cells
const colRange = new Map();  // col -> { minRow, maxRow } over circled cells
for (const [row, col] of CIRCLES) {
  const r = rowRange.get(row) || { minCol: col, maxCol: col };
  r.minCol = Math.min(r.minCol, col);
  r.maxCol = Math.max(r.maxCol, col);
  rowRange.set(row, r);
  const c = colRange.get(col) || { minRow: row, maxRow: row };
  c.minRow = Math.min(c.minRow, row);
  c.maxRow = Math.max(c.maxRow, row);
  colRange.set(col, c);
}

// Builds one directional run-length overlay over exactly the cells needed:
// `neededCells` walked from the grid edge inward, `dRow`/`dCol` pointing from
// a cell to its "outward" (edge-ward) neighbour, `isBoundary` marking the
// edge cell in that direction.
const buildRun = (prefix, neededCells, dRow, dCol, isBoundary) => {
  const overlay = graph.makeOverlay(prefix, neededCells);
  const constraints = neededCells.map(cell => {
    if (isBoundary(cell)) return new Given(overlay.at(cell), 1);
    const neighbour = graph.step(cell, dRow, dCol);
    return new NFA(runSpec, 'visible run',
      shadeAt(cell), shadeAt(neighbour), overlay.at(neighbour), overlay.at(cell));
  });
  return { overlay, constraints };
};

const eastCells = [...rowRange.entries()].flatMap(([row, { minCol }]) =>
  Array.from({ length: SIDE - minCol + 1 }, (_, i) => makeCellId(row, minCol + i)));
const westCells = [...rowRange.entries()].flatMap(([row, { maxCol }]) =>
  Array.from({ length: maxCol }, (_, i) => makeCellId(row, i + 1)));
const northCells = [...colRange.entries()].flatMap(([col, { maxRow }]) =>
  Array.from({ length: maxRow }, (_, i) => makeCellId(i + 1, col)));
const southCells = [...colRange.entries()].flatMap(([col, { minRow }]) =>
  Array.from({ length: SIDE - minRow + 1 }, (_, i) => makeCellId(minRow + i, col)));

const runEast = buildRun('VRE', eastCells, 0, 1, cell => parseCellId(cell).col === SIDE);
const runWest = buildRun('VRW', westCells, 0, -1, cell => parseCellId(cell).col === 1);
const runNorth = buildRun('VRN', northCells, -1, 0, cell => parseCellId(cell).row === 1);
const runSouth = buildRun('VRS', southCells, 1, 0, cell => parseCellId(cell).row === SIDE);

// digit = runEast + runWest + runNorth + runSouth - 3 (verified sign/offset
// on a 4-case fixture).
const visibility = CIRCLES.map(([row, col]) => {
  const cell = makeCellId(row, col);
  return new Sum(3,
    [runEast.overlay.at(cell), 1], [runWest.overlay.at(cell), 1],
    [runNorth.overlay.at(cell), 1], [runSouth.overlay.at(cell), 1],
    [cell, -1]);
});

// --- Givens --------------------------------------------------------------
// Transcribed from the 18 numbers printed in the grid: [row, col, value].
const GIVENS = [
  [1, 4, 6], [1, 6, 1], [1, 8, 10],
  [2, 1, 3], [2, 2, 1], [2, 5, 2],
  [4, 4, 1], [4, 6, 2],
  [5, 5, 3], [5, 6, 3],
  [6, 4, 2], [6, 6, 1], [6, 9, 6],
  [7, 1, 2],
  [9, 1, 3],
  [10, 2, 11], [10, 4, 8], [10, 10, 12],
];

return [
  shape,
  parent.toVar('parent pointer'),
  subtree.toVar('subtree size'),
  rootRow.toVar('root row'),
  rootCol.toVar('root column'),
  depth.toVar('depth from root'),
  runEast.overlay.toVar('cave run east'),
  runWest.overlay.toVar('cave run west'),
  runNorth.overlay.toVar('cave run north'),
  runSouth.overlay.toVar('cave run south'),
  ...GIVENS.map(([row, col, value]) => new Given(makeCellId(row, col), value)),
  ...rootDomains,
  ...parentChoice,
  ...subtreeSums,
  ...regionEdges,
  ...shading,
  ...runEast.constraints,
  ...runWest.constraints,
  ...runNorth.constraints,
  ...runSouth.constraints,
  ...visibility,
];
