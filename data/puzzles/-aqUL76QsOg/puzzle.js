// Title: Fill-a-Renban
// Author: SSG
// Video: https://www.youtube.com/watch?v=-aqUL76QsOg
// Source: https://app.crackingthecryptic.com/sudoku/dffJr73j2F

// Rules encoded here, in full:
//  * Normal sudoku.
//  * Fillomino: divide the grid into orthogonally connected regions such that
//    no two regions of the same size share an edge; the two cells either side
//    of a green wall are in different regions; a given digit is the size of the
//    region it appears in; every region includes a digit equal to its size.
//  * Renban: each region holds a non-repeating set of consecutive digits.
//
// Nothing is omitted. A region's digits are distinct, so a region never holds
// more than nine cells, and the region sizes fit the 1-9 alphabet exactly.
//
// The region sizes are carried on their own whole-grid overlay `VA`, which
// makes them a Fillomino grid in the classical sense: a region is the
// orthogonally connected run of equal `VA` values containing a cell, that run
// has as many cells as the value written in it, and two runs of equal value can
// never touch, which is the "no two regions of the same size share an edge"
// clause. A green wall is then just "these two cells differ in VA".

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const cells = graph.cells();
const numValues = graph.gridGeometry().numValues;

// Transcribed from the 13 printed digits: [row, col, digit]. Each is both the
// cell's sudoku digit and the size of the region containing it.
const GIVENS = [
  [1, 1, 6], [1, 3, 3], [1, 8, 5], [3, 2, 4], [3, 9, 7], [4, 1, 4],
  [4, 5, 6], [5, 5, 3], [7, 3, 4], [7, 8, 9], [8, 9, 5], [9, 2, 5],
  [9, 6, 7],
];

// Transcribed from the two green wall segments drawn on cell borders: each
// names the pair of cells the wall runs between.
const WALLS = [
  ['R1C2', 'R1C3'],
  ['R8C7', 'R9C7'],
];

// Each region is modelled as a rooted tree over its own cells. The overlays are
// bookkeeping rather than puzzle content, apart from `VA`:
//   VA  region size, the Fillomino value;
//   VP  ROOT, or the direction of the cell one step nearer the root;
//   VD  depth, steps from the root counting the root as 1;
//   VR  root row;
//   VC  root column;
//   VM/VN/VQ  three bits each of the set of digits in this cell's subtree.
const area = graph.makeOverlay('VA');
const parent = graph.makeOverlay('VP');
const depth = graph.makeOverlay('VD');
const rootRow = graph.makeOverlay('VR');
const rootCol = graph.makeOverlay('VC');
const maskParts = ['VM', 'VN', 'VQ'].map(prefix => graph.makeOverlay(prefix));

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

// --- The digit set of a region ------------------------------------------
// A region's digits are held as a nine-bit set, bit d-1 for digit d, split
// across three overlays of three bits each because a Var cell holds one of nine
// values and so carries three bits. A cell's stored value is its mask plus one,
// so masks 0-7 are stored as 1-8.
const BITS_PER_PART = 3;
const NUM_PARTS = maskParts.length;
const MASK_VALUES = 1 << BITS_PER_PART;   // 8 masks per overlay cell

const partOfDigit = digit => Math.floor((digit - 1) / BITS_PER_PART);
const bitOfDigit = digit => 1 << ((digit - 1) % BITS_PER_PART);

// The digit sets a region of `size` may hold: `size` consecutive digits
// including the digit `size` itself, so the lowest digit runs from 1 up to
// `size`, and the highest, size + lo - 1, must still be a digit.
const lowestDigits = size => {
  const limit = Math.min(size, numValues - size + 1);
  return Array.from({ length: limit }, (_, i) => i + 1);
};
const partBits = (size, lowest, part) =>
  (((1 << size) - 1) << (lowest - 1)) >> (part * BITS_PER_PART) & (MASK_VALUES - 1);

// Reads [digit(cell), then VP and this part's mask for each neighbour in a
// fixed order, then this part's mask for the cell itself]. A cell's subtree set
// is its own digit plus the sets of exactly the neighbours pointing back at it,
// and those sets must be disjoint: a digit appearing twice in one region is
// rejected here, at the cell where the two subtrees meet.
const maskSpecs = new Map();
const maskSpec = (part, expected) => {
  const key = part + ':' + expected.join('_');
  if (!maskSpecs.has(key)) {
    maskSpecs.set(key, NFA.encodeSpec({
      startState: { phase: 'own' },
      transition: (state, value) => {
        if (state.phase === 'own') {
          const bit = partOfDigit(value) === part ? bitOfDigit(value) : 0;
          return { phase: 'scan', i: 0, acc: bit, child: null };
        }
        if (state.phase !== 'scan') return undefined;
        if (state.i === expected.length) {
          // The cell's own mask closes the scan.
          return value - 1 === state.acc ? { phase: 'done' } : undefined;
        }
        if (state.child === null) {
          return {
            phase: 'scan', i: state.i, acc: state.acc,
            child: value === expected[state.i],
          };
        }
        if (!state.child) {
          return { phase: 'scan', i: state.i + 1, acc: state.acc, child: null };
        }
        if (value > MASK_VALUES) return undefined;
        const childMask = value - 1;
        if (childMask & state.acc) return undefined;   // digit seen twice
        return {
          phase: 'scan', i: state.i + 1, acc: state.acc | childMask, child: null,
        };
      },
      accept: state => state.phase === 'done',
    }, shape));
  }
  return maskSpecs.get(key);
};

const subtreeSets = cells.flatMap(cell => {
  const neighbours = neighboursOf(cell);
  const expected = neighbours.map(entry => entry.dir.back);
  return maskParts.map((masks, part) => new NFA(
    maskSpec(part, expected), 'subtree digit set',
    cell,
    ...neighbours.flatMap(({ other }) => [parent.at(other), masks.at(other)]),
    masks.at(cell)));
});

// Reads [VP(cell), VA(cell), then the cell's three mask parts]. At a root the
// subtree set is the whole region's digit set, so this is where Fillomino and
// Renban meet: the set must be `VA` consecutive digits including the digit
// `VA`. Every cell contributes exactly one bit and the bits are disjoint, so
// the set also counts the region's cells -- a set of VA digits is a region of
// VA cells, which is the "a given digit is the size of its region" clause.
const rootSetSpec = NFA.encodeSpec({
  startState: { phase: 'parent' },
  transition: (state, value) => {
    if (state.phase === 'parent') {
      return value === ROOT
        ? { phase: 'size' }
        : { phase: 'skip', left: 1 + NUM_PARTS };
    }
    if (state.phase === 'skip') {
      return state.left > 1
        ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
    }
    if (state.phase === 'size') {
      return { phase: 'set', size: value, part: 0, lows: lowestDigits(value) };
    }
    if (state.phase === 'set') {
      const lows = state.lows.filter(
        low => partBits(state.size, low, state.part) === value - 1);
      if (!lows.length) return undefined;
      return state.part === NUM_PARTS - 1
        ? { phase: 'done' }
        : { phase: 'set', size: state.size, part: state.part + 1, lows };
    }
    return undefined;
  },
  accept: state => state.phase === 'done',
}, shape);

const rootSets = cells.map(cell => new NFA(
  rootSetSpec, 'region digit set',
  parent.at(cell), area.at(cell), ...maskParts.map(masks => masks.at(cell))));

// --- The region tree ----------------------------------------------------
// Reads [VA(a), VA(b), label(a), label(b)] for one orthogonal edge: neighbours
// of equal size are in the same region and so must name the same root. This is
// what stops two equal-size regions sharing an edge -- the edge between them
// would have to carry two different roots.
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

// Reads [VA(a), VA(b), VD(a), VD(b)]: within a region no step may change the
// distance to the root by more than one, which is what makes VD the true
// distance rather than any descending chain.
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
    area.at(cell), area.at(other), rootRow.at(cell), rootRow.at(other)),
  new NFA(rootEdgeSpec, 'same region root column',
    area.at(cell), area.at(other), rootCol.at(cell), rootCol.at(other)),
  new NFA(depthEdgeSpec, 'depth changes by one',
    area.at(cell), area.at(other), depth.at(cell), depth.at(other)),
]);

// Reads [VA(cell), VA(other), VD(cell), VD(other)] and rejects the case where
// `other` could have served as the parent. Placed on the earlier directions of
// each branch, it makes the parent the first eligible neighbour in DIRS order,
// so the tree is fixed by the region rather than chosen.
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

// Every cell is either the root of its region or hangs off a neighbour of the
// same size, copying that neighbour's root labels and sitting one step further
// from the root. Combined with the edge machines above, a region is exactly the
// connected run of equal VA values, held as one tree.
const parentChoice = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  const neighbours = neighboursOf(cell);
  return new Or([
    new And([
      new Given(parent.at(cell), ROOT),
      new Given(depth.at(cell), 1),
      new Given(rootRow.at(cell), row),
      new Given(rootCol.at(cell), col),
    ]),
    ...neighbours.map(({ dir, other }, k) => new And([
      new Given(parent.at(cell), dir.code),
      new SameValues(2, area.at(cell), area.at(other)),
      new SameValues(2, rootRow.at(cell), rootRow.at(other)),
      new SameValues(2, rootCol.at(cell), rootCol.at(other)),
      new Pair(depthStep, 'one step nearer the root',
        depth.at(cell), depth.at(other)),
      ...neighbours.slice(0, k).map(earlier => new NFA(
        notParentSpec, 'earlier neighbour is not a parent',
        area.at(cell), area.at(earlier.other),
        depth.at(cell), depth.at(earlier.other))),
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

const parentValues = [ROOT, ...DIRS.map(dir => dir.code)];
const maskValues = Array.from({ length: MASK_VALUES }, (_, i) => i + 1);

return [
  shape,
  area.toVar('region size'),
  parent.toVar('parent pointer'),
  depth.toVar('depth from root'),
  rootRow.toVar('root row'),
  rootCol.toVar('root column'),
  ...maskParts.map((masks, part) => masks.toVar(
    'digits ' + (part * BITS_PER_PART + 1) + '-' +
    (part * BITS_PER_PART + BITS_PER_PART) + ' of the subtree set')),
  parent.makeReplicate(new Given(parent.cells()[0], ...parentValues)),
  ...maskParts.map(
    masks => masks.makeReplicate(new Given(masks.cells()[0], ...maskValues))),
  ...GIVENS.flatMap(([row, col, digit]) => {
    const cell = makeCellId(row, col);
    // A given digit does double duty: the sudoku digit and its region's size.
    return [new Given(cell, digit), new Given(area.at(cell), digit)];
  }),
  ...cells.map(cell => {
    const { row, col } = parseCellId(cell);
    return new Pair(rootOrderKey(row, col), 'root comes first in reading order',
      rootRow.at(cell), rootCol.at(cell));
  }),
  ...parentChoice,
  ...regionEdges,
  ...subtreeSets,
  ...rootSets,
  // A green wall puts its two cells in different regions. Regions of equal size
  // never share an edge, so different regions across an edge is exactly
  // different sizes across it.
  ...WALLS.map(([a, b]) => new AllDifferent(area.at(a), area.at(b))),
];
