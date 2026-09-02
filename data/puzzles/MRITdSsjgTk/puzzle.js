// Title: Spiral Fillodoku
// Author: AnalyticalNinja
// Video: https://www.youtube.com/watch?v=MRITdSsjgTk
// Source: https://app.crackingthecryptic.com/sudoku/3Gd3L4Q6rp

// Normal sudoku on a 9x9 with no given digits. The grid is also divided into
// coloured regions, and the rules encoded here are:
//  * Every cell lies in exactly one region, and a region is one orthogonally
//    connected group of cells.
//  * Two orthogonally adjacent regions never contain the same number of cells.
//  * Digits do not repeat inside a region. With nine symbols that also caps a
//    region at nine cells.
//  * Each region is unchanged by a 180 degree rotation about its own centre.
//  * A region holding one of the 22 printed numbers has that digit total.
//    Regions with no printed number have no total.
//
// Nothing is omitted. No region border, colour or centre is drawn: the whole
// layout is the solver's to find.
//
// The first three clauses together say exactly one thing about a per-cell
// region-size value: the orthogonally connected run of equal sizes containing a
// cell has that many cells. That is the Fillomino condition, on a size overlay
// rather than on the printed digits.

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const cells = graph.cells();

// Transcribed from the 22 small numbers printed in cell corners:
// [row, col, total of that cell's region].
const CLUES = [
  [1, 3, 17], [1, 6, 20], [1, 9, 10],
  [2, 2, 29], [2, 7, 7], [2, 8, 4],
  [3, 6, 27], [3, 9, 12],
  [4, 1, 16], [4, 4, 33], [4, 7, 35], [4, 9, 31],
  [5, 6, 16], [5, 8, 6],
  [6, 6, 12],
  [7, 2, 4], [7, 4, 26], [7, 9, 3],
  [8, 5, 10], [8, 8, 8],
  [9, 4, 9], [9, 6, 4],
];

// Five overlays carry the region layout, and two more further down carry the
// rotation. All of it is bookkeeping: the puzzle never draws a region, a root,
// a pointer or a centre.
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
// 1-9 splits into three three-bit halves that each fit one 9-valued Var cell.
// A cell holds the set of digits in its own subtree, stored as bitmask + 1.
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
// puzzle's, so it is pinned. A region holding a printed number is rooted at that
// number's cell, which is what puts the region's whole digit set on a cell the
// clue can be read against; every other region is rooted at its first cell in
// reading order. No region can hold two printed numbers -- two different numbers
// would ask one region for two totals, and the six repeated numbers are further
// apart by taxicab distance than a region of their permitted size can reach --
// so this names exactly one cell of every region.
const CLUE_KEYS = new Set(CLUES.map(([row, col]) => row + '_' + col));
const rootOrderKeys = new Map();
const rootOrderKey = (row, col) => {
  const key = row + '_' + col;
  if (!rootOrderKeys.has(key)) {
    rootOrderKeys.set(key, Pair.fnToKey(
      (r, c) => r < row || (r === row && c <= col) || CLUE_KEYS.has(r + '_' + c),
      shape));
  }
  return rootOrderKeys.get(key);
};

const rootOrder = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new Pair(rootOrderKey(row, col), 'root comes first in reading order',
    rootRow.at(cell), rootCol.at(cell));
});

// Reads the three band sets of a clued cell. That cell is its region's root, so
// the sets are the region's whole digit set and their digits are its total.
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

const clueConstraints = CLUES.flatMap(([row, col, total]) => {
  const cell = makeCellId(row, col);
  return [
    new Given(rootRow.at(cell), row),
    new Given(rootCol.at(cell), col),
    new NFA(sumSpec(total), 'clued region total ' + total, ...bandCells(cell)),
  ];
});

// Each region is unchanged by a 180 degree rotation about its own centre, which
// may fall on a cell, on an edge or on a lattice corner and is never drawn. Two
// overlays name, per cell, the cell that rotation sends it to: `mirrorRow` its
// row and `mirrorCol` its column.
const mirrorRow = graph.makeOverlay('VM');
const mirrorCol = graph.makeOverlay('VN');

// Reads [size(a), size(b), mirror(a), mirror(b)] for one orthogonal edge and,
// when the two cells share a region, requires mirror(b) === mirror(a) - drop.
// Writing the region's centre as (cr, cc) in half-cell units, mirrorRow of a
// cell is 2*cr - row and mirrorCol is 2*cc - col: stepping one row down lowers
// mirrorRow by one and leaves mirrorCol alone, and stepping one column right
// does the reverse. Holding that across every in-region edge is what makes the
// two overlays a single rotation per region, so the centre needs no cell of its
// own.
const mirrorEdgeSpecs = new Map();
const mirrorEdgeSpec = drop => {
  if (!mirrorEdgeSpecs.has(drop)) {
    mirrorEdgeSpecs.set(drop, NFA.encodeSpec({
      startState: { phase: 0 },
      transition: (state, value) => {
        if (state.phase === 0) return { phase: 1, mine: value };
        if (state.phase === 1) return { phase: 2, same: value === state.mine };
        if (state.phase === 2) return { phase: 3, same: state.same, from: value };
        if (state.phase === 3) {
          return (!state.same || value === state.from - drop)
            ? { phase: 4 } : undefined;
        }
        return undefined;
      },
      accept: state => state.phase === 4,
    }, shape));
  }
  return mirrorEdgeSpecs.get(drop);
};

const mirrorEdges = edges.flatMap(({ cell, other, dir }) => [
  new NFA(mirrorEdgeSpec(dir.dRow), 'one rotation per region: row',
    size.at(cell), size.at(other), mirrorRow.at(cell), mirrorRow.at(other)),
  new NFA(mirrorEdgeSpec(dir.dCol), 'one rotation per region: column',
    size.at(cell), size.at(other), mirrorCol.at(cell), mirrorCol.at(other)),
]);

// A cell's image under its region's rotation lies in that same region, so the
// two name the same root -- and a region closed under its own rotation is a
// rotationally symmetrical one. Which cell the image is depends on the overlay
// values, so the rule is a disjunction over the candidates. Two bounds keep the
// branch list finite, both from the no-repeats clause plus connectedness: a
// region holds at most nine cells because its digits are distinct, so a cell and
// its image are at most eight orthogonal steps apart, and an image `d` steps
// away needs a region of at least `d + 1` cells to carry a path between them.
const MAX_REGION = 9;   // nine symbols, no repeats in a region
const mirrorTargets = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new Or(cells.flatMap(other => {
    const there = parseCellId(other);
    const steps = Math.abs(there.row - row) + Math.abs(there.col - col);
    if (steps > MAX_REGION - 1) return [];
    const sizes = [];
    for (let s = steps + 1; s <= MAX_REGION; s++) sizes.push(s);
    return [new And([
      new Given(mirrorRow.at(cell), there.row),
      new Given(mirrorCol.at(cell), there.col),
      new Given(size.at(cell), ...sizes),
      // A cell whose image is itself sits on its region's centre, and has
      // nothing to match against.
      ...(other === cell ? [] : [
        new SameValues(2, rootRow.at(cell), rootRow.at(other)),
        new SameValues(2, rootCol.at(cell), rootCol.at(other)),
      ]),
    ])];
  }));
});

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
  mirrorRow.toVar('rotation image row'),
  mirrorCol.toVar('rotation image column'),
  bands[0].toVar('subtree digits 1-3'),
  bands[1].toVar('subtree digits 4-6'),
  bands[2].toVar('subtree digits 7-9'),
  ...domains,
  ...rootOrder,
  ...parentChoice,
  ...subtreeSets,
  ...regionEdges,
  ...clueConstraints,
  ...mirrorEdges,
  ...mirrorTargets,
];
