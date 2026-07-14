// Title: Snake Egg Sudoku
// Author: 12tone
// Video: https://www.youtube.com/watch?v=Aap1w4kiKfY
// Source: https://sudokupad.app/nw6kb2aayl

// Four labels identify the snakes; 5 means that the cell is outside every snake.
// The label ordering is canonicalized by first row-major appearance, removing the
// otherwise irrelevant 4! permutations of the auxiliary labels.
const SNAKES = [1, 2, 3, 4];
const OFF = 5;
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const snake = graph.makeOverlay('VS');
const snakeCells = snake.cells();

const eggs = [
  'R2C2', 'R2C8', 'R4C4', 'R4C6',
  'R6C4', 'R6C6', 'R8C2', 'R8C8',
];
const eggSet = new Set(eggs);

const givens = [
  ['R1C2', 2], ['R1C7', 1], ['R3C2', 4], ['R4C3', 6],
  ['R4C7', 5], ['R6C1', 5], ['R7C5', 3], ['R7C7', 2],
  ['R7C9', 6], ['R8C4', 6], ['R9C3', 7], ['R9C9', 3],
].map(([cell, value]) => new Given(cell, value));

// Egg cells are endpoints (one same-label neighbour). Other selected cells are
// internal path cells (two same-label neighbours); non-snake cells are free.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'center' },
  transition: (state, value) => {
    if (state.phase === 'center') {
      return { phase: 'neighbours', label: value, same: 0 };
    }
    if (state.label === OFF) return state;
    const same = state.same + (value === state.label ? 1 : 0);
    return same > 2 ? undefined : { ...state, same };
  },
  accept: ({ label, same }) => label === OFF || same === 2,
}, geometry.numValues);
const endpointMachine = NFA.encodeSpec({
  startState: { phase: 'center' },
  transition: (state, value) => {
    if (state.phase === 'center') {
      return value === OFF ? undefined : { phase: 'neighbours', label: value, same: 0 };
    }
    const same = state.same + (value === state.label ? 1 : 0);
    return same > 1 ? undefined : { ...state, same };
  },
  accept: ({ phase, same }) => phase === 'neighbours' && same === 1,
}, geometry.numValues);
const degrees = gridCells.map(cell => new NFA(
  eggSet.has(cell) ? endpointMachine : degreeMachine,
  eggSet.has(cell) ? 'egg endpoint' : 'snake degree',
  ...snake.at([cell, ...graph.neighbours(cell)]),
));

// Orthogonally adjacent selected cells must belong to the same snake, and their
// Sudoku digits must have opposite parity. Thus snakes cannot touch each other,
// and every path alternates odd/even.
const adjacencyMachine = NFA.encodeSpec({
  startState: { phase: 'aLabel' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'aLabel': return { phase: 'aDigit', aLabel: value };
      case 'aDigit': return { phase: 'bLabel', aLabel: state.aLabel, aDigit: value };
      case 'bLabel':
        if (state.aLabel === OFF || value === OFF) return { phase: 'skip' };
        return value === state.aLabel
          ? { phase: 'bDigit', aDigit: state.aDigit }
          : undefined;
      case 'bDigit':
        return value % 2 !== state.aDigit % 2 ? { phase: 'done' } : undefined;
      case 'skip': return { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const adjacencies = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
  .filter(Boolean)
  .map(other => new NFA(adjacencyMachine, 'snake adjacency',
    snake.at(cell), cell, snake.at(other), other)));

// Each snake contains every digit 1-9 exactly once. One compact NFA per label
// scans (label, digit) pairs and stores the set of digits already encountered.
const digitSetMachines = SNAKES.map(target => NFA.encodeSpec({
  startState: { phase: 'label', seen: 0 },
  transition: (state, value) => {
    if (state.phase === 'label') {
      return { phase: 'digit', seen: state.seen, selected: value === target };
    }
    if (!state.selected) return { phase: 'label', seen: state.seen };
    const bit = 1 << (value - 1);
    return state.seen & bit
      ? undefined
      : { phase: 'label', seen: state.seen | bit };
  },
  accept: ({ phase, seen }) => phase === 'label' && seen === 0x1ff,
}, geometry.numValues));
const interleavedCells = gridCells.flatMap((cell, index) => [snakeCells[index], cell]);
const digitSets = digitSetMachines.map((machine, index) =>
  new NFA(machine, `snake ${index + 1} digits`, ...interleavedCells));

// In row-major order, a label may first appear only after every smaller label
// has appeared. This is a pure symmetry break and does not choose any path.
const canonicalLabelsMachine = NFA.encodeSpec({
  startState: { largestIntroduced: 0 },
  transition: ({ largestIntroduced }, value) => {
    if (value === OFF || value <= largestIntroduced) return { largestIntroduced };
    return value === largestIntroduced + 1
      ? { largestIntroduced: value }
      : undefined;
  },
  accept: ({ largestIntroduced }) => largestIntroduced === SNAKES.length,
}, geometry.numValues);

return [
  new Shape('9x9'),
  ...givens,
  snake.toVar('snake labels'),
  snake.makeReplicate(new Given(snakeCells[0], ...SNAKES, OFF)),
  new NFA(canonicalLabelsMachine, 'canonical snake labels', ...snakeCells),
  ...SNAKES.map(label => new ConnectedValues('VS', label)),
  ...degrees,
  ...adjacencies,
  ...digitSets,
];
