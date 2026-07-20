// Title: Counting and whispering
// Author: Lithium-Ion
// Video: https://www.youtube.com/watch?v=ZNB48hRlSbE
// Source: https://sudokupad.app/7udzz2bpg8

// A circle's digit counts neighboring cells whose digit differs from it by at
// least 5. The first NFA cell is the circle; the rest are its king-neighbors.
const farCountSpec = NFA.encodeSpec({
  startState: { phase: 'circle' },
  transition: (state, value) => {
    if (state.phase === 'circle') {
      return { phase: 'neighbors', target: value, count: 0 };
    }
    const count = state.count + (Math.abs(value - state.target) >= 5 ? 1 : 0);
    return count <= state.target
      ? { phase: 'neighbors', target: state.target, count }
      : undefined;
  },
  accept: (state) => state.phase === 'neighbors' && state.count === state.target,
  maxDepth: 9,
}, 9);

const circles = [
  'R1C9', 'R2C3', 'R3C3', 'R3C4', 'R4C2',
  'R4C4', 'R6C8', 'R7C7', 'R7C8', 'R9C1',
];

const graph = cellGraph('9x9');
const circleConstraints = circles.map((circle) => new NFA(
  farCountSpec,
  'far-neighbor count',
  circle,
  ...graph.kingNeighbours(circle),
));

const arrows = [
  new Arrow('R3C3', 'R2C4', 'R1C5', 'R1C6'),
  new Arrow('R3C3', 'R2C3', 'R1C2'),
  new Arrow('R7C7', 'R7C6', 'R6C6', 'R6C7', 'R6C8'),
  new Arrow('R7C7', 'R8C7', 'R9C6', 'R9C5'),
  new Arrow('R7C7', 'R8C8', 'R9C9'),
];

return [
  new Shape('9x9'),
  ...arrows,
  ...circleConstraints,
];
