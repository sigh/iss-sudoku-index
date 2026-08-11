// Title: Snake In The City
// Author: Lizzy01
// Video: https://www.youtube.com/watch?v=Q4zXoaiZ57I
// Source: https://app.crackingthecryptic.com/sudoku/pr8b4tmLpL

// Rules encoded:
// - Normal sudoku: default Shape('9x9') rows/cols/boxes.
// - A snake is shaded: one-cell-wide, no branching, no orthogonal self-touch
//   (diagonal touch allowed), entirely odd digits, endpoints at the two grey
//   circles (R5C1, R9C1). The route may not touch
//   itself, so ON/OFF membership + a degree rule over orthogonal neighbours
//   closes the shape outright (endpoints degree 1, other on-cells degree 2);
//   ConnectedValues over the whole shade layer rules out a disjoint second
//   loop with the same degree profile.
// - Outside skyscraper clues count visible buildings among non-snake cells
//   only, viewed from the clue's side, treating snake cells as fully
//   transparent (neither seen nor blocking). No native class supports the
//   "ignore some cells" mechanic, so each clue is a custom NFA scanning
//   [digit, shade, digit, shade, ...] in viewing order.
// - X (edge sum 10) / V (edge sum 5) clues: the rules explicitly say not all
//   are marked ("Not all Xs and Vs are necessarily given"), which forbids
//   the usual negative constraint, so only the drawn pairs are encoded.

const SNAKE = 1;
const BUILDING = 2;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

// Every cell is snake or building.
const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], SNAKE, BUILDING));

// Snake endpoints: the two grey underlay circles.
const ENDPOINTS = ['R5C1', 'R9C1'];
const endpointGivens = ENDPOINTS.map(cell => new Given(shade.at(cell), SNAKE));
const endpointSet = new Set(ENDPOINTS);

// Degree rule over orthogonal neighbours, expressed as a Sum over the
// neighbours' raw shade values (SNAKE=1, BUILDING=2): the sum equals
// (2 * neighbour count) - (ON-neighbour count), since each ON neighbour
// contributes 1 instead of 2. So pinning the sum to 2k - targetDegree pins
// ON-neighbour count to targetDegree.
const degreeRules = gridCells.map(cell => {
  const neighbourShades = shade.at(graph.neighbours(cell));
  const k = neighbourShades.length;
  const selfShade = shade.at(cell);
  if (endpointSet.has(cell)) {
    // Already forced SNAKE by endpointGivens; needs exactly 1 ON neighbour.
    return new Sum(2 * k - 1, ...neighbourShades);
  }
  // Off cells: no neighbour-count constraint. On (non-endpoint) cells need
  // exactly 2 ON neighbours.
  return new Or([
    new Given(selfShade, BUILDING),
    new And([new Given(selfShade, SNAKE), new Sum(2 * k - 2, ...neighbourShades)]),
  ]);
});

// Rules out a disjoint second component with the same degree profile.
const connectivity = new ConnectedValues('VS', SNAKE);

// Snake cells hold odd digits only.
const oddRules = gridCells.map(cell => new Or([
  new Given(shade.at(cell), BUILDING),
  new Given(cell, 1, 3, 5, 7, 9),
]));

// Outside skyscraper clues, transcribed from the drawn overlay text/position.
const outsideClues = [
  { side: 'top', line: 2, value: 3 },
  { side: 'top', line: 6, value: 2 },
  { side: 'top', line: 8, value: 1 },
  { side: 'bottom', line: 3, value: 4 },
  { side: 'bottom', line: 9, value: 1 },
  { side: 'left', line: 4, value: 3 },
  { side: 'right', line: 1, value: 4 },
  { side: 'right', line: 9, value: 3 },
];

function viewOrderCells(side, line) {
  if (side === 'top') return graph.column(line);
  if (side === 'bottom') return graph.column(line).slice().reverse();
  if (side === 'left') return graph.row(line);
  return graph.row(line).slice().reverse(); // 'right'
}

// One NFA per clue, scanning the row/column in viewing order two symbols per
// cell: its digit, then its shade. State alternates 'digit'/'shade' phase;
// on the shade symbol, only a BUILDING cell can raise the running max height
// and increment the visible count (a SNAKE cell is skipped entirely, neither
// seen nor blocking). Count is clamped at target+1 (a dead sink once the
// clue can only fail) to bound state.
function maskedSkyscraperSpec(target) {
  return NFA.encodeSpec({
    startState: { phase: 'digit', buffered: null, max: 0, count: 0 },
    transition: (state, value) => {
      if (state.phase === 'digit') {
        return { phase: 'shade', buffered: value, max: state.max, count: state.count };
      }
      let { buffered, max, count } = state;
      if (value === BUILDING && buffered > max) {
        max = buffered;
        count = Math.min(count + 1, target + 1);
      }
      return { phase: 'digit', buffered: null, max, count };
    },
    accept: (state) => state.phase === 'digit' && state.count === target,
    maxDepth: 18, // 9 cells x 2 symbols/cell
  }, 9);
}

const skyscraperConstraints = outsideClues.map(({ side, line, value }) => {
  const cells = viewOrderCells(side, line);
  const interleaved = cells.flatMap(cell => [cell, shade.at(cell)]);
  return new NFA(
    maskedSkyscraperSpec(value), `skyscraper-${side}${line}`, interleaved);
});

// X (sum 10) / V (sum 5) edge clues, transcribed from the drawn overlay
// text/position (white-filled letter markers on the shared cell edge).
const xClues = [
  ['R5C5', 'R6C5'],
  ['R8C4', 'R8C5'],
  ['R9C7', 'R9C8'],
  ['R7C9', 'R8C9'],
];
const vClues = [
  ['R6C2', 'R7C2'],
  ['R3C4', 'R4C4'],
];
const xvConstraints = [
  ...xClues.map(([a, b]) => new X(a, b)),
  ...vClues.map(([a, b]) => new V(a, b)),
];

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shadeDomain,
  ...endpointGivens,
  ...degreeRules,
  connectivity,
  ...oddRules,
  ...skyscraperConstraints,
  ...xvConstraints,
];
