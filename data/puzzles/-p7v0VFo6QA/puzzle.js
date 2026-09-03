// Title: German Hisses
// Author: Dying Flutchman
// Video: https://www.youtube.com/watch?v=-p7v0VFo6QA
// Source: https://app.crackingthecryptic.com/sudoku/fdBbF4dTDF

// Normal sudoku rules apply. Two snakes lie in the grid: each is a one-cell-wide
// path of orthogonally connected cells whose two ends are circled cells. A snake
// may not touch itself or the other snake orthogonally; diagonal contact is
// allowed. Adjacent digits along a snake differ by at least 5. The non-snake
// cells form regions -- their orthogonally connected groups -- in which digits
// cannot repeat, and five small corner clues give facts about five region
// totals. A given digit counts the snake cells in the 3x3 square centred on it,
// its own cell included.
//
// Partial encoding. Two rules are omitted: digits cannot repeat within a region,
// and the five corner clues on the region totals (>26 at R5C2, <22 at R7C5, >5
// at R6C7, Even at R3C8, ? at R8C8). The one consequence of them that is
// encoded is that those five clued cells are themselves non-snake cells.

const OFF = 1;       // membership codes carried by the VS overlay
const SNAKE_A = 2;
const SNAKE_B = 3;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const cells = graph.cells();

// One membership cell per grid cell: which snake this cell is on, or none.
const snake = graph.makeOverlay('VS');

// Drawn data.
const endpoints = ['R1C2', 'R1C9', 'R8C4', 'R9C5'];    // the four circles
const regionClued = ['R5C2', 'R7C5', 'R6C7', 'R3C8', 'R8C8'];  // corner clues
const givens = [                                        // the given digits
  ['R2C5', 3], ['R3C4', 6], ['R7C1', 3], ['R7C4', 5], ['R8C2', 4],
];

// Every orthogonally adjacent pair, once each: a right step and a down step
// from every cell, dropping the ones that fall off the grid.
const adjacentPairs = cells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dR, dC]) => graph.step(cell, dR, dC))
  .filter(Boolean)
  .map(other => [cell, other]));

// --- Membership. Only the three codes above are legal; the circles are on a
// snake and the corner-clued cells are in a region, so off both snakes. The two
// snakes are interchangeable in this encoding, so the first circle in reading
// order is named SNAKE_A to break that relabelling symmetry.
const membership = [
  snake.makeReplicate(new Given(snake.cells()[0], OFF, SNAKE_A, SNAKE_B)),
  ...snake.at(endpoints).map(cell => new Given(cell, SNAKE_A, SNAKE_B)),
  new Given(snake.at(endpoints[0]), SNAKE_A),
  ...snake.at(regionClued).map(cell => new Given(cell, OFF)),
];

// --- Snake shape: each snake's cells are one connected group in which every
// circle has one same-snake orthogonal neighbour and every other snake cell has
// two. Connected with maximum degree 2 and exactly two degree-1 cells is a
// simple path, so this also carries "a snake cannot touch itself": a self-touch
// would give some cell a third same-snake neighbour.
// The machine reads the cell's own membership and then each neighbour's,
// counting the neighbours that repeat it; an off-snake cell is unconstrained.
const degreeSpec = required => NFA.encodeSpec({
  startState: { label: null, count: 0 },
  transition: ({ label, count }, membership) => {
    if (label === null) return { label: membership, count: 0 };
    if (label === OFF) return { label: OFF, count: 0 };  // off-snake: absorbing
    const next = count + (membership === label ? 1 : 0);
    return next > required ? undefined : { label, count: next };
  },
  accept: ({ label, count }) => label === OFF || count === required,
}, geometry.numValues);
const endSpec = degreeSpec(1);
const middleSpec = degreeSpec(2);
const endpointSet = new Set(endpoints);
const degrees = cells.map(cell => new NFA(
  endpointSet.has(cell) ? endSpec : middleSpec, 'snake degree',
  ...snake.at([cell, ...graph.neighbours(cell)])));

// --- The two snakes do not touch each other orthogonally: adjacent cells may
// not carry two different snake codes. One template per step direction, stamped
// onto every cell that has a neighbour that way.
const separationKey = Pair.fnToKey(
  (a, b) => a === OFF || b === OFF || a === b, geometry.numValues);
const snakeOrigin = snake.cells()[0];
const separations = [[0, 1], [1, 0]].map(([dR, dC]) => snake.makeReplicate(
  new Pair(separationKey, 'snakes apart',
    snakeOrigin, snake.step(snakeOrigin, dR, dC)),
  snake.cells().filter(cell => snake.step(cell, dR, dC))));

// --- Hisses: consecutive digits along a snake differ by at least 5. Since a
// snake never touches itself, two orthogonally adjacent cells of the same snake
// are always consecutive along it. The machine reads membership and digit for
// each cell of the pair; when the two are not on one snake the remaining
// symbols are absorbed by a countdown and the pair is unconstrained.
const hissMachine = NFA.encodeSpec({
  startState: { phase: 'aMember' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'aMember':
        return value === OFF
          ? { phase: 'skip', left: 3 }
          : { phase: 'aDigit', label: value };
      case 'aDigit':
        return { phase: 'bMember', label: state.label, aDigit: value };
      case 'bMember':
        return value === state.label
          ? { phase: 'bDigit', aDigit: state.aDigit }
          : { phase: 'skip', left: 1 };
      case 'bDigit':
        return Math.abs(state.aDigit - value) >= 5 ? { phase: 'done' } : undefined;
      case 'skip':
        return state.left > 1
          ? { phase: 'skip', left: state.left - 1 }
          : { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const hisses = adjacentPairs.map(([a, b]) => new NFA(
  hissMachine, 'hiss', snake.at(a), a, snake.at(b), b));

// --- Counting clues: the given digit equals the number of snake cells in its
// 3x3 square. The machine reads the digit, then the membership of the square's
// cells -- the clue's own cell and its up-to-8 king neighbours, so an edge cell
// simply has a smaller square.
const countMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };  // the given digit
    const next = count + (value === OFF ? 0 : 1);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);
const snakeCounts = givens.map(([cell]) => new NFA(countMachine, 'snake count',
  cell, ...snake.at([cell, ...graph.kingNeighbours(cell)])));

return [
  new Shape('9x9'),
  snake.toVar('snake'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...membership,
  new ConnectedValues('VS', SNAKE_A),
  new ConnectedValues('VS', SNAKE_B),
  ...degrees,
  ...separations,
  ...hisses,
  ...snakeCounts,
];
