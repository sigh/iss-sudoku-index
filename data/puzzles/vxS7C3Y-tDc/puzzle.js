// Title: Four Finger Death Punch
// Author: Jonesy
// Video: https://www.youtube.com/watch?v=vxS7C3Y-tDc
// Source: https://sudokupad.app/egz2ug1ntj

// Standard 9x9 Sudoku. A one-cell-wide loop uses orthogonal steps, neither
// branches nor self-touches diagonally; consecutive loop digits are German
// whispers. Circled cells are off the loop, self-count their digit among all
// circles, and count on-loop king-neighbours.

const ON = 1;
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const loop = graph.makeOverlay('VL');
const gridCells = graph.cells();

// Circle positions transcribed from the ten drawn circle underlays.
const circles = [
  'R2C2', 'R2C3', 'R2C5', 'R3C7', 'R4C1',
  'R4C3', 'R6C4', 'R7C6', 'R8C4', 'R8C6',
];

// Loop membership: 1 is on the loop and 2 is off it; every circle is off.
const membership = [
  loop.makeReplicate(new Given(loop.cells()[0], ON, OFF)),
  ...loop.at(circles).map(cell => new Given(cell, OFF)),
];

// An on cell has exactly two orthogonally adjacent on cells; off cells are free.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, value) => {
    if (phase === 'start') {
      return value === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (value === ON ? 1 : 0);
    return count > 2 ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === 2,
}, geometry.numValues);
const degrees = gridCells.map(cell => new NFA(degreeMachine, 'degree',
  ...loop.at([cell, ...graph.neighbours(cell)])));

// A 2x2 may not have exactly its two diagonal cells on the loop.
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
const noDiagonalTouches = loop.makeReplicate(
  new NFA(noDiagonalTouchMachine, 'no-touch',
    ...loop.at(graph.block(gridCells[0], 2, 2))),
  loop.at(blockOrigins));

// For each orthogonal pair, enforce the whispers difference only when both cells
// are on the loop. The alternating values are membership, digit, membership, digit.
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
        return Math.abs(state.aDigit - value) >= 5 ? { phase: 'done' } : undefined;
      case 'skip':
        return state.left > 1 ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const whispers = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dR, dC]) => graph.step(cell, dR, dC))
  .filter(Boolean)
  .map(other => new NFA(whisperMachine, 'whisper',
    loop.at(cell), cell, loop.at(other), other)));

// A circle digit counts on-loop cells among its up-to-eight king-neighbours.
const neighbourCountMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value === ON ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);
const neighbourCounts = circles.map(cell => new NFA(neighbourCountMachine, 'circle-count',
  cell, ...loop.at(graph.kingNeighbours(cell))));

return [
  new Shape('9x9'),
  loop.toVar('loop'),
  ...membership,
  new ConnectedValues('VL', ON),
  ...degrees,
  noDiagonalTouches,
  ...whispers,
  new CountingCircles(...circles),
  ...neighbourCounts,
];
