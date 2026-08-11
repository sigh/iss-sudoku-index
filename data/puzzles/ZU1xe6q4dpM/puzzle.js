// Title: Boiga Irregularis
// Author: TotallyNormalCat
// Video: https://www.youtube.com/watch?v=ZU1xe6q4dpM
// Source: https://tinyurl.com/3ufffx2y

// Normal sudoku rules apply.
//
// Snake: a one-cell-wide path of orthogonally connected cells that never
// touches itself orthogonally, from R9C1 to R9C7. The two single-cell,
// no-total cages drawn on R9C1/R9C7 are the puzzle's own markers for those
// same start/end cells and add no arithmetic constraint of their own.
// Modelled as a membership Var per grid cell (ON/OFF). Because the snake
// cannot touch itself orthogonally, degree-1 at the two endpoints and
// degree-2 at every other ON cell -- counted over plain orthogonal
// adjacency -- already rules out a non-consecutive ON-ON adjacency, so no
// separate no-touch check is needed. ConnectedValues over ON rules out any
// extra disjoint loop, closing the rule to exactly one simple path between
// the two endpoints.
//
// "Adjacent snake cells must differ by at least 5" applies to two
// orthogonally adjacent ON cells, which -- given the no-self-touch rule
// above -- are always consecutive along the path.
//
// "A digit in a circle is equal to the number of snake cells in the (up to)
// 9 surrounding cells, including itself": a circle's own digit equals the
// count of ON cells among itself and its (up to 8) king-move neighbours.
// "The snake must visit each circle": each circle cell is pinned ON.

const ON = 1;
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// The snake-membership Var cell paired with each grid cell.
const snake = graph.makeOverlay('VS');

const START = 'R9C1';
const END = 'R9C7';
// The three drawn circle cells.
const circles = ['R3C5', 'R3C8', 'R5C2'];

// --- Membership domain + fixed cells ---------------------------------------
const originCell = snake.cells()[0];
const membership = [
  snake.makeReplicate(new Given(originCell, ON, OFF)),
  new Given(snake.at(START), ON),
  new Given(snake.at(END), ON),
  ...snake.at(circles).map(cell => new Given(cell, ON)),
];

// --- Degree: the two endpoints have exactly one ON orthogonal neighbour;
// every other ON cell has exactly two. OFF cells are unconstrained. Reads a
// cell's own membership, then each orthogonal neighbour's.
function degreeMachine(requiredDegree) {
  return NFA.encodeSpec({
    startState: { phase: 'start' },
    transition: ({ phase, onNeighbours }, membershipValue) => {
      if (phase === 'start') {
        return membershipValue === ON
          ? { phase: 'on', onNeighbours: 0 }
          : { phase: 'off' };
      }
      if (phase === 'off') return { phase: 'off' };
      const count = onNeighbours + (membershipValue === ON ? 1 : 0);
      return count > requiredDegree
        ? undefined
        : { phase: 'on', onNeighbours: count };
    },
    accept: ({ phase, onNeighbours }) =>
      phase === 'off' || onNeighbours === requiredDegree,
  }, geometry.numValues);
}
const degreeEndpoint = degreeMachine(1);
const degreeInner = degreeMachine(2);
const endpoints = new Set([START, END]);
const degrees = gridCells.map(cell => new NFA(
  endpoints.has(cell) ? degreeEndpoint : degreeInner,
  'degree', ...snake.at([cell, ...graph.neighbours(cell)])));

// --- Adjacent-on-snake difference >= 5: one NFA per orthogonal edge,
// reading (membership, digit) for each side in turn. Either side OFF makes
// the pair unconstrained; the absorbing 'done' phase reads out the rest.
const diffMachine = NFA.encodeSpec({
  startState: { phase: 'aOn' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'aOn':
        return value === ON ? { phase: 'aDigit' } : { phase: 'done' };
      case 'aDigit':
        return { phase: 'bOn', aDigit: value };
      case 'bOn':
        return value === ON
          ? { phase: 'bDigit', aDigit: state.aDigit }
          : { phase: 'done' };
      case 'bDigit':
        return Math.abs(state.aDigit - value) >= 5
          ? { phase: 'done' }
          : undefined;
      case 'done':
        return { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const diffs = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dR, dC]) => graph.step(cell, dR, dC))
  .filter(Boolean)
  .map(other => new NFA(diffMachine, 'snake-diff',
    snake.at(cell), cell, snake.at(other), other)));

// --- Circle counts: a circle's own digit equals the number of ON cells
// among itself and its king-move neighbours. Reads the digit first, then
// the circle's own membership, then each king neighbour's.
const countMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value === ON ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);
const circleCounts = circles.map(cell => new NFA(countMachine, 'circle-count',
  cell, snake.at(cell), ...snake.at(graph.kingNeighbours(cell))));

return [
  new Shape('9x9'),
  new Given('R8C3', 4),
  snake.toVar('snake'),
  ...membership,
  // Single path: the ON cells form one orthogonally-connected region.
  new ConnectedValues('VS', ON),
  ...degrees,
  ...diffs,
  ...circleCounts,
];
