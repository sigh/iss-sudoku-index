// Title: Build It Yourself Suguru
// Author: Nicky R
// Video: https://www.youtube.com/watch?v=lYwc_QgKVOo
// Source: https://sudokupad.app/wvkf5duv2s

// A 10x10 grid with no rows, columns or boxes: this is a Raw grid, not a
// Sudoku layer. The rules encoded here are:
//  * The grid is partitioned into regions (orthogonally connected groups of
//    cells), determined by the solver; boundaries are only partly drawn.
//  * Each region of size N holds the digits 1 to N once each.
//  * Every pair of cells a king's move apart (orthogonally or diagonally
//    adjacent) holds different digits, regardless of region.
//  * Fourteen drawn wall segments each mark that its two cells are in
//    different regions.
//  * Three drawn inequality signs each order one adjacent pair.
//  * No completed cell holds a 5 -- since a region of size 5 would have to
//    contain a 5, this also caps every region at 4 cells, so the grid only
//    ever needs digits 1-4.
//
// Nothing is omitted. No region border beyond the fourteen drawn walls, no
// root or pointer, is drawn: the rest of the layout is the solver's to find.

const shape = new Shape('10x10', 16, 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

// Five overlays carry the region layout, all bookkeeping the puzzle never
// draws:
//   parent  - ROOT, or the direction of the cell one step nearer the root.
//   depth   - steps from the root, the root counting as 1.
//   rootRow
//   rootCol - which cell is the root of this cell's region.
//   band    - the digit set collected in this cell's own subtree, stored as
//             bitmask + 1 (bit i is digit i+1); the root's subtree is the
//             whole region.
const parent = graph.makeOverlay('VP');
const depth = graph.makeOverlay('VD');
const rootRow = graph.makeOverlay('VR');
const rootCol = graph.makeOverlay('VK');
const band = graph.makeOverlay('VA');

const DIGITS = [1, 2, 3, 4];
const MAX_SET = 16;   // bitmask 0-15 stored as 1-16: 16 is the max stored value
// A region's whole digit set must be exactly {1..N}: mask 1,3,7,15 (stored
// 2,4,8,16) for N = 1,2,3,4. Any other final mask skips a digit or starts
// above 1, which the rule forbids.
const FULL_SET_VALUES = [2, 4, 8, 16];

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

// Reads [set(cell), digit(cell), then parent(n), set(n) for each neighbour n
// in a fixed order]. `expected[i]` is the pointer value that makes neighbour i
// a child of this cell. The state carries the part of the cell's own set
// still to be accounted for: the cell's own digit, then each child's set,
// each of which must still be available. Consuming every child's set
// disjointly is what makes the digits of a region all different; ending
// empty is what makes the set exactly the union.
const bandSpecs = new Map();
const bandSpec = expected => {
  const key = expected.join('_');
  if (!bandSpecs.has(key)) {
    bandSpecs.set(key, NFA.encodeSpec({
      startState: { i: -2, rem: 0, child: null },
      transition: (state, value) => {
        if (state.i === -2) {
          return value <= MAX_SET
            ? { i: -1, rem: value - 1, child: null } : undefined;
        }
        if (state.i === -1) {
          const at = DIGITS.indexOf(value);
          if (at < 0) return undefined;
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

const subtreeSets = cells.map(cell => {
  const neighbours = neighboursOf(cell);
  const expected = neighbours.map(entry => entry.dir.back);
  return new NFA(bandSpec(expected), 'subtree digit set',
    band.at(cell), cell,
    ...neighbours.flatMap(({ other }) => [parent.at(other), band.at(other)]));
});

// Reads [rootRow(cell), rootCol(cell), rootRow(other), rootCol(other),
// depth(cell), depth(other)]. Two cells are in the same region exactly when
// they name the same root; there is no drawn signal (shade, size) that
// settles this independently, so identity is read directly off the two root
// overlays. `sameIdentityDepthSpec` is the edge check that within a region no
// step may change the distance to the root by more than one, which is what
// makes `depth` the true distance rather than any descending chain.
const sameIdentityDepthSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, rowMine: value };
    if (state.phase === 1) return { phase: 2, rowMine: state.rowMine, colMine: value };
    if (state.phase === 2) {
      return { phase: 3, colMine: state.colMine, sameRow: value === state.rowMine };
    }
    if (state.phase === 3) {
      return { phase: 4, same: state.sameRow && value === state.colMine };
    }
    if (state.phase === 4) return { phase: 5, same: state.same, depthMine: value };
    if (state.phase === 5) {
      return (!state.same || Math.abs(value - state.depthMine) <= 1)
        ? { phase: 6 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 6,
}, shape);

// Same six reads, but rejects the case where `other` could have served as
// this cell's parent (same region, one step nearer the root). Placed on the
// earlier directions of each branch, it makes the parent the first eligible
// neighbour in DIRS order, so the tree is fixed by the region rather than
// chosen -- otherwise the same region could be represented by several
// different trees and the search would count one partition several times.
const notParentSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, rowMine: value };
    if (state.phase === 1) return { phase: 2, rowMine: state.rowMine, colMine: value };
    if (state.phase === 2) {
      return { phase: 3, colMine: state.colMine, sameRow: value === state.rowMine };
    }
    if (state.phase === 3) {
      return { phase: 4, same: state.sameRow && value === state.colMine };
    }
    if (state.phase === 4) return { phase: 5, same: state.same, depthMine: value };
    if (state.phase === 5) {
      return (state.same && value === state.depthMine - 1)
        ? undefined : { phase: 6 };
    }
    return undefined;
  },
  accept: state => state.phase === 6,
}, shape);

const depthStep = Pair.fnToKey((mine, other) => other === mine - 1, shape);

const edges = cells.flatMap(cell => DIRS
  .filter(dir => dir.dRow > 0 || dir.dCol > 0)   // each edge once
  .flatMap(dir => {
    const other = graph.step(cell, dir.dRow, dir.dCol);
    return other ? [{ cell, other }] : [];
  }));

const identityEdges = edges.map(({ cell, other }) => new NFA(
  sameIdentityDepthSpec, 'depth changes by at most one within a region',
  rootRow.at(cell), rootCol.at(cell), rootRow.at(other), rootCol.at(other),
  depth.at(cell), depth.at(other)));

const parentChoice = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  const neighbours = neighboursOf(cell);
  return new Or([
    new And([
      new Given(parent.at(cell), ROOT),
      new Given(depth.at(cell), 1),
      new Given(rootRow.at(cell), row),
      new Given(rootCol.at(cell), col),
      new Given(band.at(cell), ...FULL_SET_VALUES),
    ]),
    ...neighbours.map(({ dir, other }, k) => new And([
      new Given(parent.at(cell), dir.code),
      new SameValues(2, rootRow.at(cell), rootRow.at(other)),
      new SameValues(2, rootCol.at(cell), rootCol.at(other)),
      new Pair(depthStep, 'one step nearer the root',
        depth.at(cell), depth.at(other)),
      ...neighbours.slice(0, k).map(earlier => new NFA(
        notParentSpec, 'earlier neighbour is not a parent',
        rootRow.at(cell), rootCol.at(cell),
        rootRow.at(earlier.other), rootCol.at(earlier.other),
        depth.at(cell), depth.at(earlier.other))),
    ])),
  ]);
});

// Which cell of a region carries the root is this model's choice, not the
// puzzle's: every region is rooted at its first cell in reading order (no
// clue anchors a region to a particular cell). A cell's own root can never
// come after the cell itself in reading order; combined with the tree
// structure above, the region's own earliest cell is forced to be the root.
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
  return new Pair(rootOrderKey(row, col), 'root is no later than this cell',
    rootRow.at(cell), rootCol.at(cell));
});

// Every pair of cells a king's move apart holds different digits, whatever
// regions they belong to.
const kingAdjacency = [];
for (const cell of cells) {
  const { row: r1, col: c1 } = parseCellId(cell);
  for (const other of graph.kingNeighbours(cell)) {
    const { row: r2, col: c2 } = parseCellId(other);
    if (r2 < r1 || (r2 === r1 && c2 <= c1)) continue;   // each pair once
    kingAdjacency.push(new AllDifferent(cell, other));
  }
}

// Fourteen drawn unit wall segments, transcribed from the payload's wall
// lines, each an orthogonally adjacent pair placed in different regions.
const WALLS = [
  [[2, 2], [2, 3]], [[1, 4], [2, 4]], [[1, 10], [2, 10]], [[2, 10], [3, 10]],
  [[4, 2], [4, 3]], [[4, 4], [4, 5]], [[3, 6], [4, 6]], [[5, 2], [6, 2]],
  [[5, 9], [6, 9]], [[8, 2], [8, 3]], [[7, 5], [8, 5]], [[8, 6], [8, 7]],
  [[8, 4], [9, 4]], [[9, 3], [10, 3]],
];
const wallConstraints = WALLS.map(([a, b]) => {
  const cellA = makeCellId(...a);
  const cellB = makeCellId(...b);
  return new Or([
    new AllDifferent(rootRow.at(cellA), rootRow.at(cellB)),
    new AllDifferent(rootCol.at(cellA), rootCol.at(cellB)),
  ]);
});

// Three drawn inequality signs (arrowhead points at the smaller cell).
const INEQUALITIES = [
  [[2, 4], [2, 5]],
  [[5, 1], [5, 2]],
  [[9, 7], [9, 6]],
];
const inequalityConstraints = INEQUALITIES.map(([bigger, smaller]) =>
  new GreaterThan(makeCellId(...bigger), makeCellId(...smaller)));

const parentValues = [ROOT, ...DIRS.map(dir => dir.code)];
const rowColValues = Array.from({ length: 10 }, (_, i) => i + 1);
const depthValues = [1, 2, 3, 4];
const domains = [
  graph.makeReplicate(new Given(cells[0], ...DIGITS)),
  parent.makeReplicate(new Given(parent.cells()[0], ...parentValues)),
  depth.makeReplicate(new Given(depth.cells()[0], ...depthValues)),
  rootRow.makeReplicate(new Given(rootRow.cells()[0], ...rowColValues)),
  rootCol.makeReplicate(new Given(rootCol.cells()[0], ...rowColValues)),
];

return [
  shape,
  parent.toVar('parent pointer'),
  depth.toVar('depth from root'),
  rootRow.toVar('root row'),
  rootCol.toVar('root column'),
  band.toVar('subtree digit set'),
  ...domains,
  ...rootOrder,
  ...parentChoice,
  ...subtreeSets,
  ...identityEdges,
  ...kingAdjacency,
  ...wallConstraints,
  ...inequalityConstraints,
];
