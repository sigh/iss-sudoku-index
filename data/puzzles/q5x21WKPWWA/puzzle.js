// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=q5x21WKPWWA
// Source: https://cracking-the-cryptic.web.app/sudoku/BgdnTrNHN8

// Kurotto. Rules encoded below:
//   R1. Shade some cells of the empty grid.
//   R2. A cell holding a circled number is never shaded.
//   R3. A circled number is the total count of shaded cells over the distinct
//       orthogonally-connected groups of shaded cells that share an edge with
//       that circle.
// Nothing is omitted. The rules put no condition on a shaded group that touches
// no circle, and the encoding puts none on it either.
//
// The grid carries no digits, so the board is the shading itself, on a Raw grid
// with no row, column or box rule: 1 = unshaded, 2 = shaded.
//
// R3 counts groups the solver has to discover and nothing anchors them, so
// group identity is carried per cell rather than by a label per group:
//   VR, VC  row and column of the group's root cell
//   VD      distance from the cell to its root, 1 at the root
//   VP      direction of the cell's parent in the spanning tree, ROOT at the root
//   VS      number of cells in the cell's subtree
//   VG      number of cells in the whole group
// Only a group that touches a circle -- the only kind R3 speaks about -- carries
// this identity: a root has to be a cell sharing an edge with a circle, so a
// group with no such cell has no root available and every one of its cells takes
// NONE in all six overlays instead. Such a group has at most MAX_COUNT cells,
// because all of them count towards one circled number and the largest number
// drawn is 9, which is what bounds VD, VS and VG.

const shape = new Shape('10x10', 11, 'Raw');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const numRows = geometry.numRows;
const numCols = geometry.numCols;
const gridCells = graph.cells();

// The 22 drawn white circles, as [row, column, number].
const CLUES = [
  [1, 1, 2], [1, 4, 4], [1, 7, 5], [1, 10, 5],
  [2, 6, 6],
  [3, 2, 3], [3, 5, 6], [3, 8, 7],
  [4, 1, 8], [4, 10, 9],
  [5, 9, 4],
  [6, 2, 6],
  [7, 1, 5], [7, 10, 5],
  [8, 3, 3], [8, 6, 6], [8, 9, 3],
  [9, 5, 7],
  [10, 1, 5], [10, 4, 6], [10, 7, 6], [10, 10, 7],
];

const CIRCLES = CLUES.map(([row, col]) => makeCellId(row, col));
const circleSet = new Set(CIRCLES);
const MAX_COUNT = Math.max(...CLUES.map(clue => clue[2]));

const UNSHADED = 1, SHADED = 2;
// The value that says "not in a counted group", used by all six overlays.
const NONE = geometry.numValues;
// Parent direction codes. The order of STEPS is also the tie-break that picks
// one parent when a cell has several neighbours nearer the root, which is what
// makes the spanning tree unique.
const ROOT = 1, UP = 2, LEFT = 3, RIGHT = 4, DOWN = 5;
const STEPS = [[UP, -1, 0], [LEFT, 0, -1], [RIGHT, 0, 1], [DOWN, 1, 0]];
const OPPOSITE = { [UP]: DOWN, [DOWN]: UP, [LEFT]: RIGHT, [RIGHT]: LEFT };
const DIFFERENT = 1, SAME = 2;

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
// R2 keeps a circled cell unshaded, so it can never join a group: it is left out
// of the neighbour lists, of the overlays, and of the circle scans.
const neighbours = (cell) => STEPS
  .map(([code, dRow, dCol]) => ({ code, cell: graph.step(cell, dRow, dCol) }))
  .filter(n => n.cell !== null && !circleSet.has(n.cell));
const touchesCircle = (cell) => STEPS.some(([, dRow, dCol]) => {
  const next = graph.step(cell, dRow, dCol);
  return next !== null && circleSet.has(next);
});

const playCells = gridCells.filter(cell => !circleSet.has(cell));
const borderCells = playCells.filter(touchesCircle);

const rootRow = graph.makeOverlay('VR', playCells);
const rootCol = graph.makeOverlay('VC', playCells);
const depth = graph.makeOverlay('VD', playCells);
const parent = graph.makeOverlay('VP', playCells);
const subSize = graph.makeOverlay('VS', playCells);
const grpSize = graph.makeOverlay('VG', playCells);

const overlays = [
  rootRow.toVar('root row'), rootCol.toVar('root col'),
  depth.toVar('root distance'), parent.toVar('parent'),
  subSize.toVar('subtree size'), grpSize.toVar('group size'),
];

// Var cells take the grid's value range, so each is restricted to the values its
// role actually uses; an unrestricted overlay cell would be free state.
const domains = [
  graph.makeReplicate(new Given(gridCells[0], UNSHADED, SHADED)),
  ...CIRCLES.map(cell => new Given(cell, UNSHADED)),                      // R2
  rootRow.makeReplicate(
    new Given(rootRow.cells()[0], ...range(1, numRows), NONE)),
  rootCol.makeReplicate(
    new Given(rootCol.cells()[0], ...range(1, numCols), NONE)),
  depth.makeReplicate(
    new Given(depth.cells()[0], ...range(1, MAX_COUNT), NONE)),
  subSize.makeReplicate(
    new Given(subSize.cells()[0], ...range(1, MAX_COUNT), NONE)),
  grpSize.makeReplicate(
    new Given(grpSize.cells()[0], ...range(1, MAX_COUNT), NONE)),
  // ROOT is offered only where a root is allowed to be: a cell sharing an edge
  // with a circle.
  ...playCells.map(cell => new Given(parent.at(cell),
    ...(touchesCircle(cell) ? [ROOT] : []),
    ...neighbours(cell).map(n => n.code), NONE)),
];

const specCache = new Map();
const spec = (key, build) => {
  if (!specCache.has(key)) specCache.set(key, build());
  return specCache.get(key);
};

// A cell is in a counted group exactly when its overlays are not NONE, and then
// it is shaded. At a cell along a circle the two are the same thing, since the
// group it belongs to touches that circle.
const linkSpec = (border) => NFA.encodeSpec({
  startState: { ph: 0, s: 0, mode: 0 },
  transition: (st, value) => {
    if (st.ph === 0) {
      if (value > SHADED) return undefined;
      return { ph: 1, s: value, mode: 0 };
    }
    if (st.ph > 6) return undefined;
    const mode = value === NONE ? 1 : 2;      // 1 = uncounted, 2 = counted
    if (st.ph === 1) {
      if (mode === 2 && st.s !== SHADED) return undefined;
      if (border && mode === 1 && st.s === SHADED) return undefined;
      return { ph: 2, s: 0, mode };
    }
    if (mode !== st.mode) return undefined;
    return { ph: st.ph + 1, s: 0, mode: st.mode };
  },
  accept: (st) => st.ph === 7,
}, shape);

const links = playCells.map(cell => new NFA(
  spec(`link${touchesCircle(cell) ? 'B' : ''}`,
    () => linkSpec(touchesCircle(cell))),
  'counted', cell, rootRow.at(cell), rootCol.at(cell), depth.at(cell),
  parent.at(cell), subSize.at(cell), grpSize.at(cell)));

// The root carries its own coordinates, and no cell of a group that shares an
// edge with a circle precedes its root in reading order, so the root is the
// first such cell of the group -- one choice of root per group, not one per cell.
const rootIsFirst = borderCells.flatMap(cell => {
  const { row, col } = parseCellId(cell);
  const index = (row - 1) * numCols + col;
  return [
    new Pair(Pair.fnToKey((p, r) => p !== ROOT || r === row, shape),
      'root row', parent.at(cell), rootRow.at(cell)),
    new Pair(Pair.fnToKey((p, c) => p !== ROOT || c === col, shape),
      'root col', parent.at(cell), rootCol.at(cell)),
    new Pair(Pair.fnToKey(
      (r, c) => (r === NONE && c === NONE) ||
        (r <= numRows && c <= numCols && (r - 1) * numCols + c <= index),
      shape),
      'root first', rootRow.at(cell), rootCol.at(cell)),
  ];
});

// Two orthogonally adjacent shaded cells are in the same group, so they agree on
// the root that names it and on the group's size.
const adjacencySpec = () => NFA.encodeSpec({
  startState: { ph: 0, s: 0, same: 0, x: 0 },
  transition: (st, value) => {
    const ph = st.ph;
    if (ph >= 8) return undefined;
    if (ph === 0) {
      if (value > SHADED) return undefined;
      return { ph: 1, s: value, same: 0, x: 0 };
    }
    if (ph === 1) {
      if (value > SHADED) return undefined;
      return {
        ph: 2, s: 0, same: (st.s === SHADED && value === SHADED) ? 1 : 0, x: 0,
      };
    }
    if (ph % 2 === 0) {
      return { ph: ph + 1, s: 0, same: st.same, x: st.same ? value : 0 };
    }
    if (st.same && value !== st.x) return undefined;
    return { ph: ph + 1, s: 0, same: st.same, x: 0 };
  },
  accept: (st) => st.ph === 8,
}, shape);

const adjacency = playCells.flatMap(a => [[0, 1], [1, 0]].flatMap(
  ([dRow, dCol]) => {
    const b = graph.step(a, dRow, dCol);
    if (b === null || circleSet.has(b)) return [];
    return [new NFA(spec('adjacency', adjacencySpec), 'group',
      a, b, rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b),
      grpSize.at(a), grpSize.at(b))];
  }));

// Root distance and parent choice. A cell of a counted group is one step further
// from the root than the nearest of its neighbours in the group (the root, at 1,
// has none nearer), and its parent is the first neighbour in STEPS order at that
// nearer distance. Requiring no neighbour to be nearer than that is what makes VD
// the distance rather than the length of some longer walk, and a parent one step
// nearer is also what keeps the parent pointers free of cycles.
const treeSpec = (dirCodes) => {
  const END = 2 + dirCodes.length;
  return NFA.encodeSpec({
    startState: { ph: 0, p: 0, v: 0, seen: 0 },
    transition: (st, value) => {
      const ph = st.ph;
      if (ph >= END) return undefined;
      if (ph === 0) return { ph: 1, p: value, v: 0, seen: 0 };
      if (ph === 1) {
        if (st.p === NONE) {
          if (value !== NONE) return undefined;
        } else if (st.p === ROOT) {
          if (value !== 1) return undefined;
        } else if (value < 2 || value > MAX_COUNT) return undefined;
        return { ph: 2, p: st.p, v: value, seen: 0 };
      }
      if (st.v === NONE) return { ph: ph + 1, p: st.p, v: st.v, seen: 0 };
      const code = dirCodes[ph - 2];
      if (value === NONE) {
        if (st.p === code) return undefined;
        return { ph: ph + 1, p: st.p, v: st.v, seen: st.seen };
      }
      if (value < st.v - 1) return undefined;
      const nearer = value === st.v - 1;
      if (nearer && !st.seen) {
        if (st.p !== code) return undefined;
      } else if (st.p === code) {
        return undefined;
      }
      return {
        ph: ph + 1, p: st.p, v: st.v, seen: st.seen || (nearer ? 1 : 0),
      };
    },
    accept: (st) => st.ph === END,
  }, shape);
};

const tree = playCells.map(cell => {
  const ns = neighbours(cell);
  const dirCodes = ns.map(n => n.code);
  return new NFA(
    spec(`tree${dirCodes.join('')}`, () => treeSpec(dirCodes)),
    'tree', parent.at(cell), depth.at(cell),
    ...ns.map(n => depth.at(n.cell)));
});

// A cell's subtree holds itself plus the subtrees of its children -- the
// neighbours whose parent pointer comes back at it.
const subtreeSpec = (backCodes) => {
  const END = 1 + 2 * backCodes.length;
  return NFA.encodeSpec({
    startState: { ph: 0, want: 0, sum: 0, child: 0 },
    transition: (st, value) => {
      const ph = st.ph;
      if (ph >= END) return undefined;
      if (ph === 0) {
        if (value !== NONE && value > MAX_COUNT) return undefined;
        return {
          ph: 1, want: value === NONE ? 0 : value - 1, sum: 0, child: 0,
        };
      }
      if (ph % 2 === 1) {
        return {
          ph: ph + 1, want: st.want, sum: st.sum,
          child: value === backCodes[(ph - 1) >> 1] ? 1 : 0,
        };
      }
      let sum = st.sum;
      if (st.child) {
        if (value === NONE) return undefined;
        sum += value;
        if (sum > st.want) return undefined;
      }
      return { ph: ph + 1, want: st.want, sum, child: 0 };
    },
    accept: (st) => st.ph === END && st.sum === st.want,
  }, shape);
};

const subtrees = playCells.map(cell => {
  const ns = neighbours(cell);
  const backCodes = ns.map(n => OPPOSITE[n.code]);
  const cells = [subSize.at(cell)];
  for (const n of ns) cells.push(parent.at(n.cell), subSize.at(n.cell));
  return new NFA(
    spec(`subtree${backCodes.join('')}`, () => subtreeSpec(backCodes)),
    'subtree size', ...cells);
});

// The group's size is seeded at the root, where the subtree is the whole group;
// elsewhere the adjacency machines have already carried it across the group.
const seedSpec = () => NFA.encodeSpec({
  startState: { ph: 0, root: 0, x: 0 },
  transition: (st, value) => {
    if (st.ph === 0) return { ph: 1, root: value === ROOT ? 1 : 0, x: 0 };
    if (st.ph === 1) return { ph: 2, root: st.root, x: value };
    if (st.ph === 2) {
      if (st.root && value !== st.x) return undefined;
      return { ph: 3, root: 0, x: 0 };
    }
    return undefined;
  },
  accept: (st) => st.ph === 3,
}, shape);

const groupSeed = borderCells.map(cell => new NFA(
  spec('seed', seedSpec), 'group size',
  parent.at(cell), subSize.at(cell), grpSize.at(cell)));

// R3. Two neighbours of a circle lie in the same group exactly when they carry
// the same root, so a same-root flag per neighbour pair is what stops a group
// that touches the circle twice from being counted twice.
const sameRootSpec = () => NFA.encodeSpec({
  startState: { ph: 0, a: 0, eq: 0 },
  transition: (st, value) => {
    if (st.ph === 0) return { ph: 1, a: value, eq: 0 };
    if (st.ph === 1) return { ph: 2, a: 0, eq: value === st.a ? 1 : 0 };
    if (st.ph === 2) return { ph: 3, a: value, eq: st.eq };
    if (st.ph === 3) {
      return { ph: 4, a: 0, eq: (st.eq && value === st.a) ? 1 : 0 };
    }
    if (st.ph === 4) {
      if (value !== (st.eq ? SAME : DIFFERENT)) return undefined;
      return { ph: 5, a: 0, eq: 0 };
    }
    return undefined;
  },
  accept: (st) => st.ph === 5,
}, shape);

// R3 itself: the circled number counts every shaded cell of every distinct group
// along the circle's edges. A neighbour whose group an earlier neighbour already
// contributed is dropped from the total.
const kurottoSpec = (k, total) => {
  const bitPairs = [];
  for (let j = 1; j < k; j++) for (let i = 0; i < j; i++) bitPairs.push([i, j]);
  const AFTER_SHADE = k;
  const AFTER_BITS = AFTER_SHADE + bitPairs.length;
  const END = AFTER_BITS + k;
  return NFA.encodeSpec({
    startState: { ph: 0, sv: 0, ex: 0, inc: 0, tot: 0 },
    transition: (st, value) => {
      const ph = st.ph;
      if (ph >= END) return undefined;
      if (ph < AFTER_SHADE) {
        if (value > SHADED) return undefined;
        return {
          ph: ph + 1, sv: st.sv | (value === SHADED ? 1 << ph : 0),
          ex: 0, inc: 0, tot: 0,
        };
      }
      if (ph < AFTER_BITS) {
        const [i, j] = bitPairs[ph - AFTER_SHADE];
        const merged = value === SAME && ((st.sv >> i) & 1);
        return {
          ph: ph + 1, sv: st.sv, ex: st.ex | (merged ? 1 << j : 0),
          inc: 0, tot: 0,
        };
      }
      // Entering the sizes: fix which neighbours are counted, then shed one bit
      // per neighbour so the state does not carry finished neighbours.
      const inc = ph === AFTER_BITS ? (st.sv & ~st.ex) : (st.inc >> 1);
      let tot = st.tot;
      if (inc & 1) {
        if (value === NONE) return undefined;
        tot += value;
        if (tot > total) return undefined;
      }
      return { ph: ph + 1, sv: 0, ex: 0, inc, tot };
    },
    accept: (st) => st.ph === END && st.tot === total,
  }, shape);
};

const numFlags = CLUES.reduce((n, [row, col]) => {
  const k = neighbours(makeCellId(row, col)).length;
  return n + k * (k - 1) / 2;
}, 0);
const sameRoot = new Var('K', 'same group', numFlags);
let flagIndex = 0;
const circleFlags = [];
const circleCounts = CLUES.map(([row, col, total]) => {
  const targets = neighbours(makeCellId(row, col)).map(n => n.cell);
  const k = targets.length;
  const flags = [];
  for (let j = 1; j < k; j++) {
    for (let i = 0; i < j; i++) {
      const flag = sameRoot.cell(++flagIndex);
      flags.push(flag);
      // The machine reads the flag last and accepts only SAME or DIFFERENT, so
      // the flag needs no separate domain restriction.
      circleFlags.push(
        new NFA(spec('sameRoot', sameRootSpec), 'same group',
          rootRow.at(targets[i]), rootRow.at(targets[j]),
          rootCol.at(targets[i]), rootCol.at(targets[j]), flag));
    }
  }
  return new NFA(
    spec(`kurotto${k}:${total}`, () => kurottoSpec(k, total)), 'circle',
    ...targets, ...flags, ...grpSize.at(targets));
});

return [
  shape,
  ...overlays,
  sameRoot,
  ...domains,
  ...links,
  ...rootIsFirst,
  ...adjacency,
  ...tree,
  ...subtrees,
  ...groupSeed,
  ...circleFlags,
  ...circleCounts,
];
