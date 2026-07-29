// Title: 600,000
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=F1JnrQcxFnQ
// Source: https://sudokupad.app/MBJ89f8h9D

// Normal 6x6 Sudoku with 2x3 boxes. White dots join consecutive digits. A
// one-cell-wide orthogonal snake runs between the gray circles; it cannot use a
// white-dot edge. If it uses box N, its digit N in that box is on the snake.
// The product of its digits is 600000.

const ON = 1, OFF = 2;
const graph = cellGraph('6x6');
const geometry = graph.gridGeometry();
const snake = graph.makeOverlay('VS');
const gridCells = graph.cells();
const endpoints = ['R1C6', 'R5C1'];
const whiteDots = [['R3C3', 'R4C3'], ['R5C4', 'R5C5']];
const boxes = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3'],
  ['R1C4', 'R1C5', 'R1C6', 'R2C4', 'R2C5', 'R2C6'],
  ['R3C1', 'R3C2', 'R3C3', 'R4C1', 'R4C2', 'R4C3'],
  ['R3C4', 'R3C5', 'R3C6', 'R4C4', 'R4C5', 'R4C6'],
  ['R5C1', 'R5C2', 'R5C3', 'R6C1', 'R6C2', 'R6C3'],
  ['R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5', 'R6C6'],
];

// Each overlay cell says whether its grid cell is on the snake. A cell on the
// snake has its required number of orthogonal on-snake neighbours: one at an
// endpoint and two elsewhere. ConnectedValues then makes this one simple path.
const degreeMachine = target => NFA.encodeSpec({
  startState: { phase: 'cell' },
  transition: (state, value) => {
    if (state.phase === 'cell') {
      return value === ON ? { phase: 'neighbours', count: 0 } : { phase: 'off' };
    }
    if (state.phase === 'off') return state;
    const count = state.count + (value === ON ? 1 : 0);
    return count > target ? undefined : { phase: 'neighbours', count };
  },
  accept: state => state.phase === 'off' || state.count === target,
}, geometry.numValues);
const degreeTwo = degreeMachine(2);
const degreeOne = degreeMachine(1);
const degrees = gridCells.map(cell => new NFA(
  endpoints.includes(cell) ? degreeOne : degreeTwo,
  'snake-degree', ...snake.at([cell, ...graph.neighbours(cell)])));

// A white dot is an edge the snake may not traverse. Consecutive digits are
// enforced by WhiteDot; the overlay pair prevents both incident cells being on.
const dotKey = Pair.fnToKey((a, b) => a !== ON || b !== ON, geometry);
const dots = whiteDots.flatMap(cells => [
  new WhiteDot(...cells),
  new Pair(dotKey, 'snake-not-through-dot', ...snake.at(cells)),
]);

// Each box is read as alternating membership and digit cells. A used box N must
// contain an on-snake digit N; an unused box has no extra requirement.
const boxMachine = target => NFA.encodeSpec({
  startState: { phase: 'membership', used: false, hasTarget: false },
  transition: (state, value) => {
    if (state.phase === 'membership') {
      return { phase: 'digit', used: state.used || value === ON, hasTarget: state.hasTarget, on: value === ON };
    }
    return { phase: 'membership', used: state.used, hasTarget: state.hasTarget || (state.on && value === target) };
  },
  accept: state => state.phase === 'membership' && (!state.used || state.hasTarget),
}, geometry.numValues);
const boxRules = boxes.map((box, i) => new NFA(boxMachine(i + 1), 'box-number',
  ...box.flatMap(cell => [snake.at(cell), cell])));

// Scanning every membership/digit pair, this NFA counts the prime factors of
// on-snake digits. 600000 = 2^6 * 3 * 5^5, so exceeding a target factor rejects
// immediately and the final exponents enforce the stated product.
const productMachine = NFA.encodeSpec({
  startState: { phase: 'membership', two: 0, three: 0, five: 0 },
  transition: (state, value) => {
    if (state.phase === 'membership') return { ...state, phase: 'digit', on: value === ON };
    if (!state.on) return { two: state.two, three: state.three, five: state.five, phase: 'membership' };
    const add = ({ 1: [0, 0, 0], 2: [1, 0, 0], 3: [0, 1, 0], 4: [2, 0, 0], 5: [0, 0, 1], 6: [1, 1, 0] })[value];
    const two = state.two + add[0], three = state.three + add[1], five = state.five + add[2];
    return two > 6 || three > 1 || five > 5 ? undefined : { phase: 'membership', two, three, five };
  },
  accept: state => state.phase === 'membership' && state.two === 6 && state.three === 1 && state.five === 5,
}, geometry.numValues);

return [
  new Shape('6x6'),
  snake.toVar('snake'),
  snake.makeReplicate(new Given(snake.cells()[0], ON, OFF)),
  ...snake.at(endpoints).map(cell => new Given(cell, ON)),
  new ConnectedValues('VS', ON),
  ...degrees,
  ...dots,
  ...boxRules,
  new NFA(productMachine, 'snake-product', ...gridCells.flatMap(cell => [snake.at(cell), cell])),
];
