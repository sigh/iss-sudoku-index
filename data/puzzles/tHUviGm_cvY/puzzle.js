// Title: Count Me In
// Author: oskode
// Video: https://www.youtube.com/watch?v=tHUviGm_cvY
// Source: https://sudokupad.app/bs3y9058h7
//
// Standard 9x9 sudoku. Draw a single 1-cell wide loop through cell centres,
// orthogonally connected, that does not touch itself even diagonally. A
// digit on the loop counts how many times that digit appears on the loop. A
// digit in a cell with an arrow counts how many loop cells lie in the
// indicated direction (not including the arrow cell itself); a cell with two
// arrows applies the same digit independently to each direction.
//
// Loop membership is a Var cell per grid cell (1 = on, 2 = off), shaped into
// a loop by degree-2 and no-diagonal-touch NFAs, following the same pattern
// as nordschleife.js. The self-referential "digit on the loop counts itself"
// rule is one NFA per digit 1-9 scanning every (membership, digit) pair. Each
// arrow is one NFA reading the cell's digit then the membership of the ray of
// cells to the grid edge in that direction.

const ON = 1;                  // loop-membership values, stored in the Var cells
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

const loop = graph.makeOverlay('VL');
const loopCell = cell => loop.at(cell);
const gridCells = graph.cells();

const constraints = [
  new Shape('9x9'),
  loop.toVar('loop'),
  new Given('R6C7', 8),
  new Given('R8C7', 9),
];
const add = (...newConstraints) => constraints.push(...newConstraints);

// --- Loop membership: every cell is on (1) or off (2), free unless later
// rules pin it down.
const originCell = loop.cells()[0];
add(new Replicate([new Given(originCell, ON, OFF)],
  Replicate.encodeTargetCells(loop.cells(), originCell, loop), originCell));

// --- Degree 2: each on-loop cell has exactly two on-loop orthogonal
// neighbours; off cells are unconstrained. Reads the cell's membership, then
// each neighbour's.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, membership) => {
    if (phase === 'start') {
      return membership === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (membership === ON ? 1 : 0);
    return count > 2 ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === 2,
}, geometry.numValues);
for (const cell of gridCells) {
  add(new NFA(degreeMachine, 'degree',
    loopCell(cell), ...graph.neighbours(cell).map(loopCell)));
}

// --- No diagonal self-touch: forbid a 2x2 whose only on cells are a
// diagonal pair.
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
for (const cell of gridCells) {
  const block = graph.block(cell, 2, 2);
  if (block) add(new NFA(noDiagonalTouchMachine, 'no-touch', ...block.map(loopCell)));
}

// --- Loop self-count: for each digit v, the number of on-loop cells holding
// v is either 0 (v never appears on the loop) or exactly v (v appears on the
// loop and correctly counts itself). Reads (membership, digit) for every
// grid cell, in order.
const loopSelfCountMachine = (v) => NFA.encodeSpec({
  startState: { phase: 'mem', count: 0 },
  transition: (state, value) => {
    if (state.phase === 'mem') {
      return { phase: 'digit', count: state.count, wasOn: value === ON };
    }
    const isMatch = state.wasOn && value === v;
    const next = state.count + (isMatch ? 1 : 0);
    return next > v ? undefined : { phase: 'mem', count: next };
  },
  accept: ({ phase, count }) => phase === 'mem' && (count === 0 || count === v),
}, geometry.numValues);
for (let v = 1; v <= 9; v++) {
  add(new NFA(loopSelfCountMachine(v), `loop-count-${v}`,
    ...gridCells.flatMap(cell => [loopCell(cell), cell])));
}

// --- Arrow counts: the arrow cell's digit equals the number of on-loop
// cells along the ray to the grid edge in the indicated direction, not
// including the arrow cell. Reads the cell's digit, then the membership of
// each ray cell in order.
const arrowCountMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value === ON ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);

const DIRS = {
  up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1],
  upRight: [-1, 1], upLeft: [-1, -1], downRight: [1, 1], downLeft: [1, -1],
};
const arrowClues = [
  ['R1C5', 'left'], ['R1C5', 'downRight'],
  ['R1C9', 'left'],
  ['R3C4', 'upRight'], ['R3C4', 'downLeft'],
  ['R3C7', 'upRight'], ['R3C7', 'downLeft'],
  ['R4C8', 'left'],
  ['R6C4', 'up'], ['R6C4', 'upRight'],
  ['R7C1', 'right'],
  ['R8C1', 'right'],
  ['R9C5', 'left'],
];
for (const [cell, dirName] of arrowClues) {
  const [dRow, dCol] = DIRS[dirName];
  const rayCells = graph.ray(cell, dRow, dCol).slice(1);
  add(new NFA(arrowCountMachine, 'arrow-count', cell, ...rayCells.map(loopCell)));
}

return constraints;
