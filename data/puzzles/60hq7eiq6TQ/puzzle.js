// Title: The Arkenstone
// Author: Blobz
// Video: https://www.youtube.com/watch?v=60hq7eiq6TQ
// Source: https://sudokupad.app/blobz/the-arkenstone

// Normal sudoku. Every cell is shaded (a "wall") or unshaded; the unshaded
// cells are the tunnels, the lair and the passage. Encoded here:
//   - the lair is a 2x2 block inside box 5 containing the Arkenstone R5C5,
//     and is unshaded;
//   - no 2x2 block other than the lair is wholly shaded or wholly unshaded;
//   - no 2x2 block is a checkerboard, i.e. the unshaded region never touches
//     itself only diagonally;
//   - the unshaded cells form one orthogonally connected region;
//   - every group of orthogonally connected wall cells contains a cell on the
//     grid's edge;
//   - every caged cell is unshaded, and its digit plus the printed modifier
//     equals the number of unshaded cells it sees orthogonally, counting
//     itself, with walls blocking sight.
//
// Omitted: each needs the unshaded cells split into tunnel, lair and passage,
// and the last two also need an order along a route the solver discovers.
//   - orthogonally adjacent tunnel digits (including dead ends) differ by at
//     least 5;
//   - the route from R9C1 to the lair, ignoring dead ends, is 26 cells;
//   - the passage is a non-branching line from the side of the lair opposite
//     the tunnels to R5C9, every three consecutive digits hold one of {1,4,7},
//     one of {2,5,8} and one of {3,6,9}, and its digits sum to 45.

const WALL = 1;
const OPEN = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], WALL, OPEN));

// Cage cells and their modifiers, transcribed from the 17 single-cell cages,
// each printed with a signed modifier in its corner.
const cages = [
  ['R2C1', 0], ['R4C1', +1], ['R6C1', 0], ['R9C1', 0],
  ['R6C2', 0], ['R7C3', +1], ['R2C4', +2], ['R9C4', 0],
  ['R7C4', -3], ['R1C6', -2], ['R3C6', 0], ['R8C6', -1],
  ['R3C7', 0], ['R2C8', +2], ['R6C8', +2], ['R8C8', +2],
  ['R5C9', -1],
];

// "All caged cells are either tunnel or passage", i.e. unshaded. No cage lies
// in box 5, so no caged cell can be a lair cell either.
const cagesUnshaded = cages.map(([cell]) => new Given(shade.at(cell), OPEN));

// The three coloured cells are all unshaded already: the yellow Arkenstone
// R5C5 through the lair disjunction below, and the pink entrance R9C1 and the
// green door R5C9 through their own cages.

// The tunnels are one orthogonally connected region reaching the lair, and the
// passage runs from the lair to R5C9, so tunnels + lair + passage -- which the
// rules give as the whole of the unshaded set -- is one orthogonal region.
const unshadedConnected = new ConnectedValues('VS', OPEN);

// One counting machine for both line rules below. The first symbol is the
// count Var, read as `target` = its value - 1; the rest are the shade cells of
// one row, column or border line, and `count` tallies orthogonally adjacent
// pairs that are both `match`. Counting past the target can only fail, so that
// branch is dropped.
function pairCountMachine(match) {
  return NFA.encodeSpec({
    startState: { target: null },
    transition: ({ target, prev, count }, value) => {
      if (target === null) return { target: value - 1, prev: null, count: 0 };
      const next = count + (prev === match && value === match ? 1 : 0);
      return next > target ? undefined : { target, prev: value, count: next };
    },
    accept: ({ target, count }) => target !== null && count === target,
  }, geometry.numValues);
}
const openPairMachine = pairCountMachine(OPEN);
const wallPairMachine = pairCountMachine(WALL);

// Wall groups reach the grid's edge. A wall group with no edge cell is exactly
// a hole in the unshaded region, so the rule is "the unshaded region has no
// holes". Take the unshaded cells as closed unit squares: their union has
// Euler characteristic V - E + F = (components - holes), where F is the count
// of unshaded cells, E = 4F - D counts their edges with D the orthogonally
// adjacent unshaded pairs, and V = 100 - W counts the lattice points touching
// an unshaded cell, W counting the 2x2 lattice windows with no unshaded cell.
// No checkerboards means unshaded cells that touch only diagonally do not
// exist, so that union's components are the orthogonal ones ConnectedValues
// pins to 1, and requiring the characteristic to be 1 leaves no holes.
// No 2x2 block is wholly shaded, so only the 36 border windows can be counted
// by W: the 32 adjacent shaded pairs along the four border lines, plus a
// shaded corner cell each.
const openPairsPerRow = new Var('R', 'unshaded pairs per row', 9);
const openPairsPerColumn = new Var('C', 'unshaded pairs per column', 9);
const borderWallPairs = new Var('B', 'shaded pairs along each border line', 4);
const borderLines = [graph.row(1), graph.row(9), graph.column(1), graph.column(9)];
const corners = ['R1C1', 'R1C9', 'R9C1', 'R9C9'];

const pairCounts = [
  ...graph.rows().map((cells, i) => new NFA(
    openPairMachine, 'unshaded-pairs',
    openPairsPerRow.cell(i + 1), ...shade.at(cells))),
  ...graph.columns().map((cells, i) => new NFA(
    openPairMachine, 'unshaded-pairs',
    openPairsPerColumn.cell(i + 1), ...shade.at(cells))),
  ...borderLines.map((cells, i) => new NFA(
    wallPairMachine, 'shaded-border-pairs',
    borderWallPairs.cell(i + 1), ...shade.at(cells))),
];

// V - E + F = 1, rearranged over the count Vars (each one more than its count)
// and the shade cells (WALL = 1, OPEN = 2), with the four corner cells taking
// -3 + 1 for their extra appearance in W.
const noEnclosedWalls = new Sum(
  -320,
  ...openPairsPerRow.cells(),
  ...openPairsPerColumn.cells(),
  ...borderWallPairs.cells().map(cell => [cell, -1]),
  ...shade.cells().map(cell => [
    cell, corners.includes(shade.gridAt(cell)) ? -2 : -3]),
);

// Both 2x2 machines read the block's four shade cells in row-major order and
// then absorb nothing further; `pending` collects them, `done` marks a block
// that has passed.
const noCheckerboardMachine = NFA.encodeSpec({
  startState: { pending: [] },
  transition: ({ pending, done }, value) => {
    if (done === true) return { done: true };
    const next = [...pending, value];
    if (next.length < 4) return { pending: next };
    const [tl, tr, bl, br] = next;
    // A checkerboard has both diagonal pairs matching and the two differing.
    return (tl === br && tr === bl && tl !== tr) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);

const noMonochromeMachine = NFA.encodeSpec({
  startState: { pending: [] },
  transition: ({ pending, done }, value) => {
    if (done === true) return { done: true };
    const next = [...pending, value];
    if (next.length < 4) return { pending: next };
    return next.every(v => v === next[0]) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);

const blockCells = origin => shade.at(graph.block(origin, 2, 2));
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));

// The lair is a 2x2 block of box 5 holding R5C5: these are its four possible
// top-left corners. Nothing drawn distinguishes them, so they stay a disjunction.
const lairOrigins = ['R4C4', 'R4C5', 'R5C4', 'R5C5'];

const noCheckerboard = shade.makeReplicate(
  new NFA(noCheckerboardMachine, 'no-checkerboard', ...blockCells(gridCells[0])),
  shade.at(blockOrigins));

// The lair is the one 2x2 block allowed to be monochrome, so the four candidate
// blocks are held back and dealt with inside the disjunction below.
const noMonochrome = shade.makeReplicate(
  new NFA(noMonochromeMachine, 'no-monochrome', ...blockCells(gridCells[0])),
  shade.at(blockOrigins.filter(cell => !lairOrigins.includes(cell))));

const lair = new Or(lairOrigins.map(origin => new And([
  ...blockCells(origin).map(cell => new Given(cell, OPEN)),
  ...lairOrigins.filter(other => other !== origin).map(
    other => new NFA(noMonochromeMachine, 'no-monochrome', ...blockCells(other))),
])));

// Sight count for one cage. The machine reads the cage's digit as its first
// segment, then one segment per ray of shade cells leading away from the cage.
// `blocked` resets at each SEGMENT_BREAK and latches on the ray's first wall,
// so `count` accumulates the unshaded cells seen along the rays; the cage cell
// itself is the "+ 1" folded into the target below. Counting past the target
// can only fail, so that branch is dropped rather than tracked.
function sightMachine(modifier) {
  return NFA.encodeSpec({
    startState: { target: null, count: 0, blocked: false },
    transition: ({ target, count, blocked }, value) => {
      if (value === SEGMENT_BREAK) return { target, count, blocked: false };
      if (target === null) return { target: value + modifier - 1, count: 0, blocked: false };
      if (blocked || value === WALL) return { target, count, blocked: true };
      const next = count + 1;
      return next > target ? undefined : { target, count: next, blocked: false };
    },
    accept: ({ target, count }) => target !== null && count === target,
  }, geometry.numValues, { multiSegment: true });
}

const sightMachines = new Map(
  [...new Set(cages.map(([, modifier]) => modifier))].map(
    modifier => [modifier, sightMachine(modifier)]));

const sightCounts = cages.map(([cell, modifier]) => {
  const rays = [[-1, 0], [1, 0], [0, -1], [0, 1]]
    .map(([dRow, dCol]) => shade.at(graph.ray(cell, dRow, dCol).slice(1)))
    .filter(ray => ray.length > 0);
  return new NFA(
    sightMachines.get(modifier), 'sight-count', [cell], ...rays);
});

return [
  new Shape('9x9'),
  shade.toVar('wall shading'),
  shadeDomain,
  openPairsPerRow,
  openPairsPerColumn,
  borderWallPairs,
  unshadedConnected,
  ...pairCounts,
  noEnclosedWalls,
  ...cagesUnshaded,
  noCheckerboard,
  noMonochrome,
  lair,
  ...sightCounts,
];
