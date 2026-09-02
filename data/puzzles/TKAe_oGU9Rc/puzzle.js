// Title: Unique Islands Of Nine
// Author: Scruffamudda
// Video: https://www.youtube.com/watch?v=TKAe_oGU9Rc
// Source: https://tinyurl.com/bdctjfbj

// 9x9 sudoku, standard boxes, no given digits.
//
// Rules encoded:
//  * Normal sudoku.
//  * Every cell is either an island cell or an ocean cell. An island is a
//    maximal orthogonally connected group of island cells, and the digits on
//    one island total 9 (repeats allowed).
//  * Two different islands may not share an edge or a corner, except at the
//    five drawn bridges; the two cells a bridge joins are island cells lying on
//    two different islands.
//  * The ocean is every remaining cell; it is a single orthogonally connected
//    region and never completely fills a 2x2 area.
//  * A circled cell's digit is the number of cells of its own region seen along
//    its row and column together, itself included, with cells of another region
//    blocking the view.
//
// Omitted:
//  * "Each island must contain a unique set of digits", i.e. no two islands
//    carry the same set of distinct digits. This is a pairwise-distinctness
//    predicate over an aggregate (the 9-bit digit-support mask) of every
//    solver-discovered component, with the component count itself a solver
//    choice. ConnectedValues asserts one region per value and so cannot label a
//    class that may go unused; the label-overlay lift needs the components
//    bounded by a fixed label count, and a mask carried up the same trees would
//    still need one comparison per ordered pair of the 81 possible roots.
//    Blocker #1462 (this puzzle) and #1065 record the gap. Every other clause
//    above is encoded.

const SIDE = 9;
const ISLAND = 1;
const OCEAN = 2;

// Value 10 is the "ocean cell" sentinel of the island bookkeeping overlays; the
// grid alphabet is widened to reach it and the board is pinned back to 1-9.
const SEA = 10;

const shape = new Shape(`${SIDE}x${SIDE}`, '1-10');
const graph = cellGraph(shape);
const cells = graph.cells();

// Drawn: the 12 white circles, each centred on one cell.
const CIRCLES = [
  [1, 1], [1, 2], [1, 9],
  [2, 4], [2, 5],
  [3, 5],
  [4, 3], [4, 7], [4, 8],
  [7, 3],
  [9, 5], [9, 9],
];

// Drawn: the 5 orange strokes, each crossing one lattice corner and joining the
// two diagonally opposite cells there.
const BRIDGES = [
  [[7, 1], [6, 2]],
  [[4, 5], [5, 6]],
  [[9, 5], [8, 6]],
  [[4, 3], [3, 4]],
  [[3, 6], [2, 7]],
];

// --- Overlays --------------------------------------------------------------
// shade   - ISLAND or OCEAN.
// parent  - ROOT, the direction of the cell one step nearer this island's root,
//           or SEA_PARENT on an ocean cell.
// subtree - the digits below this cell in its island's tree, itself included.
// rootRow
// rootCol - which cell roots this cell's island; SEA on an ocean cell.
// depth   - steps from the root, the root counting as 1; SEA on an ocean cell.
// The last five are bookkeeping, not puzzle content: they turn "the island
// containing this cell" into something local constraints can read. A root's
// subtree covers its whole island, so pinning it to 9 is the island total; two
// edge-sharing island cells must name the same root, which is what makes a
// named root stand for the whole maximal connected group; and depths grow by
// exactly one towards a leaf, so the pointers cannot cycle.
const ROOT = 1;
const SEA_PARENT = 6;
const DIRS = [
  // `back` is the pointer value a neighbour in this direction uses to point
  // back at the cell we started from.
  { code: 2, back: 3, dRow: -1, dCol: 0 },
  { code: 3, back: 2, dRow: 1, dCol: 0 },
  { code: 4, back: 5, dRow: 0, dCol: -1 },
  { code: 5, back: 4, dRow: 0, dCol: 1 },
];
const shade = graph.makeOverlay('VG');
const parent = graph.makeOverlay('VP');
const subtree = graph.makeOverlay('VS');
const rootRow = graph.makeOverlay('VR');
const rootCol = graph.makeOverlay('VC');
const depth = graph.makeOverlay('VD');

const neighboursOf = cell => DIRS
  .map(dir => ({ dir, other: graph.step(cell, dir.dRow, dir.dCol) }))
  .filter(entry => entry.other);

// --- Island totals ---------------------------------------------------------
// Reads [subtree(cell), digit(cell), then parent(n), subtree(n) for each
// neighbour n in a fixed order]. `expected[i]` is the pointer value that makes
// neighbour i a child of this cell. The state carries only how much of the
// cell's own subtree total is still unaccounted for, so it never climbs past 9.
// An ocean cell carries the SEA sentinel and takes no children.
const subtreeSpecs = new Map();
const subtreeSpec = expected => {
  const key = expected.join('_');
  if (!subtreeSpecs.has(key)) {
    subtreeSpecs.set(key, NFA.encodeSpec({
      startState: { phase: 'total' },
      transition: (state, value) => {
        if (state.phase === 'total') {
          return value === SEA
            ? { phase: 'digit', sea: true }
            : { phase: 'digit', sea: false, rem: value };
        }
        if (state.phase === 'digit') {
          if (value > SIDE) return undefined;          // board digits are 1-9
          if (state.sea) return { phase: 'ptr', sea: true, i: 0 };
          const rem = state.rem - value;
          return rem < 0
            ? undefined : { phase: 'ptr', sea: false, i: 0, rem };
        }
        if (state.phase === 'ptr') {
          if (state.i >= expected.length) return undefined;
          return {
            phase: 'sub', sea: state.sea, i: state.i, rem: state.rem,
            child: value === expected[state.i],
          };
        }
        if (state.phase === 'sub') {
          if (!state.child) {
            return {
              phase: 'ptr', sea: state.sea, i: state.i + 1, rem: state.rem,
            };
          }
          if (state.sea) return undefined;             // no child hangs off the ocean
          const rem = state.rem - value;
          return rem < 0
            ? undefined
            : { phase: 'ptr', sea: false, i: state.i + 1, rem };
        }
        return undefined;
      },
      accept: state => state.phase === 'ptr' && state.i === expected.length
        && (state.sea || state.rem === 0),
    }, shape));
  }
  return subtreeSpecs.get(key);
};

const subtreeSums = cells.map(cell => {
  const neighbours = neighboursOf(cell);
  return new NFA(
    subtreeSpec(neighbours.map(entry => entry.dir.back)),
    'subtree total',
    subtree.at(cell), cell,
    ...neighbours.flatMap(
      ({ other }) => [parent.at(other), subtree.at(other)]));
});

// --- Tree bookkeeping over one orthogonal edge ------------------------------
// Each spec reads [shade(a), shade(b), x(a), x(b)] and only bites when both
// cells are island cells, which is exactly when they lie on the same island.
const bothIslandPrefix = (state, value) => {
  if (state.phase === 0) return { phase: 1, aIsland: value === ISLAND };
  if (state.phase === 1) {
    return { phase: 2, both: state.aIsland && value === ISLAND };
  }
  return null;
};

const sameLabelSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    const pre = bothIslandPrefix(state, value);
    if (pre) return pre;
    if (state.phase === 2) return { phase: 3, both: state.both, label: value };
    if (state.phase === 3) {
      return (!state.both || value === state.label) ? { phase: 4 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 4,
}, shape);

const depthEdgeSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    const pre = bothIslandPrefix(state, value);
    if (pre) return pre;
    if (state.phase === 2) return { phase: 3, both: state.both, depth: value };
    if (state.phase === 3) {
      return (!state.both || Math.abs(value - state.depth) <= 1)
        ? { phase: 4 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 4,
}, shape);

// Rejects the case where `other` could have served as the parent. Placed on the
// earlier directions of each branch, it makes the parent the first eligible
// neighbour in DIRS order, so the tree is fixed by the island rather than
// chosen.
const notParentSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    const pre = bothIslandPrefix(state, value);
    if (pre) return pre;
    if (state.phase === 2) return { phase: 3, both: state.both, depth: value };
    if (state.phase === 3) {
      return (state.both && value === state.depth - 1) ? undefined : { phase: 4 };
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

const islandEdges = edges.flatMap(({ cell, other }) => [
  new NFA(sameLabelSpec, 'same island root row',
    shade.at(cell), shade.at(other), rootRow.at(cell), rootRow.at(other)),
  new NFA(sameLabelSpec, 'same island root column',
    shade.at(cell), shade.at(other), rootCol.at(cell), rootCol.at(other)),
  new NFA(depthEdgeSpec, 'depth changes by one',
    shade.at(cell), shade.at(other), depth.at(cell), depth.at(other)),
]);

const depthStep = Pair.fnToKey((mine, other) => other === mine - 1, shape);

const parentChoice = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  const neighbours = neighboursOf(cell);
  return new Or([
    new And([
      new Given(shade.at(cell), OCEAN),
      new Given(parent.at(cell), SEA_PARENT),
      new Given(subtree.at(cell), SEA),
      new Given(rootRow.at(cell), SEA),
      new Given(rootCol.at(cell), SEA),
      new Given(depth.at(cell), SEA),
    ]),
    new And([
      new Given(shade.at(cell), ISLAND),
      new Given(parent.at(cell), ROOT),
      new Given(depth.at(cell), 1),
      new Given(rootRow.at(cell), row),
      new Given(rootCol.at(cell), col),
      // A root's subtree is its whole island, and an island totals 9.
      new Given(subtree.at(cell), 9),
    ]),
    ...neighbours.map(({ dir, other }, k) => new And([
      new Given(shade.at(cell), ISLAND),
      new Given(shade.at(other), ISLAND),
      new Given(parent.at(cell), dir.code),
      new SameValues(2, rootRow.at(cell), rootRow.at(other)),
      new SameValues(2, rootCol.at(cell), rootCol.at(other)),
      new Pair(depthStep, 'one step nearer the root',
        depth.at(cell), depth.at(other)),
      ...neighbours.slice(0, k).map(earlier => new NFA(
        notParentSpec, 'earlier neighbour is not a parent',
        shade.at(cell), shade.at(earlier.other),
        depth.at(cell), depth.at(earlier.other))),
    ])),
  ]);
});

// Which cell of an island carries the root is this model's choice, not the
// puzzle's, so it is pinned to the island's first cell in reading order: a
// cell's root never comes after the cell itself.
const rootOrderKeys = new Map();
const rootOrderKey = (row, col) => {
  const key = row + '_' + col;
  if (!rootOrderKeys.has(key)) {
    rootOrderKeys.set(key, Pair.fnToKey(
      (r, c) => (r === SEA && c === SEA)
        || r < row || (r === row && c <= col), shape));
  }
  return rootOrderKeys.get(key);
};

const rootOrder = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new Pair(rootOrderKey(row, col), 'root comes first in reading order',
    rootRow.at(cell), rootCol.at(cell));
});

// --- Islands never touch, except on a bridge -------------------------------
// Both specs read [shade(a), shade(b), rootRow(a), rootRow(b), rootCol(a),
// rootCol(b)] for one diagonally adjacent pair. Two island cells lie on the
// same island exactly when they name the same root, so "different islands"
// needs no separate notion of reachability here. Edge-sharing pairs need no
// such rule: two island cells that share an edge are one island by definition.
const diagonalPrefix = (state, value) => {
  if (state.phase === 0) return { phase: 1, aIsland: value === ISLAND };
  if (state.phase === 1) {
    return { phase: 2, both: state.aIsland && value === ISLAND };
  }
  if (state.phase === 2) return { phase: 3, both: state.both, rr: value };
  if (state.phase === 3) {
    return { phase: 4, both: state.both, sameRow: value === state.rr };
  }
  if (state.phase === 4) {
    return { phase: 5, both: state.both, sameRow: state.sameRow, rc: value };
  }
  return null;
};

const noTouchSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    const pre = diagonalPrefix(state, value);
    if (pre) return pre;
    if (state.phase === 5) {
      const sameIsland = state.sameRow && value === state.rc;
      return (!state.both || sameIsland) ? { phase: 6 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 6,
}, shape);

const bridgeSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    const pre = diagonalPrefix(state, value);
    if (pre) return pre;
    if (state.phase === 5) {
      const sameIsland = state.sameRow && value === state.rc;
      return (state.both && !sameIsland) ? { phase: 6 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 6,
}, shape);

const bridgeKey = ([[r1, c1], [r2, c2]]) => `${r1}_${c1}_${r2}_${c2}`;
const bridgeSet = new Set(BRIDGES.flatMap(pair => [
  bridgeKey(pair), bridgeKey([pair[1], pair[0]])]));

const diagonalPairs = cells.flatMap(cell => {
  const { row, col } = parseCellId(cell);
  if (row === SIDE) return [];
  return [-1, 1].flatMap(dCol => {
    const other = graph.step(cell, 1, dCol);
    return other ? [[cell, other]] : [];
  });
});

const diagonalCells = ([a, b]) => {
  const pa = parseCellId(a);
  const pb = parseCellId(b);
  return {
    isBridge: bridgeSet.has(`${pa.row}_${pa.col}_${pb.row}_${pb.col}`),
    args: [shade.at(a), shade.at(b), rootRow.at(a), rootRow.at(b),
      rootCol.at(a), rootCol.at(b)],
  };
};

const noTouch = diagonalPairs.map(pair => {
  const { isBridge, args } = diagonalCells(pair);
  return isBridge
    ? new NFA(bridgeSpec, 'bridge joins two islands', ...args)
    : new NFA(noTouchSpec, 'islands do not touch diagonally', ...args);
});

// --- Ocean -----------------------------------------------------------------
const oceanBlocks = cells.flatMap(cell => {
  const { row, col } = parseCellId(cell);
  if (row === SIDE || col === SIDE) return [];
  const block = [cell, graph.step(cell, 0, 1), graph.step(cell, 1, 0),
    graph.step(cell, 1, 1)];
  // At least one island cell in every 2x2: the ocean never fills one.
  return [new ContainAtLeast(String(ISLAND), ...shade.at(block))];
});

const ocean = [
  new ConnectedValues('VG', OCEAN),
  ...oceanBlocks,
];

// --- Circle sight lines ----------------------------------------------------
// Along a row or column, one unbroken run of island cells is a single island
// (they share edges) and one unbroken run of ocean cells is the ocean, so a
// circled cell's view is stopped by the first cell of the opposite kind. Four
// directional run-length overlays carry that per cell:
//   run(c) = 1                    if the next cell that way is of the other
//                                  kind, or c is the last cell before the edge
//   run(c) = 1 + run(next cell)   if the next cell that way is of c's own kind
// and the circled cell's digit is its four runs less 3, since the cell itself
// is counted once in each direction. Each overlay is built only out to the
// farthest circled cell in its row/column, to spend fewer search cells.
const runSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    // Reject a shade value outside {ISLAND, OCEAN} up front, so the compiler
    // does not carry all ten grid values through myShade x neighShade.
    if (state.phase === 0) {
      return (value === ISLAND || value === OCEAN)
        ? { phase: 1, mine: value } : undefined;
    }
    if (state.phase === 1) {
      return (value === ISLAND || value === OCEAN)
        ? { phase: 2, same: value === state.mine } : undefined;
    }
    if (state.phase === 2) {
      return { phase: 3, same: state.same, neighRun: value };
    }
    if (state.phase === 3) {
      const expected = state.same ? 1 + state.neighRun : 1;
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

// `neededCells` walked from the grid edge inward, `dRow`/`dCol` pointing from a
// cell to its edge-ward neighbour, `isBoundary` marking the edge cell.
const buildRun = (prefix, neededCells, dRow, dCol, isBoundary) => {
  const overlay = graph.makeOverlay(prefix, neededCells);
  const constraints = neededCells.map(cell => {
    if (isBoundary(cell)) return new Given(overlay.at(cell), 1);
    const neighbour = graph.step(cell, dRow, dCol);
    return new NFA(runSpec, 'visible run',
      shade.at(cell), shade.at(neighbour),
      overlay.at(neighbour), overlay.at(cell));
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

const runOverlays = [runEast, runWest, runNorth, runSouth];

const visibility = CIRCLES.map(([row, col]) => {
  const cell = makeCellId(row, col);
  return new Sum(3,
    [runEast.overlay.at(cell), 1], [runWest.overlay.at(cell), 1],
    [runNorth.overlay.at(cell), 1], [runSouth.overlay.at(cell), 1],
    [cell, -1]);
});

// --- Domains ---------------------------------------------------------------
// The alphabet is widened to 10 only to carry the ocean sentinel, so the board
// and every overlay is pinned back to the values it can actually take.
const digits = Array.from({ length: SIDE }, (_, i) => i + 1);
const domains = [
  graph.makeReplicate(new Given(cells[0], ...digits)),
  shade.makeReplicate(new Given(shade.cells()[0], ISLAND, OCEAN)),
  parent.makeReplicate(new Given(parent.cells()[0], 1, 2, 3, 4, 5, SEA_PARENT)),
  ...runOverlays.map(({ overlay }) =>
    overlay.makeReplicate(new Given(overlay.cells()[0], ...digits))),
];

return [
  shape,
  shade.toVar('island or ocean'),
  parent.toVar('parent pointer'),
  subtree.toVar('subtree total'),
  rootRow.toVar('root row'),
  rootCol.toVar('root column'),
  depth.toVar('depth from root'),
  runEast.overlay.toVar('run east'),
  runWest.overlay.toVar('run west'),
  runNorth.overlay.toVar('run north'),
  runSouth.overlay.toVar('run south'),
  ...domains,
  ...rootOrder,
  ...parentChoice,
  ...subtreeSums,
  ...islandEdges,
  ...noTouch,
  ...ocean,
  ...runOverlays.flatMap(({ constraints }) => constraints),
  ...visibility,
];
