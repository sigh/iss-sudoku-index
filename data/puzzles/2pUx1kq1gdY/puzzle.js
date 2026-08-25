// Title: An Odd Serpent
// Author: Jeff Wajes
// Video: https://www.youtube.com/watch?v=2pUx1kq1gdY
// Source: https://app.crackingthecryptic.com/webapp/mr6QBMf8HN

// Normal sudoku rules apply; killer cages sum to their printed total (distinct
// digits within a cage). A hidden snake of unknown length/endpoints, all of
// whose cells hold odd digits, visits every box, never runs orthogonally
// adjacent to itself except at consecutive body cells, and never runs
// orthogonally adjacent to any odd-digit cell outside its own body (diagonal
// touches are always allowed, in both cases).

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const ODD = [1, 3, 5, 7, 9];

// Cage cells, transcribed from the puzzle's drawn cage geometry.
const cages = [
  [11, ['R1C1', 'R2C1', 'R3C1']],
  [16, ['R1C3', 'R2C3']],
  [18, ['R1C7', 'R1C8', 'R2C7', 'R2C8']],
  [27, ['R5C2', 'R6C1', 'R6C2', 'R6C3']],
  [30, ['R4C4', 'R4C5', 'R4C6', 'R5C5', 'R5C6', 'R6C6']],
  [38, ['R4C8', 'R4C9', 'R5C8', 'R5C9', 'R6C8', 'R6C9']],
  [11, ['R8C1', 'R8C2', 'R9C1', 'R9C2']],
  [17, ['R8C4', 'R8C6', 'R9C4', 'R9C5', 'R9C6']],
  [10, ['R9C8', 'R9C9']],
];
const cageConstraints = cages.map(([total, cells]) => new Cage(total, ...cells));

// --- Snake membership overlay: every cell is OFF the snake, an interior (MID)
// body cell, or one of its two ends (END). Values are arbitrary small
// discriminants (not read as digits).
const OFF = 1;
const MID = 2;
const END = 3;

const snake = graph.makeOverlay('VP');
const originCell = snake.cells()[0];
const membershipDomain = snake.makeReplicate(new Given(originCell, OFF, MID, END));

// --- Snake cells hold odd digits (off-snake cells are unrestricted, since the
// grid may contain odd digits that are not part of the snake). Reads the
// membership value, then the digit, at the same cell.
const onImpliesOddKey = Pair.fnToKey(
  (membership, digit) => membership === OFF || ODD.includes(digit),
  geometry.numValues);
const onImpliesOdd = gridCells.map(cell =>
  new Pair(onImpliesOddKey, 'on-odd', snake.at(cell), cell));

// --- Visits all 9 boxes: each box contains at least one snake cell (MID or
// END), checked with a regex over the box's membership cells (order does not
// matter, this only tests "somewhere in this set").
const onChar = `[${MID}${END}]`;
const boxCoverage = graph.boxes().map(box =>
  new Regex(`.*${onChar}.*`, ...snake.at(box)));

// --- Degree: a MID cell has exactly 2 on-snake orthogonal neighbours, an END
// cell exactly 1, an OFF cell is unconstrained. This is what turns "connected"
// into "one simple path": reads a cell's own membership, then each orthogonal
// neighbour's.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, count }, membership) => {
    if (phase === 'start') {
      if (membership === OFF) return { phase: 'off' };
      return { phase: membership === END ? 'end' : 'mid', count: 0 };
    }
    if (phase === 'off') return { phase: 'off' };
    const next = count + (membership !== OFF ? 1 : 0);
    const cap = phase === 'end' ? 1 : 2;
    return next > cap ? undefined : { phase, count: next };
  },
  accept: ({ phase, count }) =>
    phase === 'off' || count === (phase === 'end' ? 1 : 2),
}, geometry.numValues);
const degrees = gridCells.map(cell =>
  new NFA(degreeMachine, 'degree', ...snake.at([cell, ...graph.neighbours(cell)])));

// --- Exactly two END cells overall (the snake's head and tail).
const endpointCount = new ContainExact(`${END}_${END}`, ...snake.cells());

// --- Single connected region: with the degree rule above (every on-snake
// cell has 1 or 2 on-snake neighbours, and exactly two cells have 1), a
// single connected on-snake region can only be one simple path (a lone cycle
// has no degree-1 cell, and any degree-3 junction is already excluded by the
// degree machine's cap). This also closes "does not touch itself
// orthogonally": a self-touch would give some cell a third on-snake
// neighbour, which the degree machine already rejects.
const connected = new ConnectedValues('VP', [MID, END]);

// --- Does not orthogonally touch any odd cell outside its own body: for each
// grid edge, forbid an on-snake cell next to an off-snake odd-digit cell.
// Reads (membership, digit) for one cell of the edge, then the other; each
// direction of the violation is checked explicitly since the pair is
// unordered in the rule.
const noOddTouchMachine = NFA.encodeSpec({
  startState: { phase: 'pathA' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'pathA':
        return { phase: 'digitA', pathA: value };
      case 'digitA':
        return { phase: 'pathB', pathA: state.pathA, digitA: value };
      case 'pathB':
        return { phase: 'digitB', pathA: state.pathA, digitA: state.digitA, pathB: value };
      case 'digitB': {
        const { pathA, digitA, pathB } = state;
        const digitB = value;
        const onA = pathA !== OFF, onB = pathB !== OFF;
        const oddA = ODD.includes(digitA), oddB = ODD.includes(digitB);
        const violates = (onA && !onB && oddB) || (onB && !onA && oddA);
        return violates ? undefined : { phase: 'done' };
      }
      default:
        return undefined;
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
// Right/down steps only, so each grid edge is checked exactly once.
const noOddTouches = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dR, dC]) => graph.step(cell, dR, dC))
  .filter(Boolean)
  .map(other => new NFA(noOddTouchMachine, 'no-odd-touch',
    snake.at(cell), cell, snake.at(other), other)));

return [
  new Shape('9x9'),
  ...cageConstraints,
  snake.toVar('snake'),
  membershipDomain,
  ...onImpliesOdd,
  ...boxCoverage,
  ...degrees,
  endpointCount,
  connected,
  ...noOddTouches,
];
