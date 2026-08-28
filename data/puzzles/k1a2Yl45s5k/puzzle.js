// Title: Untitled
// Author: Unknown
// Video: https://www.youtube.com/watch?v=k1a2Yl45s5k
// Source: https://cracking-the-cryptic.web.app/sudoku/tLmqnGRNPL

// Normal sudoku rules apply. A "python" is a single 1-cell-wide path of
// unknown length, starting at the purple-marked cell (R8C1), that never
// touches itself orthogonally or diagonally. Every blue-marked cell's own
// digit equals the number of its (up to 8) king-move neighbours that lie on
// the python, and a blue cell is never itself on the python. "All possible
// blue squares ARE given" makes this exhaustive: every OTHER (non-blue)
// off-python cell must NOT have digit === king-neighbour-python-count.
//
// Omission: the puzzle also has a "ghost" -- a translated (same-orientation)
// copy of the python's whole cell/digit sequence whose own two end cells
// must land on cells of the original python. That rule is not encoded here.

const ON = 1;   // python-membership values, stored in the Var overlay
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// The python-membership Var cell paired with each grid cell (VP1..VP81).
const python = graph.makeOverlay('VP');
const gridCells = graph.cells();

const START = 'R8C1';   // purple circle underlay, center (7.5, 0.5)

// Blue-square underlays (deepskyblue, #34BBE6): the 10 drawn underlay cells.
const BLUE = [
  'R6C2', 'R8C2', 'R9C2', 'R7C7', 'R9C7', 'R9C9', 'R3C4', 'R3C5', 'R4C6', 'R5C5',
];
const NOT_BLUE = gridCells.filter(cell => !BLUE.includes(cell));

// --- Normal sudoku givens ---
const givens = [
  new Given('R2C5', 8),
  new Given('R3C8', 7),
  new Given('R6C2', 4),
  new Given('R6C4', 1),
  new Given('R8C1', 1),
  new Given('R8C5', 5),
];

// --- Python membership: every cell is on (1) or off (2); blue cells off,
// start cell on. ---
const originCell = python.cells()[0];
const membership = [
  python.makeReplicate(new Given(originCell, ON, OFF)),
  ...python.at(BLUE).map(cell => new Given(cell, OFF)),
  new Given(python.at(START), ON),
];

// --- Degree: an on-python cell touches 1 or 2 on-python orthogonal
// neighbours (a simple path admits both endpoints and interior cells); an
// off cell is free. Applied to every cell except START, whose stricter
// version below forces it to be an endpoint. Reads this cell's own
// membership, then each orthogonal neighbour's.
const pathDegreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, membership) => {
    if (phase === 'start') {
      return membership === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (membership === ON ? 1 : 0);
    return count > 2 ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === 1 || onNeighbours === 2,
}, geometry.numValues);
const degrees = gridCells
  .filter(cell => cell !== START)
  .map(cell => new NFA(pathDegreeMachine, 'degree',
    ...python.at([cell, ...graph.neighbours(cell)])));

// --- START is the python's stated start, so it must be an endpoint: exactly
// one on-python orthogonal neighbour (START's own membership is already
// pinned ON above). Reads each orthogonal neighbour's membership. ---
const startDegreeMachine = NFA.encodeSpec({
  startState: { onNeighbours: 0 },
  transition: ({ onNeighbours }, membership) => {
    const count = onNeighbours + (membership === ON ? 1 : 0);
    return count > 1 ? undefined : { onNeighbours: count };
  },
  accept: ({ onNeighbours }) => onNeighbours === 1,
}, geometry.numValues);
const startDegree = new NFA(startDegreeMachine, 'start-degree',
  ...python.at(graph.neighbours(START)));

// --- No diagonal self-touch: forbid a 2x2 block whose only on-python cells
// are a diagonal pair. Reads the four membership cells of each 2x2 block,
// left-to-right, top-to-bottom. ---
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
// All 64 top-left anchors (rows/cols 1-8) give an identical-shape 2x2 block
// within the single VP overlay group, so one Replicate stamps every copy
// instead of 64 hand-written NFAs.
const blockAnchors = [];
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 8; c++) blockAnchors.push(makeCellId(r, c));
}
const noDiagonalTemplate = new NFA(noDiagonalTouchMachine, 'no-touch',
  ...python.block(python.at('R1C1'), 2, 2));
const noDiagonalTouches = python.makeReplicate(
  noDiagonalTemplate, python.at(blockAnchors));

// --- Blue-square counts: each blue cell's own digit equals the number of
// its king neighbours on the python (blue cells are already pinned OFF
// above). Reads the digit, then each king neighbour's membership. ---
const equalCountMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value === ON ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);
const blueCounts = BLUE.map(cell => new NFA(equalCountMachine, 'blue-count',
  cell, ...python.at(graph.kingNeighbours(cell))));

// --- Exhaustiveness ("all possible blue squares ARE given"): for every
// non-blue cell, if it is off the python its digit must NOT equal its
// king-neighbour python-count (an on-python cell is exempt outright, since
// the rule only speaks of non-python cells). Reads this cell's own
// membership, then its digit, then each king neighbour's membership. ---
// Clamp count at target+1 (a sink meaning "already more than target", still
// correctly `!== target`); without the clamp the compiler's state search
// treats `count` as unbounded and blows the 4096-state cap. maxDepth bounds
// this NFA's own symbol count: own membership + own digit + up to 8 king
// neighbours = 10.
const notBlueCountMachine = NFA.encodeSpec({
  startState: { phase: 'read-membership' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'read-membership':
        return value === ON ? { phase: 'free' } : { phase: 'read-digit' };
      case 'read-digit':
        return { phase: 'count', target: value, count: 0 };
      case 'count':
        return {
          phase: 'count',
          target: state.target,
          count: Math.min(state.count + (value === ON ? 1 : 0), state.target + 1),
        };
      case 'free':
        return { phase: 'free' };
    }
  },
  accept: state => state.phase === 'free' || state.count !== state.target,
  maxDepth: 10,
}, geometry.numValues);
const notBlueCounts = NOT_BLUE.map(cell => new NFA(notBlueCountMachine, 'not-blue-count',
  python.at(cell), cell, ...python.at(graph.kingNeighbours(cell))));

return [
  new Shape('9x9'),
  python.toVar('python'),
  ...givens,
  ...membership,
  // Single python: the on-python cells form one orthogonally-connected region.
  new ConnectedValues('VP', ON),
  ...degrees,
  startDegree,
  noDiagonalTouches,
  ...blueCounts,
  ...notBlueCounts,
];
