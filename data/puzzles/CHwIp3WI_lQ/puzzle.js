// Title: Arithmetic Quiz Fillomino
// Author: mnasti2
// Video: https://www.youtube.com/watch?v=CHwIp3WI_lQ
// Source: https://sudokupad.app/RbbMbjH6rH

// 7x8 grid, Raw (digits repeat in rows/columns; no boxes -- the rules never
// name either). Two rules are encoded:
//  (1) Fillomino: the grid divides into orthogonally connected regions, no
//      two same-sized regions may share an edge, and every cell's digit
//      equals its own region's size (so every region has 1-9 cells -- a
//      single digit). This is modelled as a per-cell region-identity tree
//      (root/parent/depth/subtree-size), not as anything solved out of band:
//      the partition is exactly what the solver searches over.
//  (2) Five row equations (rows 1-4 and 6; rows 5 and 7 carry no equation),
//      read from small circles (single-digit operands), 2-cell rounded pills
//      (two-digit numbers, tens digit first), and +/-/x//'=' glyphs between
//      them, and operator glyphs printed in the gaps. Two rows (1, 2)
//      involve a product/quotient and are encoded with a small custom NFA
//      each, since ISS has no multiplication primitive; the rest are linear
//      and use a coefficient `Sum`.
// Column-1 givens (R1C1=1, R2C1=2, R3C1=3, R4C1=4, R6C1=5) are ordinary
// Fillomino digits, drawn as plain cell givens down column 1 -- they merely
// coincide with which rows carry an equation.

const shape = new Shape('7x8', 9, 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

const MAX_REGION = 9; // a region's digit is single-digit, so size <= 9.

// ---------------------------------------------------------------------
// Fillomino region identity: a spanning tree per connected same-digit
// region, carried on four whole-grid overlays (parent pointer, depth from
// root, and the root's row/column), plus a fifth overlay accumulating each
// cell's subtree cell-count up to the root. The main grid digit itself is
// used wherever a separate "region size" value would otherwise be needed,
// since this puzzle's rule makes them the same number.
const parent = graph.makeOverlay('VP');
const depth = graph.makeOverlay('VD');
const rootRow = graph.makeOverlay('VR');
const rootCol = graph.makeOverlay('VK');
const count = graph.makeOverlay('VC'); // cells in this cell's own subtree

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

// Reads [count(cell), then parent(n), count(n) for each neighbour n]. The
// state carries how much of the cell's own count is still to be accounted
// for: 1 for the cell itself, then each child's count subtracted off (a
// neighbour is a child exactly when its parent pointer names this cell).
// Ending at exactly 0 is what makes `count` the true subtree size rather
// than any other number consistent with the local pointers.
const countSpecs = new Map();
const countSpec = expected => {
  const key = expected.join('_');
  if (!countSpecs.has(key)) {
    countSpecs.set(key, NFA.encodeSpec({
      startState: { i: -1, remaining: 0, child: null },
      transition: (state, value) => {
        if (state.i === -1) return { i: 0, remaining: value - 1, child: null };
        if (state.i >= expected.length) return undefined;
        if (state.child === null) {
          return { i: state.i, remaining: state.remaining, child: value === expected[state.i] };
        }
        if (!state.child) return { i: state.i + 1, remaining: state.remaining, child: null };
        return state.remaining >= value
          ? { i: state.i + 1, remaining: state.remaining - value, child: null } : undefined;
      },
      accept: state => state.i === expected.length && state.remaining === 0,
    }, shape));
  }
  return countSpecs.get(key);
};

const subtreeCounts = cells.map(cell => {
  const neighbours = neighboursOf(cell);
  const expected = neighbours.map(entry => entry.dir.back);
  return new NFA(countSpec(expected), 'subtree cell count',
    count.at(cell), ...neighbours.flatMap(({ other }) => [parent.at(other), count.at(other)]));
});

// Reads [digit(a), digit(b), root-coord(a), root-coord(b)] for one orthogonal
// edge: cells with equal digit are, by the Fillomino rule, in the same
// region (two adjacent regions of that size would violate the no-touch
// rule), so they must name the same root. Used once for the root's row and
// once for its column -- this is "no two same-sized regions share an edge",
// checked over every edge, not only tree edges.
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
// `depth` the true distance rather than any other number the local pointers
// would tolerate.
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
  .filter(dir => dir.dRow > 0 || dir.dCol > 0) // each edge once
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

// Reads [digit(cell), digit(other), depth(cell), depth(other)] and rejects
// the case where `other` could have served as this cell's parent (same
// digit, one step nearer the root). Applied to each earlier-in-DIRS-order
// neighbour of the one actually chosen, this makes the parent the first
// eligible same-digit neighbour, so the tree is a function of the region
// rather than a free choice -- an unpinned choice would multiply the
// measured solution count without changing the puzzle.
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
      // The root's own subtree is the whole region, so its count must equal
      // its own digit -- "a region's size is its own cell count".
      new SameValues(2, cell, count.at(cell)),
    ]),
    ...neighbours.map(({ dir, other }, k) => new And([
      new Given(parent.at(cell), dir.code),
      new SameValues(2, cell, other), // same region -> same digit
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

// The root of every region is its first cell in reading order -- this
// model's choice of representative, not the puzzle's, so it is pinned the
// same way for every region (no region carries a clue that would root it
// elsewhere).
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

const parentValues = [ROOT, ...DIRS.map(dir => dir.code)];
const rowValues = Array.from({ length: 7 }, (_, i) => i + 1);
const colValues = Array.from({ length: 8 }, (_, i) => i + 1);
const domains = [
  parent.makeReplicate(new Given(parent.cells()[0], ...parentValues)),
  rootRow.makeReplicate(new Given(rootRow.cells()[0], ...rowValues)),
  rootCol.makeReplicate(new Given(rootCol.cells()[0], ...colValues)),
];

// ---------------------------------------------------------------------
// Column 1 givens (rows 5 and 7 carry no column-1 digit and no equation).
const columnGivens = [
  new Given('R1C1', 1), new Given('R2C1', 2), new Given('R3C1', 3),
  new Given('R4C1', 4), new Given('R6C1', 5),
];

// ---------------------------------------------------------------------
// Row equations. Builds a small NFA over an ordered cell list from per-cell
// step functions `(acc, value) -> acc | undefined`; `acc` carries whatever
// partial arithmetic a shape needs, `undefined` rejects. Accepts iff every
// step consumed a cell and the final `acc.ok` is true.
function chainNFA(steps) {
  return NFA.encodeSpec({
    startState: { i: 0, acc: {} },
    transition: (state, value) => {
      const step = steps[state.i];
      if (!step) return undefined;
      const acc = step(state.acc, value);
      if (acc === undefined) return undefined;
      return { i: state.i + 1, acc };
    },
    accept: state => state.i === steps.length && !!state.acc.ok,
  }, shape);
}
function nfa(steps, label, ...nfaCells) {
  return new NFA(chainNFA(steps), label, ...nfaCells);
}

// 10*A + B = C * (10*D + E) -- cells read [C, D, E, A, B] (the divisor and
// the second pill's digits first, so the running product is computed and
// compared digit-by-digit against the first pill without ever holding both
// two-digit numbers live at once). Row 1: R1C2R1C3 / R1C4 = R1C5R1C6.
const twoDigitEqDigitTimesTwoDigit = [
  (acc, v) => ({ factor: v }),
  (acc, v) => ({ factor: acc.factor, tens: v }),
  (acc, v) => ({ product: acc.factor * (acc.tens * 10 + v) }),
  (acc, v) => (Math.floor(acc.product / 10) === v ? { product: acc.product } : undefined),
  (acc, v) => (acc.product % 10 === v ? { ok: true } : undefined),
];

// 10*A + B = C * D -- cells read [C, D, A, B]. Row 2: R2C2 x R2C3 = R2C4R2C5.
const twoDigitEqDigitTimesDigit = [
  (acc, v) => ({ factor: v }),
  (acc, v) => ({ product: acc.factor * v }),
  (acc, v) => (Math.floor(acc.product / 10) === v ? { product: acc.product } : undefined),
  (acc, v) => (acc.product % 10 === v ? { ok: true } : undefined),
];

const rowEquations = [
  // Row 1: R1C2R1C3 / R1C4 = R1C5R1C6
  nfa(twoDigitEqDigitTimesTwoDigit, 'row1',
    'R1C4', 'R1C5', 'R1C6', 'R1C2', 'R1C3'),

  // Row 2: R2C2 x R2C3 = R2C4R2C5
  nfa(twoDigitEqDigitTimesDigit, 'row2',
    'R2C2', 'R2C3', 'R2C4', 'R2C5'),

  // Row 3: R3C2R3C3 + R3C4 = R3C5R3C6 (linear -- coefficient Sum)
  new Sum(0, ['R3C2', 10], 'R3C3', 'R3C4', ['R3C5', -10], ['R3C6', -1]),

  // Row 4: R4C2 + R4C3 = R4C4 (linear -- equal-sum segments)
  new EqualSum(['R4C2', 'R4C3'], ['R4C4']),

  // Row 6: R6C2R6C3 + R6C4 - R6C5 = R6C6R6C7 (linear -- coefficient Sum)
  new Sum(0, ['R6C2', 10], 'R6C3', 'R6C4', ['R6C5', -1], ['R6C6', -10], ['R6C7', -1]),
];

return [
  shape,
  parent.toVar('parent pointer'),
  depth.toVar('depth from root'),
  rootRow.toVar('root row'),
  rootCol.toVar('root column'),
  count.toVar('subtree cell count'),
  ...domains,
  ...columnGivens,
  ...rootOrder,
  ...parentChoice,
  ...subtreeCounts,
  ...regionEdges,
  ...rowEquations,
];
