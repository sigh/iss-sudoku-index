// Title: 7 Thermosnakes
// Author: Nordy
// Video: https://www.youtube.com/watch?v=34zjSOgBMPI
// Source: https://sudokupad.app/u9azfq7eta

// Normal sudoku rules, plus: each of the seven gray thermosquares is the start of
// a non-branching thermosnake that steps orthogonally through the grid and is
// exactly 7 cells long (the thermosquare included); two thermosnakes never share
// a cell, though they may touch each other any number of times; a thermosnake
// may not touch itself; and the digits along a thermosnake increase from its
// start to its end. Cells on no thermosnake carry no extra rule.
//
// The thermosnakes themselves are not drawn, so a Var overlay 'VS' holds one
// value per grid cell: OFF, or the id of the thermosnake owning that cell. A
// cell holds a single value, which is "two different thermosnakes cannot enter
// the same cell"; nothing relates cells of different thermosnakes, which is
// "it may touch any other thermosnake any number of times".
//
// Reading of "a thermosnake cannot touch itself orthogonally or diagonally":
// applied to snake cells more than two steps apart along the snake. Taken over
// every non-consecutive pair instead, no snake could ever turn -- a turn leaves
// the two cells either side of it diagonally adjacent -- so every snake would be
// a straight 7-cell run, and no straight 7-cell run passes through the R4C5
// thermosquare in any direction. Contacts that survive the relaxation
// (orthogonal contact at any separation, diagonal contact beyond a single turn)
// are forbidden below.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const snake = graph.makeOverlay('VS');
const gridCells = graph.cells();

// Thermosquares, from the seven gray square outlines and their gray dots.
const STARTS = ['R1C1', 'R1C3', 'R3C1', 'R2C6', 'R2C8', 'R4C5', 'R9C3'];
const LENGTH = 7;

// VS values: OFF plus one id per thermosnake.
const OFF = 1;
const SNAKE_IDS = STARTS.map((_, i) => i + 2);
const isStart = (cell) => STARTS.includes(cell);

// Bounds derived from "exactly 7 cells long" and "the digits increase": a
// thermosnake reaches at most 6 orthogonal steps from its thermosquare, the
// digit at its nth cell is at least n (it rises by at least 1 per step from at
// least 1), and its thermosquare is therefore at most 9 - 6 = 3.
const stepsFrom = (cell, start) => {
  const a = parseCellId(cell);
  const b = parseCellId(start);
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
};
const reachableIds = (cell) => SNAKE_IDS.filter(
  (id, i) => stepsFrom(cell, STARTS[i]) <= LENGTH - 1);

const snakeDomain = gridCells.map(
  cell => new Given(snake.at(cell), OFF, ...reachableIds(cell)));
const snakeStarts = STARTS.map(
  (cell, i) => new Given(snake.at(cell), SNAKE_IDS[i]));
const startDigits = STARTS.map(cell => new Given(cell, 1, 2, 3));
// A cell that is d orthogonal steps from its thermosquare is at best the
// (d + 1)th cell of that thermosnake, so its digit is at least d + 1.
// Reads [VS of the cell, digit of the cell].
// Values that are not a thermosnake id (OFF, and the 9th value the overlay
// never uses) bound nothing; snakeDomain is what excludes them.
const minDigitRules = gridCells.map(cell => new Pair(
  Pair.fnToKey(
    (id, digit) => {
      const start = STARTS[id - 2];
      return !start || digit >= 1 + stepsFrom(cell, start);
    },
    geometry.numValues),
  'snake-min-digit', snake.at(cell), cell));
const snakeLengths = new ContainExact(
  SNAKE_IDS.flatMap(id => Array(LENGTH).fill(id)).join('_'),
  ...snake.cells());
const snakeConnected = SNAKE_IDS.map(id => new ConnectedValues('VS', id));

// Each snake's cells are orthogonally connected (above), number 7 (above), have
// at most two same-snake orthogonal neighbours, and the thermosquare has at most
// one: connected with maximum degree 2 and a degree-1 vertex is a simple path,
// so this is a 7-cell orthogonal path running from the thermosquare. Maximum
// degree 2 is also "non-branching" and "cannot touch itself orthogonally": the
// only orthogonal neighbours a cell may have are its two path neighbours.
// Reads [own VS, VS of each orthogonal neighbour] and counts the matches.
const degreeMachine = (maxDegree) => NFA.encodeSpec({
  startState: { phase: 'self' },
  transition: (state, value) => {
    if (state.phase === 'self') {
      return value === OFF ? { ignore: true } : { id: value, count: 0 };
    }
    if (state.ignore) return state;
    const count = state.count + (value === state.id ? 1 : 0);
    return count > maxDegree ? undefined : { id: state.id, count };
  },
  accept: () => true,
}, geometry.numValues);
const pathDegree = [2, 1].map(degreeMachine);
const degreeRules = gridCells.map(cell => new NFA(
  pathDegree[isStart(cell) ? 1 : 0], 'snake-degree',
  snake.at(cell), ...snake.at(graph.neighbours(cell))));

// "Cannot touch itself diagonally", relaxed to leave turns legal: two diagonally
// adjacent cells of one snake must be the two ends of a turn, i.e. one of the
// two cells that complete their 2x2 square must belong to that same snake. That
// shared cell is then orthogonally adjacent to both, so by the degree rule above
// they are its two path neighbours and sit two steps apart along the snake; any
// wider diagonal contact has no such cell and is rejected.
// Reads [VS of the two diagonal cells, VS of the two cells completing the 2x2].
const diagonalMachine = NFA.encodeSpec({
  startState: { phase: 'first' },
  transition: (state, value) => {
    if (state.phase === 'first') {
      return value === OFF ? { ignore: true } : { phase: 'second', id: value };
    }
    if (state.ignore) return state;
    if (state.phase === 'second') {
      return value === state.id
        ? { id: state.id, corner: false } : { ignore: true };
    }
    return { id: state.id, corner: state.corner || value === state.id };
  },
  accept: (state) => state.ignore === true || state.corner === true,
}, geometry.numValues);
// Every diagonally adjacent pair is a diagonal of one 2x2 block, so the two
// machines below -- one per diagonal of the top-left block, each reading its own
// pair first and the other pair as the completing cells -- cover them all once
// when stamped on every 2x2 block.
const [topLeft, topRight, bottomLeft, bottomRight] = graph.block(
  gridCells[0], 2, 2);
const diagonalRules = snake.makeReplicate(
  [
    [topLeft, bottomRight, topRight, bottomLeft],
    [topRight, bottomLeft, topLeft, bottomRight],
  ].map(cells => new NFA(diagonalMachine, 'snake-diagonal',
    ...snake.at(cells))),
  snake.at(gridCells.filter(cell => graph.block(cell, 2, 2))));

// Digits increase from start to end. Along the path this is: the thermosquare
// has no same-snake orthogonal neighbour holding a smaller digit, and every
// other snake cell has exactly one. Walking out from the thermosquare, the cell
// after it must exceed it, which then forces the cell after that, and so on to
// the end of the path. Consecutive cells also differ by at most 3, since the
// six rises of a thermosnake are each at least 1 and total at most 9 - 1 = 8.
// Reads [own VS, own digit, then VS and digit of each orthogonal neighbour].
const increaseMachine = (target) => NFA.encodeSpec({
  startState: { phase: 'self' },
  transition: (state, value) => {
    if (state.phase === 'self') {
      return value === OFF ? { ignore: true } : { phase: 'digit', id: value };
    }
    if (state.ignore) return state;
    if (state.phase === 'digit') {
      return { phase: 'neighbour', id: state.id, digit: value, count: 0 };
    }
    if (state.phase === 'neighbour') {
      return { ...state, phase: 'neighbourDigit', match: value === state.id };
    }
    if (state.match && Math.abs(value - state.digit) > 3) return undefined;
    const count = state.count + (state.match && value < state.digit ? 1 : 0);
    if (count > target) return undefined;
    return {
      phase: 'neighbour', id: state.id, digit: state.digit, count,
    };
  },
  accept: (state) => state.ignore === true || state.count === target,
}, geometry.numValues);
const snakeIncrease = [1, 0].map(increaseMachine);
const increaseRules = gridCells.map(cell => new NFA(
  snakeIncrease[isStart(cell) ? 1 : 0], 'snake-increase',
  snake.at(cell), cell,
  ...graph.neighbours(cell).flatMap(n => [snake.at(n), n])));

return [
  new Shape('9x9'),
  new Given('R1C9', 1),
  new Given('R4C8', 2),
  new Given('R7C9', 3),
  snake.toVar('thermosnakes'),
  ...snakeDomain,
  ...snakeStarts,
  ...startDigits,
  ...minDigitRules,
  snakeLengths,
  ...snakeConnected,
  ...degreeRules,
  diagonalRules,
  ...increaseRules,
];
