// Title: First Advent Sunday Lake Tour
// Author: Sandra & Nala
// Video: https://www.youtube.com/watch?v=h3yMhjfPZjo
// Source: https://sudokupad.app/p9x40zygp1

// Normal Sudoku; the eight dashed no-repeat cages; the five positive Kropki
// dots; and Lake Tour Path. Lake Tour membership is a two-value overlay: every
// marked cell is on one orthogonally connected degree-2 cycle, and used edges
// join digits differing by at most 2. Diagonal contact is allowed by the rules.

const ON = 1;
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const loop = graph.makeOverlay('VL');
const gridCells = graph.cells();

// Dashed cage cells from the source artwork; every one must be visited.
const cageCells = [
  'R7C5', 'R8C5', 'R8C6', 'R8C3', 'R9C3', 'R9C7', 'R9C8',
  'R6C1', 'R6C2', 'R2C3', 'R2C4', 'R3C3', 'R4C3', 'R1C4',
  'R1C5', 'R2C7', 'R3C7', 'R5C9', 'R6C9',
];

const cages = [
  new Cage(8, 'R7C5', 'R8C5', 'R8C6'),
  new Cage(17, 'R8C3', 'R9C3'),
  new Cage(7, 'R9C7', 'R9C8'),
  new Cage(6, 'R6C1', 'R6C2'),
  new Cage(10, 'R2C3', 'R2C4', 'R3C3', 'R4C3'),
  new Cage(10, 'R1C4', 'R1C5'),
  new Cage(13, 'R2C7', 'R3C7'),
  new Cage(14, 'R5C9', 'R6C9'),
];

const membership = [
  loop.makeReplicate(new Given(loop.cells()[0], ON, OFF)),
  ...loop.at(cageCells).map(cell => new Given(cell, ON)),
];

// An on-path cell has exactly two on-path orthogonal neighbours; off-path cells
// impose no degree condition. Together with ConnectedValues this is one loop.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, membershipValue) => {
    if (phase === 'start') {
      return membershipValue === ON
        ? { phase: 'on', onNeighbours: 0 }
        : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (membershipValue === ON ? 1 : 0);
    return count > 2 ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === 2,
}, geometry.numValues);
const degrees = gridCells.map(cell => new NFA(degreeMachine, 'degree',
  ...loop.at([cell, ...graph.neighbours(cell)])));

// Each right/down adjacency is considered once. When both cells are on the
// tour, their digits must differ by at most 2; otherwise this edge is free.
const pathDifferenceMachine = NFA.encodeSpec({
  startState: { phase: 'firstMembership' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'firstMembership':
        return value === ON ? { phase: 'firstDigit' } : { phase: 'skip', left: 3 };
      case 'firstDigit':
        return { phase: 'secondMembership', firstDigit: value };
      case 'secondMembership':
        return value === ON
          ? { phase: 'secondDigit', firstDigit: state.firstDigit }
          : { phase: 'skip', left: 1 };
      case 'secondDigit':
        return Math.abs(state.firstDigit - value) <= 2 ? { phase: 'done' } : undefined;
      case 'skip':
        return state.left > 1 ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const pathDifferences = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
  .filter(Boolean)
  .map(other => new NFA(pathDifferenceMachine, 'path-difference',
    loop.at(cell), cell, loop.at(other), other)));

return [
  new Shape('9x9'),
  ...cages,
  new WhiteDot('R3C5', 'R3C6'),
  new WhiteDot('R3C1', 'R4C1'),
  new WhiteDot('R2C1', 'R3C1'),
  new BlackDot('R5C3', 'R6C3'),
  new BlackDot('R3C7', 'R4C7'),
  loop.toVar('lake-tour'),
  ...membership,
  new ConnectedValues('VL', ON),
  ...degrees,
  ...pathDifferences,
];
