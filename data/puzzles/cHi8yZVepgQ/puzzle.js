// Title: 4 Magic
// Author: BlackRaven
// Video: https://www.youtube.com/watch?v=cHi8yZVepgQ
// Source: https://sudokupad.app/v38zh5blzk
//
// Normal sudoku. Draw an orthogonally connected path that does not branch or
// touch itself, not even diagonally, starting at R9C9 and ending at R1C1
// (marked with squares) and visiting every box at least once. Any 4 consecutive
// cells along the path contain one digit from each of {1,5,9}, {2,6}, {3,7},
// {4,8} (i.e. all four residues mod 4). Arrow cells (off the path) count the
// number of path cells in the arrow's direction; circle cells (off the path)
// count path cells among their up-to-8 king neighbours. Purple line: Renban.
// Blue line: Region Sum Line. White dots: Kropki consecutive (not all dots
// are given, so no global negative Kropki).
//
// Path membership is a Var overlay per grid cell (ON=1/OFF=2), shaped by
// degree constraints (1 at the two endpoints, 2 elsewhere when on, 0 when
// off), a no-diagonal-touch NFA, and a ConnectedValues over the on-path
// cells: a connected graph whose degree sequence is all-2 except for
// exactly two degree-1 vertices is necessarily a single simple path between
// those two vertices, so connectivity plus the degree rules together force
// exactly one path from R9C9 to R1C1, soundly ruling out disjoint
// path/cycle fragments.
// Box coverage (>=1 on-path cell per box) is a small counting NFA per box.
// Arrow/circle counts follow nordschleife's count machine, applied along a
// ray for arrows and over king neighbours for circles. The mod-4 window rule
// is enforced over every physically possible simple 4-cell orthogonal walk in
// the grid: because on-path cells are forced to degree exactly 1 (endpoints)
// or 2 (interior), any 4-cell walk that is fully on-path is necessarily 4
// genuinely consecutive path cells, so this local, geometry-enumerated check
// is sound without needing a global connectivity primitive.
//
// Single connected path: a ConnectedValues over the on-path cells, combined
// with the degree rules above (degree 1 at exactly the two fixed endpoints,
// degree 2 everywhere else on-path), forces the on-path cells to form
// exactly one simple path between R9C9 and R1C1.

const ON = 1;                  // path-membership values, stored in the Var cells
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// The path-membership Var cell paired with each grid cell (VP1..VP81, in grid order).
const path = graph.makeOverlay('VP');
const pathCell = cell => path.at(cell);

const gridCells = graph.cells();


const START = 'R9C9';
const END = 'R1C1';
const endpoints = [START, END];

const arrows = [
  { cell: 'R6C1', dir: [-1, 0] },   // up
  { cell: 'R5C4', dir: [0, -1] },   // left
  { cell: 'R5C6', dir: [0, -1] },   // left
];
const circles = ['R4C6', 'R8C9'];

// --- Path membership: every cell is on (1) or off (2); endpoints on, arrow
// and circle cells off (they are off-path counting clues).
const originCell = path.cells()[0];

// --- Single connected path: the on-path cells form one connected region.
// Combined with the degree rules below (degree 1 at the two endpoints,
// degree 2 elsewhere on-path), this forces the on-path cells to form
// exactly one simple path from R9C9 to R1C1 -- a connected graph with that
// degree sequence cannot be two or more disjoint path/cycle fragments.

// --- Degree: endpoints have exactly one on-path orthogonal neighbour;
// every other on cell has exactly two; off cells are free. Reads the
// membership of the cell, then of each neighbour.
const makeDegreeMachine = requiredDegree => NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, membership) => {
    if (phase === 'start') {
      return membership === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (membership === ON ? 1 : 0);
    return count > requiredDegree ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === requiredDegree,
}, geometry.numValues);
const degree1Machine = makeDegreeMachine(1);
const degree2Machine = makeDegreeMachine(2);

// --- No diagonal self-touch: forbid a 2x2 whose only on cells are a diagonal.
// Reads the four membership cells of a 2x2 block, left-to-right, top-to-bottom.
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, membership) => {
    if (block === null) return { block: null };
    const next = [...block, membership === ON];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry.numValues);
// All 2x2 blocks are the same NFA over a fixed relative shape (topLeft,
// topRight, bottomLeft, bottomRight), translated by a uniform offset per
// anchor cell, so Replicate shortens this to one template + target set.
const noTouchAnchors = gridCells.filter(cell => graph.block(cell, 2, 2));
const noTouchOrigin = pathCell(noTouchAnchors[0]);
const noTouchTemplate = graph.block(noTouchAnchors[0], 2, 2).map(pathCell);

// --- Box coverage: at least one on-path cell in every box.
const atLeastOneOnMachine = NFA.encodeSpec({
  startState: { seen: false },
  transition: ({ seen }, value) => ({ seen: seen || value === ON }),
  accept: ({ seen }) => seen,
}, geometry.numValues);

// --- Arrow / circle counts: the clue's own digit equals the number of
// on-path cells among the cells it inspects. Reads the clue's digit, then
// each inspected cell's membership (nordschleife-style count machine).
const countMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value === ON ? 1 : 0);
    return next > target ? [] : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);

// --- Mod-4 windows: any 4 consecutive path cells cover all four residues
// mod 4 ({1,5,9}->1, {2,6}->2, {3,7}->3, {4,8}->0). Enumerated over every
// physically possible simple 4-cell orthogonal walk; sound because degree
// constraints make any fully-on-path walk of this shape a genuine
// 4-consecutive window (see file header). Reads (membership, digit) for
// each of the 4 cells in walk order.
const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const mod4Windows = [];
const seenWindows = new Set();
for (const a of gridCells) {
  for (const [dr1, dc1] of DIRS) {
    const b = graph.step(a, dr1, dc1);
    if (!b) continue;
    for (const [dr2, dc2] of DIRS) {
      const c = graph.step(b, dr2, dc2);
      if (!c || c === a) continue;
      for (const [dr3, dc3] of DIRS) {
        const d = graph.step(c, dr3, dc3);
        if (!d || d === b || d === a) continue;
        const key = [a, b, c, d].join('-');
        const revKey = [d, c, b, a].join('-');
        if (seenWindows.has(key) || seenWindows.has(revKey)) continue;
        seenWindows.add(key);
        mod4Windows.push([a, b, c, d]);
      }
    }
  }
}
// Even phases (0,2,4,6) read a cell's membership; odd phases (1,3,5,7) read
// its digit. As soon as a membership reads OFF the window is vacuous, so the
// machine drops into a 'skip' sink that always accepts. On the last digit
// (phase 7) the class-coverage decision is folded into the transition itself
// (into an accepting 'done' sink, or reject), so the machine never needs a
// phase 8 state -- keeping the compiled state space finite and small (phase x
// classes-bitmask, no per-window history array).
const mod4Machine = NFA.encodeSpec({
  startState: { phase: 0, classes: 0 },
  transition: ({ phase, classes }, value) => {
    if (phase === 'skip' || phase === 'done') return { phase };
    if (phase % 2 === 0) {
      return value === ON ? { phase: phase + 1, classes } : { phase: 'skip' };
    }
    const nextClasses = classes | (1 << (value % 4));
    if (phase === 7) {
      return nextClasses === 0b1111 ? { phase: 'done' } : undefined;
    }
    return { phase: phase + 1, classes: nextClasses };
  },
  accept: ({ phase }) => phase === 'skip' || phase === 'done',
}, geometry.numValues);

return [
  new Shape('9x9'),
  path.toVar('path'),
  new Replicate([new Given(originCell, ON, OFF)],
    Replicate.encodeTargetCells(path.cells(), originCell, path), originCell),
  ...endpoints.map(cell => new Given(pathCell(cell), ON)),
  ...arrows.map(({ cell }) => new Given(pathCell(cell), OFF)),
  ...circles.map(cell => new Given(pathCell(cell), OFF)),
  new ConnectedValues('VP', ON),
  ...gridCells.map(cell => {
    const machine = endpoints.includes(cell) ? degree1Machine : degree2Machine;
    return new NFA(machine, 'degree', pathCell(cell), ...graph.neighbours(cell).map(pathCell));
  }),
  new Replicate(
    [new NFA(noDiagonalTouchMachine, 'no-touch', ...noTouchTemplate)],
    Replicate.encodeTargetCells(noTouchAnchors.map(pathCell), noTouchOrigin, path),
    noTouchOrigin),
  ...graph.boxes().map(cells => new NFA(atLeastOneOnMachine, 'box-coverage', ...cells.map(pathCell))),
  ...arrows.map(({ cell, dir: [dR, dC] }) => {
    const ray = graph.ray(cell, dR, dC).slice(1).map(pathCell);
    return new NFA(countMachine, 'arrow-count', cell, ...ray);
  }),
  ...circles.map(cell => new NFA(countMachine, 'circle-count', cell, ...graph.kingNeighbours(cell).map(pathCell))),
  ...mod4Windows.map(([a, b, c, d]) => new NFA(mod4Machine, 'mod4', pathCell(a), a, pathCell(b), b, pathCell(c), c, pathCell(d), d)),
  // --- Renban line (purple): non-repeating consecutive sequence.
  new Renban('R5C7', 'R5C8', 'R5C9'),
  // --- Region Sum Line (blue): box borders divide the line into equal-sum
  // segments.
  new RegionSumLine('R6C5', 'R5C5', 'R4C5', 'R4C4', 'R3C4', 'R2C4', 'R3C3', 'R3C2'),
  // --- Kropki white dots (not all dots given, so no global negative Kropki).
  new WhiteDot('R8C1', 'R9C1'),
  new WhiteDot('R1C8', 'R1C9'),
  new WhiteDot('R4C5', 'R5C5'),
];
