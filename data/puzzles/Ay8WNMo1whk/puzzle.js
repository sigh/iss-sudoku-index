// Title: Parity Pairs
// Author: Amin Khalek
// Video: https://www.youtube.com/watch?v=Ay8WNMo1whk
// Source: https://app.crackingthecryptic.com/hb97vsx1xm

// Rules encoded:
// - Normal 9x9 Sudoku with standard 3x3 boxes.
// - A blue circle's digit equals the number of odd digits in its king-neighbors.
// - Digits increase away from each round thermometer bulb to every end.
// - White dots join consecutive digits; there is no negative dot rule.

// The first NFA cell supplies the target; the remaining cells are its
// king-neighbors. State records that target and the running odd-digit count.
const oddNeighborCountSpec = NFA.encodeSpec({
  startState: { phase: 'circle' },
  transition: (state, value) => {
    if (state.phase === 'circle') {
      return { phase: 'neighbors', target: value, count: 0 };
    }
    const count = state.count + (value % 2);
    return count <= state.target
      ? { phase: 'neighbors', target: state.target, count }
      : undefined;
  },
  accept: (state) => (
    state.phase === 'neighbors' && state.count === state.target
  ),
  maxDepth: 9,
}, 9);

// Blue circle positions, from the source-drawn overlays.
const circles = [
  'R2C1', 'R2C3', 'R2C4', 'R2C6', 'R2C7',
  'R3C2', 'R3C8', 'R4C2', 'R4C8', 'R5C3',
  'R5C7', 'R6C2', 'R6C8', 'R7C2', 'R7C8',
];

// Straight thermometer paths, from the source-drawn bulbs to their tips.
const thermometers = [
  ['R2C3', 'R2C2', 'R2C1'],
  ['R1C4', 'R1C3'],
  ['R1C6', 'R1C7'],
  ['R2C7', 'R2C8', 'R2C9'],
  ['R3C8', 'R4C8'],
  ['R3C2', 'R4C2'],
  ['R6C4', 'R7C4'],
  ['R6C6', 'R7C6'],
];

// The branching thermometer's common stem and its three drawn ends.
const branchingThermometer = [
  ['R6C5', 'R7C5', 'R8C5', 'R9C5'],
  ['R8C5', 'R8C4'],
  ['R8C5', 'R8C6'],
];

// White-dot pairs, from the source-drawn edge overlays.
const whiteDots = [
  ['R2C7', 'R3C7'],
  ['R5C5', 'R5C6'],
  ['R7C2', 'R7C3'],
];

const graph = cellGraph('9x9');
const circleConstraints = circles.map((circle) => new NFA(
  oddNeighborCountSpec,
  'odd-neighbor count',
  circle,
  ...graph.kingNeighbours(circle),
));

return [
  new Shape('9x9'),
  ...circleConstraints,
  ...thermometers.map(cells => new Thermo(...cells)),
  ...branchingThermometer.map(cells => new Thermo(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
];
