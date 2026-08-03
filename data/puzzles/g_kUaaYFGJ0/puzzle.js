// Title: Slang and Slanger
// Author: Darren Nakamura
// Video: https://www.youtube.com/watch?v=g_kUaaYFGJ0
// Source: https://app.crackingthecryptic.com/sudoku/2QNN8rFGnj

// Rules encoded, in full:
//  - Normal sudoku. Givens: R8C3 = 1, R9C6 = 3.
//  - A snake: a one-cell-wide path of orthogonally connected cells which may
//    touch itself diagonally but not orthogonally. The two circles (R3C7,
//    R4C9) are its head and tail.
//  - Every cell off the snake lies in a non-snake region: a maximal
//    orthogonally connected group of off-snake cells, bounded by snake cells
//    and the grid edge.
//  - The digit in a square gives the number of cells of that square's
//    non-snake region. The squares are R8C3, R9C6 and R5C3; only the first two
//    also carry a given digit, so the R5C3 square sizes its region by its own
//    solved digit.
//  - Digits adjacent along the snake differ by at least 5 within a 3x3 box,
//    and by at least 4 across a box border.
// Nothing is omitted.
//
// Every square sits off the snake: the rule reads its digit as the size of
// "that square's non-snake region", which a snake cell does not have.

const ON = 1;                            // snake-layer values
const OFF = 2;
const SNAKE = 1;                         // region-layer values
const IN_REGION = 2;
const ELSEWHERE = 3;                     // off the snake, in another region

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// --- Drawn clues: two circles (the snake's ends) and three squares.
const ends = ['R3C7', 'R4C9'];
const unitSquare = 'R8C3';               // square whose given digit is 1
const sizedSquares = [
  { prefix: 'VA', square: 'R9C6' },
  { prefix: 'VB', square: 'R5C3' },
];

// Snake membership: one Var per grid cell, ON or OFF.
const snake = graph.makeOverlay('VS');

// Every orthogonally adjacent pair once, as a right or a down step.
const steps = [[0, 1], [1, 0]];
const edges = gridCells.flatMap(cell => steps
  .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
  .filter(Boolean)
  .map(other => [cell, other]));

const boxOfCell = new Map();
graph.boxes().forEach(
  (box, index) => box.forEach(cell => boxOfCell.set(cell, index)));

// --- Snake shape: the ON cells form one simple path from R3C7 to R4C9.
// A cell's count of ON orthogonal neighbours is its degree along the snake:
// 1 at the two circled ends, 2 at every other snake cell. One connected
// component with those degrees is exactly a simple path between the ends, and
// it also carries "may not touch itself orthogonally": a cell touched by the
// path elsewhere would have a third ON neighbour.
const degreeMachine = (degree) => NFA.encodeSpec({
  // Reads the cell's own membership, then each orthogonal neighbour's.
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, membership) => {
    if (phase === 'start') {
      return membership === ON
        ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (membership === ON ? 1 : 0);
    return count > degree ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === degree,
}, geometry.numValues);
const endDegreeMachine = degreeMachine(1);
const pathDegreeMachine = degreeMachine(2);

const snakeShape = [
  snake.makeReplicate(new Given(snake.cells()[0], ON, OFF)),
  ...ends.map(cell => new Given(snake.at(cell), ON)),
  new ConnectedValues('VS', ON),
  ...gridCells.map(cell => new NFA(
    ends.includes(cell) ? endDegreeMachine : pathDegreeMachine, 'snake-degree',
    ...snake.at([cell, ...graph.neighbours(cell)]))),
];

// --- Snake digits. The difference rule binds a pair of orthogonally adjacent
// cells only when both are on the snake -- two such cells are then consecutive
// along it, since the snake never touches itself orthogonally. The machine
// reads (membership, digit) for each cell of the pair; when either is off the
// snake the remaining symbols are absorbed by a countdown.
const gapMachine = (gap) => NFA.encodeSpec({
  startState: { phase: 'aOn' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'aOn':
        return value === ON ? { phase: 'aDigit' } : { phase: 'skip', left: 3 };
      case 'aDigit':
        return { phase: 'bOn', aDigit: value };
      case 'bOn':
        return value === ON
          ? { phase: 'bDigit', aDigit: state.aDigit }
          : { phase: 'skip', left: 1 };
      case 'bDigit':
        return Math.abs(state.aDigit - value) >= gap
          ? { phase: 'done' } : undefined;
      case 'skip':
        return state.left > 1
          ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const withinBoxMachine = gapMachine(5);
const acrossBorderMachine = gapMachine(4);

const snakeDigits = edges.map(([a, b]) => new NFA(
  boxOfCell.get(a) === boxOfCell.get(b) ? withinBoxMachine : acrossBorderMachine,
  'snake-gap',
  snake.at(a), a, snake.at(b), b));

// --- Region sizes. One overlay per sized square labels every cell as on the
// snake, in that square's non-snake region, or off the snake elsewhere. The
// labelled region is pinned to contain the square and then forced to be
// exactly the square's non-snake region from both sides: no off-snake cell may
// sit orthogonally beside a region cell without joining the region (so the
// labelling covers the whole component), and the region is connected (so it
// covers no more than that component).
const snakeLinkKey = Pair.fnToKey(
  (membership, label) => (membership === ON) === (label === SNAKE),
  geometry.numValues);
const regionClosureKey = Pair.fnToKey(
  (x, y) => !(x === IN_REGION && y === ELSEWHERE)
    && !(y === IN_REGION && x === ELSEWHERE),
  geometry.numValues);
// Reads the square's digit as the target, then counts the labelled cells.
const regionSizeMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value === IN_REGION ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);

const regions = sizedSquares.flatMap(({ prefix, square }) => {
  const layer = graph.makeOverlay(prefix);
  const origin = layer.cells()[0];
  // One closure Replicate per step direction, targeting the cells from which
  // that step stays on the grid.
  const closures = steps.map(([dRow, dCol]) => layer.makeReplicate(
    new Pair(regionClosureKey, 'region-closure',
      origin, layer.step(origin, dRow, dCol)),
    layer.cells().filter(cell => layer.step(cell, dRow, dCol))));
  return [
    layer.toVar(`region of ${square}`),
    layer.makeReplicate(new Given(origin, SNAKE, IN_REGION, ELSEWHERE)),
    ...gridCells.map(cell => new Pair(
      snakeLinkKey, 'on-snake', snake.at(cell), layer.at(cell))),
    new Given(layer.at(square), IN_REGION),
    ...closures,
    new ConnectedValues(prefix, IN_REGION),
    new NFA(regionSizeMachine, 'region-size', square, ...layer.cells()),
  ];
});

// R8C3's given digit is 1, so its non-snake region is the single cell R8C3:
// the cell is off the snake and each of its four orthogonal neighbours is on
// it, which is what leaves it alone in its region.
const unitRegion = [
  new Given(snake.at(unitSquare), OFF),
  ...graph.neighbours(unitSquare).map(cell => new Given(snake.at(cell), ON)),
];

return [
  new Shape('9x9'),
  snake.toVar('snake'),
  new Given('R8C3', 1),
  new Given('R9C6', 3),
  ...snakeShape,
  ...snakeDigits,
  ...regions,
  ...unitRegion,
];
