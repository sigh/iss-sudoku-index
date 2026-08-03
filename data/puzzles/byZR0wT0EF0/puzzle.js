// Title: Snake Sudoku
// Author: Tsunami
// Video: https://www.youtube.com/watch?v=byZR0wT0EF0
// Source: https://app.crackingthecryptic.com/sudoku/3HRPmtLJNF

// Rules encoded:
// - Normal sudoku (default row/column/box all-different).
// - A snake: a 1-cell-wide path from R2C3 to R6C1 (the two gray cells) that
//   may touch itself diagonally but not orthogonally, and holds only odd
//   digits on its cells.
// - Each drawn 'X' between two orthogonally adjacent cells means exactly one
//   of the two is part of the snake.
//
// Snake membership is a Var per cell (ON/OFF). It is shaped into a single
// simple path by: fixing the two gray cells ON, requiring every ON cell to
// have exactly the right count of ON orthogonal neighbours (1 at the two
// endpoints, 2 elsewhere), and asserting the ON cells form one connected
// region -- degree-2 alone would still allow a disjoint extra loop elsewhere,
// which ConnectedValues rules out. The degree cap (reject once an ON cell's
// ON-neighbour count would exceed its target) is exactly what forbids an
// orthogonal self-touch; diagonal touching is unconstrained, matching the
// rule.

const ON = 1, OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const numValues = geometry.numValues;
const gridCells = graph.cells();

const HEAD = 'R2C3', TAIL = 'R6C1';   // the two gray cells

// Provenance: overlays[].text === "X", each centred on one shared edge
// between two orthogonally adjacent cells (source-assets.json / geometry
// summary).
const X_MARK_EDGES = [
  ['R1C7', 'R2C7'],
  ['R3C6', 'R4C6'],
  ['R3C2', 'R3C3'],
  ['R4C3', 'R5C3'],
  ['R6C7', 'R6C8'],
  ['R8C5', 'R9C5'],
  ['R7C2', 'R8C2'],
];

const snake = graph.makeOverlay('VN');

// --- Snake membership domain + fixed endpoints --------------------------
const membership = [
  snake.makeReplicate(new Given(snake.cells()[0], ON, OFF)),
  new Given(snake.at(HEAD), ON),
  new Given(snake.at(TAIL), ON),
];

// --- Degree: an on-snake cell has exactly `target` on-snake orthogonal
// neighbours; an off-snake cell is unconstrained. Reads [membership of the
// cell, membership of each of its neighbours].
const degreeMachine = (target) => NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, value) => {
    if (phase === 'start') {
      return value === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (value === ON ? 1 : 0);
    return count > target ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === target,
}, numValues);
const degreeTwo = degreeMachine(2);
const degreeOne = degreeMachine(1);
const ENDPOINTS = new Set([HEAD, TAIL]);
const degrees = gridCells.map(cell => new NFA(
  ENDPOINTS.has(cell) ? degreeOne : degreeTwo, 'snake-degree',
  ...snake.at([cell, ...graph.neighbours(cell)])));

// Single connected path: with degree-1 at the two named endpoints and
// degree-2 elsewhere, one connected ON region rules out a disjoint extra loop.
const connectivity = new ConnectedValues('VN', ON);

// --- Snake cells hold only odd digits: a 2-cell relation between a cell's
// own membership and its own digit, so this is a Pair, not an NFA.
const oddIfSnakeKey = Pair.fnToKey(
  (membershipValue, digit) => membershipValue === OFF || digit % 2 === 1,
  numValues);
const oddSnakeDigits = gridCells.map(cell =>
  new Pair(oddIfSnakeKey, 'odd-if-snake', snake.at(cell), cell));

// --- 'X' edges: exactly one of the pair is on-snake. A 2-cell relation
// between the two cells' own membership Vars.
const xorKey = Pair.fnToKey(
  (a, b) => (a === ON) !== (b === ON),
  numValues);
const xMarks = X_MARK_EDGES.map(([a, b]) =>
  new Pair(xorKey, 'x-mark', snake.at(a), snake.at(b)));

return [
  new Shape('9x9'),
  new Given('R1C1', 7), new Given('R1C3', 6), new Given('R1C6', 2),
  new Given('R2C4', 4), new Given('R2C7', 5),
  new Given('R3C5', 1), new Given('R3C6', 9),
  new Given('R4C1', 8), new Given('R4C3', 5), new Given('R4C4', 7), new Given('R4C9', 3),
  new Given('R5C2', 6), new Given('R5C5', 5), new Given('R5C8', 2),
  new Given('R6C1', 3), new Given('R6C2', 4),
  new Given('R7C3', 9), new Given('R7C8', 1), new Given('R7C9', 2),
  new Given('R8C5', 9), new Given('R8C6', 5),
  new Given('R9C1', 1), new Given('R9C2', 8),
  snake.toVar('snake'),
  ...membership,
  ...degrees,
  connectivity,
  ...oddSnakeDigits,
  ...xMarks,
];
