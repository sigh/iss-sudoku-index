// Title: Black mamba
// Author: Lithium-Ion
// Video: https://www.youtube.com/watch?v=1MJtnslQ54k
// Source: https://sudokupad.app/f8ndB28nDT

// Normal Sudoku. Draw one orthogonal, one-cell-wide snake from Box 5 to Box 9.
// It neither branches nor self-touches, including diagonally. Consecutive snake
// cells differ by one; Box n's digit n lies on the snake. All black dots are given.

const ON = 1;
const OFF = 2;
const START = 3;
const END = 4;
const isSnake = value => value !== OFF;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const snake = graph.makeOverlay('VS');
const cells = graph.cells();
const box5 = graph.box(5);
const box9 = graph.box(9);

// The drawn data are the 13 black dots, listed as their two adjacent cells.
const blackDots = [
  ['R3C1', 'R3C2'], ['R3C1', 'R4C1'], ['R3C3', 'R4C3'],
  ['R4C3', 'R4C4'], ['R5C2', 'R5C3'], ['R8C1', 'R9C1'],
  ['R1C6', 'R1C7'], ['R1C7', 'R2C7'], ['R3C8', 'R3C9'],
  ['R4C6', 'R4C7'], ['R6C6', 'R6C7'], ['R7C9', 'R8C9'],
  ['R6C8', 'R7C8'],
];
const edgeKey = (a, b) => [a, b].sort().join(':');
const blackDotEdges = new Set(blackDots.map(([a, b]) => edgeKey(a, b)));

// A snake cell has degree 2, except its labelled start/end cells have degree 1.
// The machine reads the cell's state, then its orthogonal neighbours' states.
const degreeMachine = NFA.encodeSpec({
  startState: { state: null, degree: 0 },
  transition: ({ state, degree }, value) => {
    if (state === null) return { state: value, degree: 0 };
    if (state === OFF) return { state, degree: 0 };
    const next = degree + (isSnake(value) ? 1 : 0);
    return next <= 2 ? { state, degree: next } : undefined;
  },
  accept: ({ state, degree }) =>
    state === OFF || degree === (state === ON ? 2 : 1),
}, geometry.numValues);

// A diagonal-only pair in a 2x2 would make two nonconsecutive snake cells touch.
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, value) => {
    if (block === null) return { block: null };
    const next = [...block, isSnake(value)];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry.numValues);

// When both cells of an orthogonal edge are on the snake, their digits differ by 1.
const consecutiveMachine = NFA.encodeSpec({
  startState: { phase: 'stateA' },
  transition: (state, value) => {
    if (state.phase === 'stateA') return { phase: 'digitA', stateA: value };
    if (state.phase === 'digitA') return { phase: 'stateB', stateA: state.stateA, digitA: value };
    if (state.phase === 'stateB') return {
      phase: 'digitB', stateA: state.stateA, digitA: state.digitA, stateB: value,
    };
    return !isSnake(state.stateA) || !isSnake(state.stateB) ||
      Math.abs(state.digitA - value) === 1 ? { phase: 'done' } : undefined;
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);

// In Box n, its unique digit n must be a snake cell. Each Pair reads state then digit.
const boxDigitOnSnakeKey = digit => Pair.fnToKey(
  (state, value) => value !== digit || isSnake(state), geometry.numValues);

const membership = [
  snake.makeReplicate(new Given(snake.cells()[0], ON, OFF, START, END)),
  snake.makeReplicate(
    new Given(snake.cells()[0], ON, OFF),
    snake.at(cells.filter(cell => !box5.includes(cell) && !box9.includes(cell))),
  ),
  ...snake.at(box5).map(cell => new Given(cell, ON, OFF, START)),
  ...snake.at(box9).map(cell => new Given(cell, ON, OFF, END)),
  new ContainExact('3', ...snake.at(box5)),
  new ContainExact('4', ...snake.at(box9)),
];

const degrees = cells.map(cell => new NFA(
  degreeMachine, 'snake-degree', snake.at(cell), ...snake.at(graph.neighbours(cell))));

const blockOrigins = cells.filter(cell => graph.block(cell, 2, 2));
const noDiagonalTouches = snake.makeReplicate(
  new NFA(noDiagonalTouchMachine, 'snake-no-touch',
    ...snake.at(graph.block(cells[0], 2, 2))),
  snake.at(blockOrigins));

const snakeEdges = cells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
  .filter(Boolean)
  .map(other => new NFA(consecutiveMachine, 'snake-consecutive',
    snake.at(cell), cell, snake.at(other), other)));

// "All black dots are given" forbids a 1:2 pair on every unmarked orthogonal edge.
const noBlackDotKey = Pair.fnToKey(
  (a, b) => a !== b * 2 && b !== a * 2, geometry.numValues);
const unmarkedStarts = (dRow, dCol) => cells.filter(cell => {
  const other = graph.step(cell, dRow, dCol);
  return other && !blackDotEdges.has(edgeKey(cell, other));
});
const rightStarts = unmarkedStarts(0, 1);
const downStarts = unmarkedStarts(1, 0);
const unmarkedEdges = [
  graph.makeReplicate(
    new Pair(noBlackDotKey, 'no-black-dot', rightStarts[0], graph.step(rightStarts[0], 0, 1)),
    rightStarts,
  ),
  graph.makeReplicate(
    new Pair(noBlackDotKey, 'no-black-dot', downStarts[0], graph.step(downStarts[0], 1, 0)),
    downStarts,
  ),
];

const boxDigits = graph.boxes().flatMap((box, index) => {
  const digit = index + 1;
  const key = boxDigitOnSnakeKey(digit);
  return box.map(cell => new Pair(key, `box-${digit}-on-snake`, snake.at(cell), cell));
});

return [
  new Shape('9x9'),
  snake.toVar('snake membership'),
  ...membership,
  // Degree plus this one connected component makes exactly one simple path.
  new ConnectedValues('VS', [ON, START, END]),
  ...degrees,
  noDiagonalTouches,
  ...snakeEdges,
  ...boxDigits,
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
  ...unmarkedEdges,
];
