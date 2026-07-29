// Title: What A Twist
// Author: AnalyticalNinja
// Video: https://www.youtube.com/watch?v=Cd38-xpsblo

const shape = new Shape('6x6');

// Each three-cell arrow is [circle, shaft cell 1, shaft cell 2]. The circle
// gives the absolute difference between the two shaft digits.
const arrowDifference = NFA.encodeSpec({
  startState: {phase: 0, circle: 0, first: 0},
  transition: (state, value) => {
    if (state.phase === 0) return {phase: 1, circle: value, first: 0};
    if (state.phase === 1) return {...state, phase: 2, first: value};
    if (state.phase === 2 && Math.abs(state.first - value) === state.circle) {
      return {...state, phase: 3};
    }
    return undefined;
  },
  accept: state => state.phase === 3,
  maxDepth: 3,
}, shape);

const countDigit = (digit, target, length) => NFA.encodeSpec({
  startState: {count: 0},
  transition: (state, value) => {
    const count = state.count + (value === digit ? 1 : 0);
    return count <= target ? {count} : undefined;
  },
  accept: state => state.count === target,
  maxDepth: length,
}, shape);

// Read three in-box pairs. Their absolute differences must match.
const blueDifference = NFA.encodeSpec({
  startState: {phase: 0, first: 0, difference: 0},
  transition: (state, value) => {
    if (state.phase === 0 || state.phase === 2 || state.phase === 4) {
      return {...state, phase: state.phase + 1, first: value};
    }
    const difference = Math.abs(state.first - value);
    if (state.phase === 1) return {...state, phase: 2, difference};
    if ((state.phase === 3 || state.phase === 5) && difference === state.difference) {
      return {...state, phase: state.phase + 1};
    }
    return undefined;
  },
  accept: state => state.phase === 6,
  maxDepth: 6,
}, shape);

const arrows = [
  ['R1C3', 'R2C4', 'R3C5'],
  ['R1C2', 'R2C3', 'R3C4'],
  ['R1C1', 'R2C2', 'R3C3'],
  ['R1C4', 'R2C5', 'R3C6'],
  ['R3C1', 'R4C2', 'R5C1'],
];

return [
  shape,
  ...arrows.map((cells, index) => new NFA(arrowDifference,
    `arrow ${index + 1} shaft difference`, ...cells)),
  new GreaterThan('R1C1', 'R2C1'),
  new NFA(countDigit(6, 2, 6), 'two 6s on main diagonal',
    'R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6'),
  new NFA(countDigit(5, 1, 4), 'one 5 on short diagonal',
    'R3C6', 'R4C5', 'R5C4', 'R6C3'),
  new NFA(blueDifference, 'equal blue-line differences by box',
    'R6C6', 'R5C5', 'R4C4', 'R3C4', 'R2C5', 'R1C5'),
];
