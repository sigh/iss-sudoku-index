// Title: Blue or Yellow?
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=GsT308ot5xU
// Source: https://sudokupad.app/hrinu3frw3

// A membership overlay stores ON/OFF for every grid cell. The endpoint degree
// rules, ordinary degree rules, diagonal no-touch rule, and connectivity turn
// that membership into one simple orthogonal path between the green spots.

const ON = 1;
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const snake = graph.makeOverlay('VS');
const gridCells = graph.cells();

const endpoints = ['R1C2', 'R6C5'];
const endpointSet = new Set(endpoints);
const yellowCircles = [
  'R1C6', 'R4C5', 'R5C2', 'R6C9',
  'R7C8', 'R8C3', 'R9C4', 'R9C7',
];
const blueCircles = [
  'R1C1', 'R2C6', 'R3C4', 'R3C7',
  'R4C8', 'R5C7', 'R6C3', 'R8C5',
];

const membership = [
  snake.makeReplicate(new Given(snake.cells()[0], ON, OFF)),
  ...snake.at(endpoints).map(cell => new Given(cell, ON)),
];

// Reads the centre cell's membership followed by its orthogonal neighbours.
// An ON endpoint needs one ON neighbour; every other ON cell needs two.
function degreeMachine(requiredDegree) {
  return NFA.encodeSpec({
    startState: { phase: 'start' },
    transition: ({ phase, onNeighbours }, value) => {
      if (phase === 'start') {
        return value === ON
          ? { phase: 'on', onNeighbours: 0 }
          : { phase: 'off' };
      }
      if (phase === 'off') return { phase: 'off' };
      const count = onNeighbours + (value === ON ? 1 : 0);
      return count > requiredDegree
        ? undefined
        : { phase: 'on', onNeighbours: count };
    },
    accept: ({ phase, onNeighbours }) =>
      phase === 'off' || onNeighbours === requiredDegree,
  }, geometry.numValues);
}

const endpointDegreeMachine = degreeMachine(1);
const ordinaryDegreeMachine = degreeMachine(2);
const degrees = gridCells.map(cell => new NFA(
  endpointSet.has(cell) ? endpointDegreeMachine : ordinaryDegreeMachine,
  endpointSet.has(cell) ? 'endpoint-degree' : 'degree',
  ...snake.at([cell, ...graph.neighbours(cell)]),
));

// Forbid the diagonal-only pattern in every 2x2. Three ON cells remain legal:
// that is the unavoidable local shape of an orthogonal turn.
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
const noDiagonalTouches = snake.makeReplicate(
  new NFA(
    noDiagonalTouchMachine,
    'no-diagonal-touch',
    ...snake.at(graph.block(gridCells[0], 2, 2)),
  ),
  snake.at(blockOrigins),
);

// Reads membership/digit for each end of an orthogonal edge. If both cells are
// on the snake, their digits must differ by at least 5.
const differenceMachine = NFA.encodeSpec({
  startState: { phase: 'a-membership' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'a-membership':
        return value === ON
          ? { phase: 'a-digit' }
          : { phase: 'skip', left: 3 };
      case 'a-digit':
        return { phase: 'b-membership', aDigit: value };
      case 'b-membership':
        return value === ON
          ? { phase: 'b-digit', aDigit: state.aDigit }
          : { phase: 'skip', left: 1 };
      case 'b-digit':
        return Math.abs(state.aDigit - value) >= 5
          ? { phase: 'done' }
          : undefined;
      case 'skip':
        return state.left > 1
          ? { phase: 'skip', left: state.left - 1 }
          : { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const snakeDifferences = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
  .filter(Boolean)
  .map(other => new NFA(
    differenceMachine,
    'snake-difference',
    snake.at(cell), cell, snake.at(other), other,
  )));

const colourChoice = new Or([
  new And([
    ...snake.at(yellowCircles).map(cell => new Given(cell, ON)),
    ...snake.at(blueCircles).map(cell => new Given(cell, OFF)),
  ]),
  new And([
    ...snake.at(yellowCircles).map(cell => new Given(cell, OFF)),
    ...snake.at(blueCircles).map(cell => new Given(cell, ON)),
  ]),
]);

return [
  new Shape('9x9'),
  snake.toVar('snake membership'),
  ...membership,
  new ConnectedValues('VS', ON),
  ...degrees,
  noDiagonalTouches,
  ...snakeDifferences,
  new CountingCircles(...yellowCircles),
  new CountingCircles(...blueCircles),
  colourChoice,
];
