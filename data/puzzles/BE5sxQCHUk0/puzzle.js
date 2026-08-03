// Title: Foggy Whisper Loop
// Author: yttrio
// Video: https://www.youtube.com/watch?v=BE5sxQCHUk0
// Source: https://app.crackingthecryptic.com/sudoku/nHJJ9Hh9BN

// Normal sudoku. Five killer cages (sum, no repeat). Six white dots (given
// pairs only -- "not all dots are given" means absence elsewhere carries no
// information, so no negative dot constraint is added). Draw an unknown
// one-cell-wide loop of orthogonally connected cells that must pass through
// every cage cell and may not touch itself, not even diagonally. Along the
// loop, consecutive digits differ by at least 5 (German Whispers). Fog is
// solving UI (progressive reveal) and carries no rule of its own; the rules
// never test "revealed" state, so it is omitted from the encoding.
//
// Loop membership is a Var per grid cell (ON/OFF). Because the loop may not
// touch itself, ON/OFF + degree-2 (counted over orthogonal neighbours) +
// ConnectedValues closes the loop rule outright: connected + 2-regular under
// orthogonal adjacency is exactly one simple cycle, and it also implies any
// two orthogonally-adjacent ON cells are consecutive along the loop -- so the
// whisper rule only needs to look at ON/ON grid edges, not an explicit path
// order.

const ON = 1;
const OFF = 2;
const WHISPER_MIN_DIFF = 5;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// Loop-membership Var cell paired with each grid cell (VL1..VL81, in grid order).
const loop = graph.makeOverlay('VL');

// Cage cells, from the payload's cages array (top-left value = sum).
const cages = [
  { sum: 13, cells: ['R1C1', 'R1C2', 'R1C3'] },
  { sum: 16, cells: ['R8C8', 'R9C6', 'R9C7', 'R9C8'] },
  { sum: 21, cells: ['R6C4', 'R7C4', 'R7C5', 'R7C6'] },
  { sum: 22, cells: ['R3C6', 'R4C6', 'R4C7', 'R4C8'] },
  { sum: 19, cells: ['R4C1', 'R4C2', 'R5C2', 'R5C3'] },
];
const cageConstraints = cages.map(({ sum, cells }) => new Cage(sum, ...cells));
const cageCells = cages.flatMap(({ cells }) => cells);

// White dot edges, from the payload's rounded white-filled edge overlays.
const whiteDotEdges = [
  ['R6C9', 'R7C9'],
  ['R4C8', 'R5C8'],
  ['R3C9', 'R4C9'],
  ['R3C2', 'R3C3'],
  ['R9C5', 'R9C6'],
  ['R7C1', 'R8C1'],
];
const whiteDots = whiteDotEdges.map(cells => new WhiteDot(...cells));

// --- Loop membership: every cell is on (1) or off (2); every cage cell is on.
const originCell = loop.cells()[0];
const membership = [
  loop.makeReplicate(new Given(originCell, ON, OFF)),
  ...loop.at(cageCells).map(cell => new Given(cell, ON)),
];

// --- Degree 2: each on-loop cell has exactly two on-loop orthogonal neighbours.
// Reads the cell's own membership, then each neighbour's; off cells are free.
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
const degrees = gridCells.map(cell => new NFA(degreeMachine, 'degree',
  ...loop.at([cell, ...graph.neighbours(cell)])));

// --- No diagonal self-touch: forbid a 2x2 block whose only on cells are a diagonal.
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
// One NFA on the top-left block, replicated (translated) to every block origin.
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noDiagonalTouches = loop.makeReplicate(
  new NFA(noDiagonalTouchMachine, 'no-touch',
    ...loop.at(graph.block(gridCells[0], 2, 2))),
  loop.at(blockOrigins));

// --- Whisper on the loop: for orthogonally-adjacent cells both on the loop
// (which, by the degree-2 argument above, are always consecutive along it),
// their digits differ by at least 5. Off cells and off/on pairs are unconstrained.
const whisperMachine = NFA.encodeSpec({
  startState: { phase: 'aOn' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'aOn':
        return value === ON ? { phase: 'aDigit' } : { phase: 'skip', left: 3 };
      case 'aDigit':
        return { phase: 'bOn', aDigit: value };
      case 'bOn':
        return value === ON
          ? { phase: 'bDigit', aDigit: state.aDigit }
          : { phase: 'skip', left: 1 };
      case 'bDigit':
        return Math.abs(state.aDigit - value) >= WHISPER_MIN_DIFF
          ? { phase: 'done' } : undefined;
      case 'skip':
        return state.left > 1 ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
// Right/down steps only: each orthogonal pair is covered once.
const whispers = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dR, dC]) => graph.step(cell, dR, dC))
  .filter(Boolean)
  .map(other => new NFA(whisperMachine, 'whisper',
    loop.at(cell), cell, loop.at(other), other)));

return [
  new Shape('9x9'),
  loop.toVar('loop'),
  ...cageConstraints,
  ...whiteDots,
  ...membership,
  // Single loop: the on-loop cells form one orthogonally-connected region.
  new ConnectedValues('VL', ON),
  ...degrees,
  noDiagonalTouches,
  ...whispers,
];
