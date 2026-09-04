// Title: Lookouts
// Author: Eden
// Video: https://www.youtube.com/watch?v=cD2Mmj5115A
// Source: https://cracking-the-cryptic.web.app/sudoku/bT947fp4Nd

// 8x8 board, no Sudoku layer: the grid is Raw, so rows, columns and boxes
// carry no rule; the printed grid values are sightline counts, not digits,
// and repeat freely.
//
// Rules encoded (per the video's on-screen rules panel, "Lookouts by Eden"):
//  * Divide the grid along lines into regions whose sizes are given by the
//    circles outside the grid: eight 4s, four 5s and two 6s (8*4+4*5+2*6=64,
//    the whole board), read as an unordered multiset -- nothing in the rules
//    or the drawn layout ties a circle to a particular column, and the two
//    stacked rows of circles are only there because 14 circles do not fit
//    one-per-column above an 8-wide grid.
//  * Each number in the grid is the count of cells "seen" horizontally and
//    vertically from that cell before hitting the edges of its own region,
//    counting the cell itself.
//
// Omitted:
//  * "All cells for which the number is maximum within that region are
//    given; other numbers are not given." The sightline count itself is
//    encoded and tied to the 14 printed values below, but the selection rule
//    -- that a cell is printed exactly when its count is the strict maximum
//    of its own (solver-discovered) region -- is not. That needs, for each
//    printed cell, a comparison against every other cell that ends up
//    sharing its region, which is a region-wide argmax over a partition the
//    solver still has to find.
//
// --- Region discovery -------------------------------------------------
// A generic solver-discovered partition: five whole-grid overlays carry a
// rooted tree per region (parent pointer, subtree count, root row, root
// column, depth from root). The tree is *not* driven by matching printed
// digits (most cells print nothing at all), so which neighbour is a cell's
// parent is a free choice for the solver, constrained only by:
//   - every region's root-ward chain must stay consistent (one rootRow/
//     rootCol pair per region, depth = true distance from the root);
//   - the parent, when not the root, must be the first neighbour (reading
//     order N,S,W,E) that shares the region and sits one depth shallower --
//     a general tie-break for a solver-discovered partition, not a
//     digit-matching rule, and it keeps one physical partition from being
//     counted as several solutions differing only in which internal
//     spanning tree the bookkeeping picked;
//   - the root is the region's first cell in reading order, for the same
//     reason;
//   - the root's subtree count (the whole region's size) is one of 4, 5, 6.
// A region's size must also hit the exact drawn multiset (eight 4s, four 5s,
// two 6s), enforced by three boolean overlays flagging "this cell is a
// region root of size k" and one Sum per k over the 64-cell flag layer.

const SIDE = 8;
const ROOT = 1;
const TRUE = 2;
const FALSE = 1;
const SIZE_COUNTS = { 4: 8, 5: 4, 6: 2 }; // drawn circle multiset -> region count

const shape = new Shape(`${SIDE}x${SIDE}`, '1-8', 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

// DIRS order is the reading-order tie-break's priority: North, South, West,
// East. `back` is the pointer value a neighbour in that direction uses to
// point back at the cell we started from.
const DIRS = [
  { code: 2, back: 3, dRow: -1, dCol: 0 },
  { code: 3, back: 2, dRow: 1, dCol: 0 },
  { code: 4, back: 5, dRow: 0, dCol: -1 },
  { code: 5, back: 4, dRow: 0, dCol: 1 },
];

const parent = graph.makeOverlay('VP');
const subtree = graph.makeOverlay('VT');
const rootRow = graph.makeOverlay('VR');
const rootCol = graph.makeOverlay('VC');
const depth = graph.makeOverlay('VD');

const neighboursOf = cell => DIRS
  .map(dir => ({ dir, other: graph.step(cell, dir.dRow, dir.dCol) }))
  .filter(entry => entry.other);

// --- Subtree accumulator (region size): subtree(cell) = 1 + sum of
// children's subtree, where a neighbour is a child exactly when its parent
// pointer names the direction back to this cell.
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
    ...neighbours.flatMap(({ other }) => [parent.at(other), subtree.at(other)]));
});

// --- Parent choice ----------------------------------------------------
// Reads [rootRow(cell), rootCol(cell), rootRow(other), rootCol(other),
// depth(cell), depth(other)] for a candidate earlier same-direction
// neighbour and rejects when that neighbour shares this cell's root and
// sits exactly one depth shallower -- i.e. when it could itself have been
// the parent. Used to force the parent to be the *first* eligible neighbour
// in DIRS order, which is what keeps one physical region from admitting
// several different internal spanning trees (a region containing a filled
// 2x2 block otherwise has more than one valid parent-pointer assignment for
// the same cells).
const notParentSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, myRootRow: value };
    if (state.phase === 1) return { phase: 2, myRootRow: state.myRootRow, myRootCol: value };
    if (state.phase === 2) {
      return {
        phase: 3, myRootRow: state.myRootRow, myRootCol: state.myRootCol,
        sameRow: value === state.myRootRow,
      };
    }
    if (state.phase === 3) {
      return {
        phase: 4,
        same: state.sameRow && value === state.myRootCol,
      };
    }
    if (state.phase === 4) return { phase: 5, same: state.same, myDepth: value };
    if (state.phase === 5) {
      return (state.same && value === state.myDepth - 1) ? undefined : { phase: 6 };
    }
    return undefined;
  },
  accept: state => state.phase === 6,
}, shape);

// True when the second cell's depth is one less than the first's.
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
      // The region this root heads must be one of the drawn sizes.
      new Given(subtree.at(cell), ...Object.keys(SIZE_COUNTS).map(Number)),
    ]),
    ...neighbours.map(({ dir, other }, k) => new And([
      new Given(parent.at(cell), dir.code),
      new SameValues(2, rootRow.at(cell), rootRow.at(other)),
      new SameValues(2, rootCol.at(cell), rootCol.at(other)),
      new Pair(depthStep, 'one step nearer the root',
        depth.at(cell), depth.at(other)),
      ...neighbours.slice(0, k).map(earlier => new NFA(
        notParentSpec, 'earlier same-region neighbour is not a parent',
        rootRow.at(cell), rootCol.at(cell),
        rootRow.at(earlier.other), rootCol.at(earlier.other),
        depth.at(cell), depth.at(earlier.other))),
    ])),
  ]);
});

// A root's row and column name a cell on the board, so they stop at SIDE
// even though the shared alphabet runs to 8 anyway (SIDE == 8 here, so this
// is just the domain restriction, kept explicit for clarity).
const onBoard = Array.from({ length: SIDE }, (_, i) => i + 1);
const rootOrderKeys = new Map();
const rootOrderKey = (row, col) => {
  const key = row + '_' + col;
  if (!rootOrderKeys.has(key)) {
    rootOrderKeys.set(key, Pair.fnToKey(
      (r, c) => r < row || (r === row && c <= col), shape));
  }
  return rootOrderKeys.get(key);
};

const rootDomains = [
  rootRow.makeReplicate(new Given(rootRow.cells()[0], ...onBoard)),
  rootCol.makeReplicate(new Given(rootCol.cells()[0], ...onBoard)),
  // The root of a cell's region never comes after the cell itself in
  // reading order -- this pins the root to be the region's first cell,
  // ruling out every other member as an alternative root for the same
  // region.
  ...cells.map(cell => {
    const { row, col } = parseCellId(cell);
    return new Pair(rootOrderKey(row, col), 'root comes first in reading order',
      rootRow.at(cell), rootCol.at(cell));
  }),
];

// --- Region size multiset ----------------------------------------------
// isSizeK(cell) flags "cell is a region root whose region has size k", read
// from this cell's own (parent, subtree) -- no propagation needed, since
// subtree already totals the whole region exactly at its root.
const sizeFlagSpecs = new Map();
const sizeFlagSpec = k => {
  if (!sizeFlagSpecs.has(k)) {
    sizeFlagSpecs.set(k, NFA.encodeSpec({
      startState: { phase: 0 },
      transition: (state, value) => {
        if (state.phase === 0) return { phase: 1, isRoot: value === ROOT };
        if (state.phase === 1) {
          return { phase: 2, flag: (state.isRoot && value === k) ? TRUE : FALSE };
        }
        if (state.phase === 2) return value === state.flag ? { phase: 3 } : undefined;
        return undefined;
      },
      accept: state => state.phase === 3,
    }, shape));
  }
  return sizeFlagSpecs.get(k);
};

// Literal overlay prefixes (not built from a template) for each size class.
const SIZE_FLAG_PREFIXES = { 4: 'VFA', 5: 'VFB', 6: 'VFC' };

const sizeFlags = Object.keys(SIZE_COUNTS).map(Number).map(k => {
  const flag = graph.makeOverlay(SIZE_FLAG_PREFIXES[k]);
  const nfas = cells.map(cell => new NFA(
    sizeFlagSpec(k), `region-of-${k} root flag`,
    parent.at(cell), subtree.at(cell), flag.at(cell)));
  // Sum of a 0/1-coded (FALSE=1/TRUE=2) 64-cell layer with exactly
  // SIZE_COUNTS[k] TRUE cells is 64 + SIZE_COUNTS[k].
  const total = cells.length + SIZE_COUNTS[k];
  return {
    overlay: flag,
    constraints: [
      flag.toVar(`region-of-${k} root flags`),
      new Sum(total, ...flag.cells()),
      ...nfas,
    ],
  };
});

// --- Sightlines ----------------------------------------------------------
// A cell's printed number is its count of cells seen along all four
// orthogonal rays, itself included, stopping at the edge of its own region
// (not the grid edge). One directional "run" overlay per compass direction
// carries, for each cell, how many cells lie between it and the nearest
// region boundary that way, inclusive; a boundary is either the grid edge or
// a neighbour whose root differs from this cell's own.
//
// run(cell) = 1 at the grid edge; otherwise 1 + run(neighbour) when the
// neighbour shares this cell's root, else 1 (the neighbour itself starts a
// different region, so it blocks the view). The four run values overlap
// only at the cell itself (counted once in each), so the total seen is their
// sum minus 3.
const RUN_PREFIXES = {
  N: 'VNU', S: 'VND', W: 'VNW', E: 'VNE',
};
const RUN_DIRS = [
  { name: 'N', dRow: -1, dCol: 0 },
  { name: 'S', dRow: 1, dCol: 0 },
  { name: 'W', dRow: 0, dCol: -1 },
  { name: 'E', dRow: 0, dCol: 1 },
];

// Reads just [run(cell)]: the edge case, no neighbour that way.
const edgeRunSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => (value === 1 ? { phase: 1 } : undefined),
  accept: state => state.phase === 1,
}, shape);

// Reads [rootRow(cell), rootCol(cell), rootRow(neighbour), rootCol(neighbour),
// run(neighbour), run(cell)]: the interior case. The neighbour blocks the
// view (run(cell) = 1) unless it shares this cell's root, in which case the
// sightline continues through it (run(cell) = run(neighbour) + 1).
const interiorRunSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, myRow: value };
    if (state.phase === 1) return { phase: 2, myRow: state.myRow, myCol: value };
    if (state.phase === 2) {
      return { phase: 3, myCol: state.myCol, sameRow: value === state.myRow };
    }
    if (state.phase === 3) {
      return { phase: 4, same: state.sameRow && value === state.myCol };
    }
    if (state.phase === 4) {
      return { phase: 5, expected: state.same ? value + 1 : 1 };
    }
    if (state.phase === 5) return value === state.expected ? { phase: 6 } : undefined;
    return undefined;
  },
  accept: state => state.phase === 6,
}, shape);

const runOverlays = new Map(
  RUN_DIRS.map(dir => [dir.name, graph.makeOverlay(RUN_PREFIXES[dir.name])]));

const runConstraints = RUN_DIRS.flatMap(dir => {
  const overlay = runOverlays.get(dir.name);
  const nfas = cells.map(cell => {
    const neighbour = graph.step(cell, dir.dRow, dir.dCol);
    if (!neighbour) {
      return new NFA(edgeRunSpec, `${dir.name} sightline (edge)`, overlay.at(cell));
    }
    return new NFA(interiorRunSpec, `${dir.name} sightline`,
      rootRow.at(cell), rootCol.at(cell),
      rootRow.at(neighbour), rootCol.at(neighbour),
      overlay.at(neighbour), overlay.at(cell));
  });
  return [overlay.toVar(`${dir.name} sightline run`), ...nfas];
});

// Sum of the four runs double-counts the cell itself three extra times (once
// per direction beyond the first), and must equal the cell's own printed
// number.
const sightlineSums = cells.map(cell => new Sum(
  3, ...RUN_DIRS.map(dir => runOverlays.get(dir.name).at(cell)), [cell, -1]));

// --- The 14 printed numbers ------------------------------------------
// The 14 printed numbers drawn in the grid, as [row, col, number].
const GIVENS = [
  [1, 3, 4], [1, 8, 6],
  [2, 1, 6], [2, 5, 5],
  [3, 4, 5],
  [4, 2, 4], [4, 6, 5],
  [5, 3, 4], [5, 7, 4],
  [6, 5, 4],
  [7, 4, 4], [7, 8, 4],
  [8, 1, 4], [8, 6, 5],
];

return [
  shape,
  parent.toVar('parent pointer'),
  subtree.toVar('subtree size'),
  rootRow.toVar('root row'),
  rootCol.toVar('root column'),
  depth.toVar('depth from root'),
  ...rootDomains,
  ...parentChoice,
  ...subtreeSums,
  ...sizeFlags.flatMap(f => f.constraints),
  ...runConstraints,
  ...sightlineSums,
  ...GIVENS.map(([row, col, value]) => new Given(makeCellId(row, col), value)),
];
