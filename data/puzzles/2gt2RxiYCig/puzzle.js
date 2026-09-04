// Title: Chiaroscuro-doku
// Author: yttrio
// Video: https://www.youtube.com/watch?v=2gt2RxiYCig
// Source: https://sudokupad.app/ozvhz71rzq

// Normal sudoku on a 9x9 with no given digits. Some cells are shaded, and a
// group is a maximal orthogonally connected set of cells of one shade. The
// rules encoded here are:
//  * Every group of shaded cells has an even number of cells; every group of
//    unshaded cells has an odd number of cells.
//  * Digits do not repeat inside a group. With nine symbols that also caps a
//    group at nine cells.
//  * The digit in a circled cell is the number of cells in its group.
//  * A number printed in a cell's upper-left corner is the total of the
//    digits in the group containing that cell.
//
// Omitted: "two groups cannot have the same shape and size, counting
// rotations and reflections as the same". Nothing here compares the shapes
// of two groups the solver discovers, so this script accepts every shading
// the other rules allow, congruent groups included.
//
// No shading, group, root or pointer is drawn: the whole layout is the
// solver's to find, and every overlay below is bookkeeping for it.

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const cells = graph.cells();

// Transcribed from the eight small numbers printed in cell corners:
// [row, col, total of that cell's group].
const TOTALS = [
  [1, 9, 43],
  [2, 3, 32],
  [3, 5, 10],
  [4, 2, 33],
  [6, 2, 9],
  [7, 5, 10],
  [8, 2, 33],
  [8, 8, 44],
];

// Transcribed from the twelve drawn circles.
const CIRCLES = [
  'R1C1', 'R3C4', 'R3C6', 'R4C5', 'R5C4', 'R5C5', 'R5C6',
  'R6C4', 'R6C5', 'R6C6', 'R6C8', 'R8C4',
];

// Six overlays carry the shading and the group layout:
//   shade   - UNSHADED or SHADED.
//   size    - how many cells the group holds; constant across the group.
//   parent  - ROOT, or the direction of the cell one step nearer the root.
//   depth   - steps from the root, the root counting as 1.
//   rootRow
//   rootCol - which cell is the root of this cell's group.
const UNSHADED = 1;
const SHADED = 2;
const shade = graph.makeOverlay('VS');
const size = graph.makeOverlay('VG');
const parent = graph.makeOverlay('VP');
const depth = graph.makeOverlay('VD');
const rootRow = graph.makeOverlay('VR');
const rootCol = graph.makeOverlay('VK');

// Three more overlays carry the digits collected below each cell. The digits
// of a group are all different, so the group's digits form a *set*, and a set
// of 1-9 splits into three three-bit parts that each fit one 9-valued Var
// cell. A cell holds the set of digits in its own subtree, as bitmask + 1.
const BANDS = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
const MAX_SET = 8;             // bitmask 0-7 stored as 1-8
const bands = [
  graph.makeOverlay('VA'),     // digits 1-3
  graph.makeOverlay('VB'),     // digits 4-6
  graph.makeOverlay('VE'),     // digits 7-9
];
const bandCells = cell => bands.map(band => band.at(cell));
const popCount = mask => (mask & 1) + ((mask >> 1) & 1) + ((mask >> 2) & 1);
const bandTotal = (b, mask) => BANDS[b].reduce(
  (total, digit, i) => total + ((mask >> i) & 1 ? digit : 0), 0);

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
// in a fixed order], for one band of three digits. `expected[i]` is the
// pointer value that makes neighbour i a child of this cell. The state
// carries the part of the cell's own set still to be accounted for: the
// cell's own digit if it falls in this band, then each child's set, each of
// which must still be available. Consuming every child's set disjointly is
// what makes the digits of a group all different; ending empty is what makes
// the set exactly the union.
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

// Reads [shade(a), shade(b), label(a), label(b)] for one orthogonal edge:
// neighbours of the same shade are in the same group and so must name the
// same root. Used once for the root's row and once for its column. This is
// what makes a group a *maximal* connected set of one shade.
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

// Reads [shade(a), shade(b), depth(a), depth(b)]: within a group no step may
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

const groupEdges = edges.flatMap(({ cell, other }) => [
  new NFA(rootEdgeSpec, 'same group root row',
    shade.at(cell), shade.at(other), rootRow.at(cell), rootRow.at(other)),
  new NFA(rootEdgeSpec, 'same group root column',
    shade.at(cell), shade.at(other), rootCol.at(cell), rootCol.at(other)),
  new NFA(depthEdgeSpec, 'depth changes by one',
    shade.at(cell), shade.at(other), depth.at(cell), depth.at(other)),
]);

// Reads [shade(cell), shade(other), depth(cell), depth(other)] and rejects
// the case where `other` could have served as the parent. Placed on the
// earlier directions of each branch, it makes the parent the first eligible
// neighbour in DIRS order, so the tree is fixed by the shading rather than
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

// Reads [size(root), then the root's three band sets]. The root's subtree is
// the whole group, so the number of digits collected there is the number of
// cells in the group: this is what ties `size` to the group's cell count.
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
      new NFA(rootSizeSpec, 'group size is its cell count',
        size.at(cell), ...bandCells(cell)),
    ]),
    ...neighbours.map(({ dir, other }, k) => new And([
      new Given(parent.at(cell), dir.code),
      new SameValues(2, shade.at(cell), shade.at(other)),
      new SameValues(2, size.at(cell), size.at(other)),
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

// Which cell of a group carries the root is this model's choice, not the
// puzzle's, so it is pinned. A group holding a printed total is rooted at
// that total's cell, which is what puts the group's whole digit set on a cell
// the total can be read against; every other group is rooted at its first
// cell in reading order.
//
// Two printed totals can share a group only if they are equal. The two 10s
// (R3C5, R7C5) cannot: the cells are four steps apart, so a group holding
// both has at least five cells, and five distinct digits sum to at least 15.
// The two 33s (R4C2, R8C2) can, so R8C2 is allowed to sit in R4C2's group
// instead of rooting its own, and the 33 is then read at R4C2.
const TOTAL_KEYS = new Set(TOTALS.map(([row, col]) => row + '_' + col));
const rootOrderKeys = new Map();
const rootOrderKey = (row, col) => {
  const key = row + '_' + col;
  if (!rootOrderKeys.has(key)) {
    rootOrderKeys.set(key, Pair.fnToKey(
      (r, c) => r < row || (r === row && c <= col) || TOTAL_KEYS.has(r + '_' + c),
      shape));
  }
  return rootOrderKeys.get(key);
};

const rootOrder = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new Pair(rootOrderKey(row, col), 'root comes first in reading order',
    rootRow.at(cell), rootCol.at(cell));
});

// Reads the three band sets of a rooted total cell. That cell is its group's
// root, so the sets are the group's whole digit set and their digits are its
// total.
const sumSpecs = new Map();
const sumSpec = total => {
  if (!sumSpecs.has(total)) {
    sumSpecs.set(total, NFA.encodeSpec({
      startState: { i: 0, sum: 0 },
      transition: (state, value) => {
        if (state.i >= bands.length || value > MAX_SET) return undefined;
        const sum = state.sum + bandTotal(state.i, value - 1);
        return sum > total ? undefined : { i: state.i + 1, sum };
      },
      accept: state => state.i === bands.length && state.sum === total,
    }, shape));
  }
  return sumSpecs.get(total);
};

const rootedTotal = (row, col, total) => {
  const cell = makeCellId(row, col);
  return new And([
    new Given(rootRow.at(cell), row),
    new Given(rootCol.at(cell), col),
    new NFA(sumSpec(total), 'group total ' + total, ...bandCells(cell)),
  ]);
};

const SHARED_TOTAL = { cell: [8, 2], partner: [4, 2] };   // the two 33s

const totalConstraints = TOTALS.map(([row, col, total]) => {
  if (row === SHARED_TOTAL.cell[0] && col === SHARED_TOTAL.cell[1]) {
    const cell = makeCellId(row, col);
    const [pRow, pCol] = SHARED_TOTAL.partner;
    return new Or([
      rootedTotal(row, col, total),
      new And([
        new Given(rootRow.at(cell), pRow),
        new Given(rootCol.at(cell), pCol),
      ]),
    ]);
  }
  return rootedTotal(row, col, total);
});

// The digit in a circled cell is the number of cells in its group.
const circleConstraints = CIRCLES.map(cell =>
  new SameValues(2, cell, size.at(cell)));

// Shaded groups have an even number of cells, unshaded groups an odd number.
// `size` is constant across a group, so the check is local to every cell.
const parityKey = Pair.fnToKey(
  (cellSize, cellShade) => (cellSize % 2 === 0) === (cellShade === SHADED),
  shape);
const parity = cells.map(cell => new Pair(
  parityKey, 'shaded even, unshaded odd', size.at(cell), shade.at(cell)));

const parentValues = [ROOT, ...DIRS.map(dir => dir.code)];
const setValues = Array.from({ length: MAX_SET }, (_, i) => i + 1);
const domains = [
  shade.makeReplicate(new Given(shade.cells()[0], UNSHADED, SHADED)),
  parent.makeReplicate(new Given(parent.cells()[0], ...parentValues)),
  ...bands.map(band => band.makeReplicate(
    new Given(band.cells()[0], ...setValues))),
];

return [
  shape,
  shade.toVar('shading'),
  size.toVar('group size'),
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
  ...groupEdges,
  ...totalConstraints,
  ...circleConstraints,
  ...parity,
];
