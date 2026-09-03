// Title: Cave Fillomino
// Author: Jesper Josefsson
// Video: https://www.youtube.com/watch?v=UoCckyR8fFA
// Source: https://tinyurl.com/y4uxa62s

// 10x10 board, no Sudoku layer: the grid is Raw, so rows, columns and boxes
// carry no rule and numbers repeat freely.
//
// Rules encoded:
//  * Standard Fillomino. Divide the grid into orthogonally connected regions;
//    a cell's number is the size of its region; no two regions of equal size
//    share an edge. Those two clauses are one statement about the filled grid:
//    the orthogonally connected run of equal numbers containing a cell has
//    exactly that many cells.
//  * Cave. Some cells are shaded gray (walls); every gray cell is orthogonally
//    connected to the edge of the grid through gray cells (several separate
//    wall regions are allowed, each reaching the edge); all remaining cells
//    together form exactly one orthogonally connected area (the cave).
//  * Every circled cell is inside the cave, and its own number is the count of
//    cave cells it sees along the four orthogonal rays, itself included, with
//    walls and the grid edge blocking the view.
//  * The top right cell (R1C10) is a wall from the start, and still holds a
//    number.
//  * The 18 printed numbers.
//
// Omitted:
//  * "Within one orthogonally connected area of gray cells, no numbers may
//    repeat." Only its two-cell consequence is encoded below (orthogonally
//    adjacent gray cells are in one gray area, so their numbers differ);
//    distinctness across a whole gray area, whose shape and count the solver
//    discovers, is left out.
//  * Regions of area 17 or more. A Fillomino cell's number has to name its own
//    region's area, and the value alphabet stops at 16, so a larger region
//    cannot be written down. Areas 1-16 are encoded exactly.

const MAX_AREA = 16;
const SIDE = 10;
const WALL = 1;
const CAVE = 2;

const shape = new Shape(`${SIDE}x${SIDE}`, '1-' + MAX_AREA, 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

// --- Drawn data ------------------------------------------------------------
// The 18 printed numbers, as [row, col, number].
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

// The 12 large circles, as [row, col].
const CIRCLES = [
  [1, 4], [2, 5], [3, 4], [4, 1], [4, 2], [4, 5],
  [5, 5], [5, 6], [6, 3], [6, 8], [7, 1], [10, 10],
];

// The single cell shaded gray in the source, the board's top-right corner.
const GIVEN_WALL = makeCellId(1, SIDE);

// --- Fillomino: a rooted tree per region -----------------------------------
// Five whole-grid overlays carry a rooted tree per region. They are
// bookkeeping, not puzzle content:
//   parent  - ROOT, or the direction of the cell one step nearer the root;
//   subtree - how many cells hang below this one, itself included;
//   rootRow
//   rootCol - which cell is the root of this cell's region;
//   depth   - steps from the root, counting the root as 1.
// A root's subtree is its whole region and equals the number written there; a
// non-root hangs off a neighbour holding the same number; two neighbours
// holding the same number must name the same root, so two equal-area regions
// cannot share an edge; and subtree counts strictly grow towards a root, so
// the pointers cannot cycle and every cell reaches its root.
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
const subtree = graph.makeOverlay('VT');
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

// Reads [number(a), number(b), label(a), label(b)] for one orthogonal edge:
// neighbours holding the same number are in the same region and so must name
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

// Reads [number(a), number(b), depth(a), depth(b)]: within a region no step may
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

// Reads [number(cell), number(other), depth(cell), depth(other)] and rejects
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

// --- Cave: walls and the cave ---------------------------------------------
// The shading lives on a 12x12 overlay: the 10x10 board inset in a one-cell
// frame whose cells are pinned to WALL. "Every gray region is orthogonally
// connected to the edge of the grid" is then exactly "the walls plus the frame
// form a single orthogonally connected region", which ConnectedValues states
// directly while still allowing any number of separate wall regions on the
// board itself. The cave is a plain ConnectedValues on the same layer; the
// frame never holds CAVE, so that reads only the board.
const framedGrid = cellGraph(`${SIDE + 2}x${SIDE + 2}`);
const shade = framedGrid.makeOverlay('VG');
const innerShade = shade.at(framedGrid.block('R2C2', SIDE, SIDE));
const shadeOf = new Map(cells.map((cell, i) => [cell, innerShade[i]]));
const insetCells = new Set(innerShade);
const frameCells = shade.cells().filter(cell => !insetCells.has(cell));

const shading = [
  shade.toVar('wall or cave'),
  shade.makeReplicate(new Given(shade.cells()[0], WALL, CAVE)),
  shade.makeReplicate(new Given(shade.cells()[0], WALL), frameCells),
  new Given(shadeOf.get(GIVEN_WALL), WALL),
  ...CIRCLES.map(([row, col]) => new Given(shadeOf.get(makeCellId(row, col)), CAVE)),
  new ConnectedValues('VG', WALL),
  new ConnectedValues('VG', CAVE),
];

// Two orthogonally adjacent gray cells are in the same gray area, so their
// numbers differ. Reads [number(a), number(b), shading(a), shading(b)] for one
// orthogonal edge. This is the part of "no numbers may repeat within a gray
// area" the encoding carries; the whole-area clause is omitted (see header).
const wallEdgeSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, mine: value };
    if (state.phase === 1) return { phase: 2, same: value === state.mine };
    if (state.phase === 2) {
      return { phase: 3, same: state.same, wall: value === WALL };
    }
    if (state.phase === 3) {
      return (state.same && state.wall && value === WALL) ? undefined : { phase: 4 };
    }
    return undefined;
  },
  accept: state => state.phase === 4,
}, shape);

const wallEdges = edges.map(({ cell, other }) => new NFA(
  wallEdgeSpec, 'adjacent walls differ',
  cell, other, shadeOf.get(cell), shadeOf.get(other)));

// --- Cave sightlines -------------------------------------------------------
// One machine per circled cell, reading the circled cell's own number followed
// by its four rays over the shading overlay, nearest cell first. `rem` is how
// many further cave cells the number still demands, `blocked` records that the
// current ray has already run into a wall so nothing beyond it is visible, and
// `i` counts the ray cells read so far -- the positions at which a new ray
// starts are baked into the spec, and are where sight is restored. The circled
// cell is in the cave and counts itself, so `rem` starts one below its number
// and must reach exactly zero. (SEGMENT_BREAK would carry the ray boundaries
// for free, but the break needs a 17th symbol and the alphabet is already the
// full 16, so the boundaries are positions in the state instead.)
const sightSpecs = new Map();
const sightSpec = (rayLengths) => {
  const key = rayLengths.join('_');
  if (!sightSpecs.has(key)) {
    const total = rayLengths.reduce((sum, len) => sum + len, 0);
    const rayStarts = new Set();
    let at = 1;
    for (const len of rayLengths) {
      rayStarts.add(at);
      at += len;
    }
    sightSpecs.set(key, NFA.encodeSpec({
      startState: { i: 0, rem: null, blocked: false },
      transition: (state, value) => {
        if (state.i === 0) return { i: 1, rem: value - 1, blocked: false };
        if (state.i > total) return undefined;
        const blocked = rayStarts.has(state.i) ? false : state.blocked;
        if (blocked || value !== CAVE) {
          return { i: state.i + 1, rem: state.rem, blocked: true };
        }
        const rem = state.rem - 1;
        if (rem < 0) return undefined;
        return { i: state.i + 1, rem, blocked: false };
      },
      accept: state => state.i === total + 1 && state.rem === 0,
      maxDepth: total + 1,
    }, shape));
  }
  return sightSpecs.get(key);
};

const RAY_DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

const sightCounts = CIRCLES.map(([row, col]) => {
  const cell = makeCellId(row, col);
  const rays = RAY_DIRECTIONS
    .map(([dRow, dCol]) => graph.ray(cell, dRow, dCol).slice(1)
      .map(rayCell => shadeOf.get(rayCell)));
  return new NFA(sightSpec(rays.map(ray => ray.length)), 'cave sightline',
    cell, ...rays.flat());
});

return [
  shape,
  parent.toVar('parent pointer'),
  subtree.toVar('subtree size'),
  rootRow.toVar('root row'),
  rootCol.toVar('root column'),
  depth.toVar('depth from root'),
  ...GIVENS.map(([row, col, value]) => new Given(makeCellId(row, col), value)),
  ...rootDomains,
  ...parentChoice,
  ...subtreeSums,
  ...regionEdges,
  ...shading,
  ...wallEdges,
  ...sightCounts,
];
