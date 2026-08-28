// Title: Snake Sum
// Author: Quarterthru
// Video: https://www.youtube.com/watch?v=6MPNXOpZCXg
// Source: https://cracking-the-cryptic.web.app/sudoku/9dpdgLft83
//
// Normal sudoku rules apply, except the 9 regions are irregular (given, not
// boxes). A snake is drawn through orthogonally-connected cells from the head
// to the tail (the two grey-circled cells); it may not touch itself
// orthogonally (diagonal self-touches are allowed), and need not visit every
// cell. Outside-grid totals give the sum of the digits on the snake in that
// row/column. Treating "on the snake" and "off the snake" as two colours,
// each given digit equals how many of its orthogonal neighbours are the
// opposite colour to itself; givens may sit on or off the snake.
//
// Snake membership is a Var overlay per grid cell (ON/OFF), forced ON at the
// two circled cells. "May not touch itself orthogonally" is degree + single
// connected region: every on-snake cell has exactly two on-snake orthogonal
// neighbours except the head/tail, which have exactly one -- a self-touch
// would put a third on-snake neighbour next to some cell, which the degree
// NFA already forbids, so no separate no-touch check is needed. Connected +
// that degree profile forces one simple path (a disjoint cycle would be all
// degree-2, contradicting the two degree-1 endpoints).

const ON = 1;   // snake-membership values, stored in the Var cells
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const snake = graph.makeOverlay('VS');

const head = 'R1C1';   // grey circle
const tail = 'R2C3';   // grey circle

// --- Irregular regions, transcribed from the drawn region outlines. ---
const regions = [
  ['R1C3', 'R1C2', 'R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R5C2', 'R5C3'],
  ['R1C4', 'R2C4', 'R2C3', 'R2C2', 'R3C2', 'R4C2', 'R4C3', 'R4C4', 'R5C4'],
  ['R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R4C5', 'R5C5', 'R6C5', 'R7C5'],
  ['R5C8', 'R5C7', 'R5C6', 'R6C6', 'R7C6', 'R8C6', 'R9C6', 'R9C7', 'R9C8'],
  ['R1C5', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R3C8', 'R4C8', 'R4C7', 'R4C6'],
  ['R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9'],
  ['R6C8', 'R6C7', 'R7C7', 'R7C8', 'R7C9', 'R8C9', 'R9C9', 'R8C8', 'R8C7'],
  ['R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R8C5'],
  ['R6C2', 'R7C2', 'R8C2', 'R8C3', 'R7C3', 'R6C3', 'R6C4', 'R7C4', 'R8C4'],
];
const jigsaw = regions.map(cells => new Jigsaw('9x9', ...cells));

// --- Givens, transcribed from the printed digits. ---
const givens = [
  ['R1C2', 1], ['R2C2', 3], ['R2C4', 2], ['R3C6', 1], ['R3C8', 3],
  ['R5C2', 2], ['R5C3', 3], ['R5C7', 1], ['R6C3', 2], ['R6C9', 1],
  ['R7C6', 2],
].map(([cell, value]) => new Given(cell, value));

// --- Outside sums: total of the snake's digits in each row/column,
// transcribed from the printed outside-grid totals -- reading direction
// does not matter for a sum. ---
const rowSums = { R1: 20, R2: 41, R3: 23, R4: 23, R5: 13, R6: 23, R7: 33, R8: 27, R9: 33 };
const colSums = { C1: 27, C2: 34, C3: 19, C4: 34, C5: 19, C6: 13, C7: 24, C8: 32, C9: 34 };

// --- Snake membership: every cell is on (1) or off (2); head/tail forced on.
const originCell = snake.cells()[0];
const membership = [
  snake.makeReplicate(new Given(originCell, ON, OFF)),
  new Given(snake.at(head), ON),
  new Given(snake.at(tail), ON),
];

// --- Degree: an on-snake cell has exactly `requiredOnDegree` on-snake
// orthogonal neighbours; off-snake cells are unconstrained. Reads the cell's
// own membership, then each neighbour's. Shared shape with nordschleife.js's
// loop-degree NFA, parameterised so the two endpoints can require degree 1
// while the rest of the snake requires degree 2.
function makeDegreeMachine(requiredOnDegree) {
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
      return count > requiredOnDegree
        ? undefined
        : { phase: 'on', onNeighbours: count };
    },
    accept: ({ phase, onNeighbours }) =>
      phase === 'off' || onNeighbours === requiredOnDegree,
  }, geometry.numValues);
}
const degreeMachine1 = makeDegreeMachine(1);
const degreeMachine2 = makeDegreeMachine(2);
const endpoints = new Set([head, tail]);
const degrees = gridCells.map(cell => {
  const machine = endpoints.has(cell) ? degreeMachine1 : degreeMachine2;
  return new NFA(machine, 'snake-degree',
    ...snake.at([cell, ...graph.neighbours(cell)]));
});

// --- Neighbour-colour-count clues: a given's digit equals how many of its
// orthogonal neighbours are the opposite snake colour. Reads the cell's own
// digit (the target count), then its own colour, then each neighbour's
// colour -- the same shape as nordschleife.js's circle-count NFA, but
// counting colour differences against the read cell instead of a fixed ON.
const diffCountMachine = NFA.encodeSpec({
  startState: { stage: 'digit' },
  transition: (state, value) => {
    if (state.stage === 'digit') return { stage: 'own', target: value };
    if (state.stage === 'own') {
      return { stage: 'count', target: state.target, own: value, count: 0 };
    }
    const differs = value !== state.own ? 1 : 0;
    const next = state.count + differs;
    return next > state.target
      ? undefined
      : { stage: 'count', target: state.target, own: state.own, count: next };
  },
  accept: state => state.stage === 'count' && state.count === state.target,
}, geometry.numValues);
const givenCells = givens.map(g => g.cell);
const neighbourColourCounts = givenCells.map(cell => new NFA(
  diffCountMachine, 'snake-neighbour-colour-count',
  cell, snake.at(cell), ...snake.at(graph.neighbours(cell))));

// --- Row/column snake sums: scan the line as interleaved
// [membership, digit] pairs, accumulating the digit only where membership is
// ON, clamped at target+1 so the state stays bounded.
function makeSumMachine(target) {
  return NFA.encodeSpec({
    startState: { stage: 'mem', sum: 0 },
    transition: (state, value) => {
      if (state.stage === 'mem') return { stage: 'val', sum: state.sum, mem: value };
      const add = state.mem === ON ? value : 0;
      return { stage: 'mem', sum: Math.min(state.sum + add, target + 1) };
    },
    accept: state => state.stage === 'mem' && state.sum === target,
  }, geometry.numValues);
}
const lineSnakeSums = [
  ...Object.entries(rowSums).map(([row, target]) => {
    const cells = Array.from({ length: 9 }, (_, c) => `${row}C${c + 1}`);
    return new NFA(makeSumMachine(target), 'row-snake-sum',
      ...cells.flatMap(cell => [snake.at(cell), cell]));
  }),
  ...Object.entries(colSums).map(([col, target]) => {
    const cells = Array.from({ length: 9 }, (_, r) => `R${r + 1}${col}`);
    return new NFA(makeSumMachine(target), 'col-snake-sum',
      ...cells.flatMap(cell => [snake.at(cell), cell]));
  }),
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...jigsaw,
  ...givens,
  snake.toVar('snake'),
  ...membership,
  // Single simple path: the on-snake cells form one connected region;
  // paired with the degree profile above this forces exactly one path
  // (a disjoint cycle would be all degree-2, contradicting the two
  // degree-1 endpoints).
  new ConnectedValues('VS', ON),
  ...degrees,
  ...neighbourColourCounts,
  ...lineSnakeSums,
];
