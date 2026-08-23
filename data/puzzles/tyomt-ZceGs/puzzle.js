// Title: Mineswee-Pea-Er
// Author: damo_89
// Video: https://www.youtube.com/watch?v=tyomt-ZceGs
// Source: https://sudokupad.app/c1nrs6w6wq

// Full encoding. A two-value overlay represents Yin-Yang shading. Compact
// state machines encode each minesweeper count and each split-pea sum.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('YY');

const circles = [
  'R1C1', 'R2C1', 'R3C2', 'R3C8', 'R4C7',
  'R5C3', 'R5C6', 'R7C2', 'R7C5', 'R8C7',
];

// Scan [circle digit, neighbouring shade flags]. The circle digit becomes the
// countdown target; each shaded neighbour decrements it.
const minesweeperMachine = NFA.encodeSpec({
  startState: { phase: 'digit' },
  transition: (state, value) => {
    if (state.phase === 'digit') return { phase: 'count', remaining: value };
    if (value === UNSHADED) return state;
    if (state.remaining === 0) return undefined;
    return { phase: 'count', remaining: state.remaining - 1 };
  },
  accept: state => state.phase === 'count' && state.remaining === 0,
}, geometry.numValues);
const minesweeperRules = circles.map(cell => new NFA(
  minesweeperMachine,
  'minesweeper',
  cell,
  ...shade.at(graph.kingNeighbours(cell))));
const unshadedCircles = circles.map(
  cell => new Given(shade.at(cell), UNSHADED));

const splitPeas = [
  ['R1C1', 'R2C1', 'R1C2', 'R2C2'],
  ['R2C1', 'R3C2', 'R3C1', 'R4C2', 'R3C3'],
  ['R3C2', 'R3C8', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7'],
  ['R3C8', 'R4C7', 'R2C8', 'R2C9', 'R3C9', 'R4C9', 'R4C8'],
  ['R4C7', 'R8C7', 'R5C8', 'R6C9', 'R7C9', 'R8C9', 'R9C8'],
  ['R8C7', 'R7C2', 'R9C6', 'R9C5', 'R8C5', 'R9C4', 'R8C4', 'R9C3', 'R8C3', 'R7C4', 'R7C3'],
  ['R7C2', 'R5C3', 'R8C2', 'R7C1', 'R6C1', 'R5C1', 'R4C1', 'R5C2', 'R6C2'],
  ['R5C3', 'R4C7', 'R4C3', 'R5C4', 'R4C4', 'R3C4', 'R3C5', 'R3C6', 'R3C7'],
  ['R4C7', 'R5C6', 'R4C6', 'R4C5', 'R5C5'],
  ['R5C6', 'R7C5', 'R5C7', 'R6C8', 'R6C7', 'R7C6', 'R6C6', 'R6C5', 'R6C4'],
];

// Scan [endpoint A, endpoint B, interior digits]. After reading both endpoints,
// branch over the two concatenation orders and subtract every interior digit.
const splitPeaMachine = NFA.encodeSpec({
  startState: { phase: 'first' },
  transition: (state, value) => {
    if (state.phase === 'first') return { phase: 'second', first: value };
    if (state.phase === 'second') {
      return [
        { phase: 'sum', remaining: 10 * state.first + value },
        { phase: 'sum', remaining: 10 * value + state.first },
      ];
    }
    if (state.remaining < value) return undefined;
    return { phase: 'sum', remaining: state.remaining - value };
  },
  accept: state => state.phase === 'sum' && state.remaining === 0,
}, geometry.numValues);
const splitPeaRules = splitPeas.map(cells => new NFA(
  splitPeaMachine, 'split-pea', ...cells));

return [
  new Shape('9x9'),
  new YinYang(),
  ...unshadedCircles,
  ...minesweeperRules,
  ...splitPeaRules,
];
