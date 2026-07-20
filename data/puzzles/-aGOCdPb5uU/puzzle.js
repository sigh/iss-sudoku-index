// Title: can i pet that dog!?
// Author: aqjhs
// Video: https://www.youtube.com/watch?v=-aGOCdPb5uU
// Source: https://sudokupad.app/7llvcaivec

// Partial encoding: Sudoku, the complete no-touch loop topology, the two fixed
// dog/arrow cells, loop whispers, and circle counts. The value mapping along
// the unknown oriented loop, and therefore the value cages and outside value
// sums, require distance/order along an unknown graph and are omitted.

const ON = 1;
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const loop = graph.makeOverlay('VL');

const circles = ['R3C7', 'R7C6', 'R8C8', 'R9C6'];
const forcedLoopCells = ['R6C6', 'R6C7'];

// Every loop Var is binary; circles are off-loop and the dog plus the cell
// indicated by its arrow are on-loop.
const membership = [
  loop.makeReplicate(new Given(loop.cells()[0], ON, OFF)),
  ...loop.at(circles).map(cell => new Given(cell, OFF)),
  ...loop.at(forcedLoopCells).map(cell => new Given(cell, ON)),
];

// An on-loop cell has exactly two orthogonal on-loop neighbours. Off-loop
// cells impose no neighbour count.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, count }, value) => {
    if (phase === 'start') {
      return value === ON ? { phase: 'on', count: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const next = count + (value === ON ? 1 : 0);
    return next > 2 ? undefined : { phase: 'on', count: next };
  },
  accept: ({ phase, count }) => phase === 'off' || count === 2,
}, geometry.numValues);
const degrees = gridCells.map(cell => new NFA(
  degreeMachine,
  'loop-degree',
  ...loop.at([cell, ...graph.neighbours(cell)]),
));

// In a 2x2 block, a diagonal-only pair of loop cells would be a forbidden
// diagonal self-touch. Three cells around a turn are allowed.
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, value) => {
    if (block === null) return { block: null };
    const next = [...block, value === ON];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const firstBlock = graph.block(blockOrigins[0], 2, 2);
const noDiagonalTouches = loop.makeReplicate(
  [new NFA(noDiagonalTouchMachine, 'no-diagonal-touch', ...loop.at(firstBlock))],
  loop.at(blockOrigins),
);

// A circle's digit equals the number of on-loop king-neighbours.
const circleCountMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value === ON ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);
const circleCounts = circles.map(cell => new NFA(
  circleCountMachine,
  'circle-count',
  cell,
  ...loop.at(graph.kingNeighbours(cell)),
));

// If both orthogonally adjacent cells are on the loop, their digits differ by
// at least 5. Reads membership/digit for the first cell, then for the second.
const whisperMachine = NFA.encodeSpec({
  startState: { phase: 'first-membership' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'first-membership':
        return value === ON ? { phase: 'first-digit' } : { phase: 'skip', left: 3 };
      case 'first-digit':
        return { phase: 'second-membership', firstDigit: value };
      case 'second-membership':
        return value === ON
          ? { phase: 'second-digit', firstDigit: state.firstDigit }
          : { phase: 'skip', left: 1 };
      case 'second-digit':
        return Math.abs(state.firstDigit - value) >= 5 ? { phase: 'done' } : undefined;
      case 'skip':
        return state.left > 1
          ? { phase: 'skip', left: state.left - 1 }
          : { phase: 'done' };
      case 'done':
        return undefined;
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const whispers = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
  .filter(Boolean)
  .map(other => new NFA(
    whisperMachine,
    'loop-whisper',
    loop.at(cell), cell, loop.at(other), other,
  )));

return [
  new Shape('9x9'),
  loop.toVar('loop membership'),
  ...membership,
  // Connected plus degree 2 forces exactly one simple cycle because the
  // no-touch rule makes orthogonal membership adjacency equal loop adjacency.
  new ConnectedValues('VL', ON),
  ...degrees,
  noDiagonalTouches,
  ...circleCounts,
  ...whispers,
];
