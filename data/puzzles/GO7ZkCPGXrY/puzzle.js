// Title: Tunnel Vision (12x12)
// Author: Agent
// Video: https://www.youtube.com/watch?v=GO7ZkCPGXrY
// Source: https://app.crackingthecryptic.com/sudoku/4J83LHrpL4

// Rules encoded:
//  * Fillomino. Divide the grid into orthogonally connected regions; every
//    cell holds the size of its own region, and two regions of equal size may
//    never be orthogonally adjacent (which is the same rule as "two adjacent
//    cells with equal numbers always belong to the same region"). No Sudoku
//    layer: the grid is Raw and values repeat freely. Region sizes run 1-9,
//    the board's own digit alphabet.
//  * Arrow cells. A cell with one or more arrows carries a small number N in
//    its top-left corner. Each drawn arrow direction (up/down/left/right)
//    points at a nearest occurrence of digit N along that ray, and the number
//    placed in the arrow cell itself -- its own region-size value -- is the
//    distance to that nearest occurrence. A direction with no arrow must NOT
//    have an occurrence of N at or before that same distance (so a direction
//    achieving the true nearest distance always gets an arrow: ties get more
//    than one).
//  * Three arrow cells (R5C12, R8C8, R12C2) are printed with no corner
//    number. Which digit each refers to is left to the solver, so N there is
//    a free 1-9 Var rather than a literal: disjoining over the candidate
//    values is the puzzle's own quantifier over "the number in the corner",
//    not a resolved-out-of-band shortcut.
//  * The heavy black board outline is the frame, not a drawn wall, and needs
//    no constraint.
//
// Region-identity construction (per-cell root/depth, no anchors): each cell
// names its region's root -- the region's own first cell in reading order --
// as a (row, column) pair, plus its own distance from that root. Depth only
// needs range 0-8 (max region size 9), so a single absolute-distance overlay
// suffices (no residue-pair split is needed the way a size-to-100 board
// would). Four whole-grid layers total (the board plus rootRow/rootCol/depth)
// spend 576 of the 1000 MAX_SEARCH_CELLS cells.

const SIDE = 12;
const MAX_AREA = 9; // the board's own digit alphabet caps every region here

const shape = new Shape('12x12', '0-12', 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

// rootRow/rootCol name each cell's region root (its first cell in reading
// order); depth is that cell's distance from the root, 0 at the root itself.
const rootRow = graph.makeOverlay('VR');
const rootCol = graph.makeOverlay('VC');
const depth = graph.makeOverlay('VD');

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
const restrict = (overlay, values) =>
  overlay.makeReplicate(new Given(overlay.cells()[0], ...values));
const domains = [
  graph.makeReplicate(new Given(cells[0], ...range(1, 9))),
  restrict(rootRow, range(1, SIDE)),
  restrict(rootCol, range(1, SIDE)),
  restrict(depth, range(0, MAX_AREA - 1)),
];

// Reads [rootRow, rootCol, depth] of one cell. The named root must not come
// after the cell in reading order, and depth is 0 exactly when the cell is
// its own root.
const rootSpecs = new Map();
const rootSpec = (row, col) => {
  const key = row + '_' + col;
  if (!rootSpecs.has(key)) {
    rootSpecs.set(key, NFA.encodeSpec({
      startState: { phase: 0 },
      transition: (state, value) => {
        if (state.phase === 0) {
          return value <= row ? { phase: 1, rowEq: value === row } : undefined;
        }
        if (state.phase === 1) {
          if (state.rowEq && value > col) return undefined;
          return { phase: 2, self: state.rowEq && value === col };
        }
        if (state.phase === 2) {
          return (value === 0) === state.self ? { phase: 3 } : undefined;
        }
        return undefined;
      },
      accept: state => state.phase === 3,
    }, shape));
  }
  return rootSpecs.get(key);
};

const roots = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new NFA(rootSpec(row, col), 'root is first in reading order',
    rootRow.at(cell), rootCol.at(cell), depth.at(cell));
});

// Every non-root cell has an orthogonal same-region neighbour exactly one
// step nearer the root (depth one less). Combined with the edge rule below
// (same region -> depth differs by at most 1 with every same-region
// neighbour, not just the descent one), depth is pinned to the true BFS
// distance rather than left free to relabel a fixed region with a different,
// equally "locally decreasing" set of depth numbers.
const oneNearer = Pair.fnToKey((mine, other) => other === mine - 1, shape);
const descents = cells.map(cell => new Or([
  new Given(depth.at(cell), 0),
  ...graph.neighbours(cell).map(other => new And([
    new SameValues(2, rootRow.at(cell), rootRow.at(other)),
    new SameValues(2, rootCol.at(cell), rootCol.at(other)),
    new Pair(oneNearer, 'one step nearer the root', depth.at(cell), depth.at(other)),
  ])),
]));

// Reads [depth(cell), cell's own number, then rootRow/rootCol of every cell
// from itself onward in reading order]. A root (depth 0) must be named by
// exactly its own number's worth of later-or-equal cells; a non-root must be
// named by none (which also keeps every named root a real depth-0 cell).
const sizeSpecs = new Map();
const sizeSpec = (row, col) => {
  const key = row + '_' + col;
  if (!sizeSpecs.has(key)) {
    sizeSpecs.set(key, NFA.encodeSpec({
      startState: { phase: 'depth' },
      transition: (state, value) => {
        if (state.phase === 'depth') return { phase: 'digit', isRoot: value === 0 };
        if (state.phase === 'digit') {
          return { phase: 'row', rem: state.isRoot ? value : 0 };
        }
        if (state.phase === 'row') {
          return { phase: 'col', rem: state.rem, rowEq: value === row };
        }
        // phase 'col'
        if (state.rowEq && value === col) {
          return state.rem > 0 ? { phase: 'row', rem: state.rem - 1 } : undefined;
        }
        return { phase: 'row', rem: state.rem };
      },
      accept: state => state.phase === 'row' && state.rem === 0,
    }, shape));
  }
  return sizeSpecs.get(key);
};

const sizes = cells.map((cell, i) => {
  const { row, col } = parseCellId(cell);
  const later = cells.slice(i);
  return new NFA(sizeSpec(row, col), 'region size equals its number',
    depth.at(cell), cell,
    ...later.flatMap(other => [rootRow.at(other), rootCol.at(other)]));
});

// Reads [rootRow(a), rootRow(b), rootCol(a), rootCol(b)] and ends recording
// whether a and b share a region -- shared by both edge rules below.
const readSameRegion = (state, value) => {
  if (state.phase === 0) return { phase: 1, mine: value };
  if (state.phase === 1) return { phase: 2, same: value === state.mine };
  if (state.phase === 2) return { phase: 3, same: state.same, mine: value };
  return { phase: 4, same: state.same && value === state.mine };
};

// Reads [a, b, rootRow(a), rootRow(b), rootCol(a), rootCol(b)] for one
// orthogonal edge: the two numbers are equal exactly when the two cells are
// in the same region -- the Fillomino edge rule this puzzle's "two regions of
// the same size may not share an edge" restates.
const numberEdgeSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, mine: value };
    if (state.phase === 1) return { phase: 2, sameNumber: value === state.mine };
    if (state.phase === 2) return { phase: 3, sameNumber: state.sameNumber, mine: value };
    if (state.phase === 3) {
      return { phase: 4, sameNumber: state.sameNumber, same: value === state.mine };
    }
    if (state.phase === 4) {
      return { phase: 5, sameNumber: state.sameNumber, same: state.same, mine: value };
    }
    if (state.phase === 5) {
      const same = state.same && value === state.mine;
      return same === state.sameNumber ? { phase: 6 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 6,
}, shape);

// Reads [rootRow(a), rootRow(b), rootCol(a), rootCol(b), depth(a), depth(b)]:
// within one region, adjacent cells' depths differ by at most 1; across
// different regions the two depths are unconstrained.
const distanceEdgeSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase < 4) return readSameRegion(state, value);
    if (state.phase === 4) return { phase: 5, same: state.same, mine: value };
    if (state.phase === 5) {
      if (!state.same) return { phase: 6 };
      return Math.abs(value - state.mine) <= 1 ? { phase: 6 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 6,
}, shape);

const edges = cells.flatMap(cell => [[1, 0], [0, 1]].flatMap(([dRow, dCol]) => {
  const other = graph.step(cell, dRow, dCol);
  return other ? [[cell, other]] : [];
}));

const edgeRules = edges.flatMap(([a, b]) => [
  new NFA(numberEdgeSpec, 'equal numbers exactly within a region',
    a, b, rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b)),
  new NFA(distanceEdgeSpec, 'distance changes by at most one within a region',
    rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b),
    depth.at(a), depth.at(b)),
]);

// --- Arrow cells ---------------------------------------------------------
// Transcribed from the drawn arrow glyphs (direction) and each arrow cell's
// top-left corner number N. ARROWS lists every arrow cell in reading order:
// [row, col, N or null where the corner is blank, up, down, left, right]
// where the last four are booleans, true where a drawn arrow points.
const ARROWS = [
  [1, 5, 5, false, true, false, true],
  [2, 3, 8, false, false, true, true],
  [2, 8, 7, false, true, false, false],
  [3, 5, 5, false, true, false, true],
  [3, 10, 7, false, true, false, false],
  [4, 4, 8, false, false, false, true],
  [5, 4, 8, false, false, false, true],
  [5, 12, null, false, true, true, false],
  [6, 1, 9, true, false, false, false],
  [6, 7, 5, true, true, true, true],
  [7, 3, 8, true, false, false, false],
  [8, 1, 7, false, false, false, true],
  [8, 8, null, true, false, true, true],
  [9, 5, 5, false, false, false, true],
  [9, 9, 7, false, false, true, true],
  [11, 11, 3, true, false, false, false],
  [12, 2, null, true, false, false, false],
];

const nVar = new Var('N', 'arrow cell target digit', ARROWS.length);
const arrowGivens = ARROWS.flatMap(([, , n], i) =>
  n === null ? [new Given(nVar.cell(i + 1), ...range(1, 9))]
             : [new Given(nVar.cell(i + 1), n)]);

// Reads [own number, N, then the ray cells outward in one direction, nearest
// first]. Positions 1..target-1 (target = own number) must never hold N.
// An arrow direction additionally requires position target to hold N; a
// non-arrow direction additionally requires position target to NOT hold N
// (so a tied-nearest direction cannot go unmarked). Once that position is
// resolved, the rest of the ray is unconstrained -- only the nearest
// occurrence matters. A ray shorter than target trivially satisfies a
// non-arrow direction (nothing is that close) and cannot satisfy an arrow
// direction (nothing stands at the required distance).
const raySpecs = new Map();
const raySpec = (isArrow, rayLength) => {
  const key = isArrow + '_' + rayLength;
  if (!raySpecs.has(key)) {
    raySpecs.set(key, NFA.encodeSpec({
      startState: { phase: 'target' },
      transition: (state, value) => {
        if (state.phase === 'target') return { phase: 'n', target: value };
        if (state.phase === 'n') return { phase: 'scan', target: state.target, n: value, pos: 1 };
        if (state.phase === 'scan') {
          const { target, n, pos } = state;
          if (pos < target) {
            return value === n ? undefined : { phase: 'scan', target, n, pos: pos + 1 };
          }
          // pos === target
          const hit = value === n;
          if (isArrow ? !hit : hit) return undefined;
          return { phase: 'free' };
        }
        if (state.phase === 'free') return { phase: 'free' };
        return undefined;
      },
      accept: state => isArrow ? state.phase === 'free'
                                : (state.phase === 'scan' || state.phase === 'free'),
    }, shape));
  }
  return raySpecs.get(key);
};

const DIRECTIONS = [
  ['up', -1, 0], ['down', 1, 0], ['left', 0, -1], ['right', 0, 1],
];
const arrowRules = ARROWS.flatMap(([row, col, , ...flags], i) => {
  const cell = makeCellId(row, col);
  return DIRECTIONS.flatMap(([, dRow, dCol], d) => {
    const ray = graph.ray(cell, dRow, dCol).slice(1);
    if (ray.length === 0) return []; // board edge in this direction: vacuous
    return [new NFA(raySpec(flags[d], ray.length),
      flags[d] ? 'nearest N is exactly this many cells away'
               : 'no closer occurrence of N this way',
      cell, nVar.cell(i + 1), ...ray)];
  });
});

return [
  shape,
  rootRow.toVar('region root row'),
  rootCol.toVar('region root column'),
  depth.toVar('distance to region root'),
  nVar,
  ...domains,
  ...arrowGivens,
  ...roots,
  ...descents,
  ...sizes,
  ...edgeRules,
  ...arrowRules,
];
