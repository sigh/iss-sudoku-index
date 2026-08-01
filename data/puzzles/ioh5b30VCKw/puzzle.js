// Title: Every Three And Every Two
// Author: Bert
// Video: https://www.youtube.com/watch?v=ioh5b30VCKw
// Source: https://app.crackingthecryptic.com/tnec3uomu7

// Normal Sudoku rules apply. A 3 has exactly three orthogonally adjacent even
// neighbours, and a 2 has exactly two orthogonally adjacent odd neighbours.
// The listed yellow paths are Fibonacci lines, readable from either end.

const graph = cellGraph('9x9');

function conditionalParityCountSpec(trigger, parity, requiredCount) {
  return NFA.encodeSpec({
    startState: null,
    transition(state, value) {
      if (state === null) return value === trigger ? 0 : 'free';
      if (state === 'free') return 'free';
      const count = state + (value % 2 === parity ? 1 : 0);
      return count <= requiredCount ? count : undefined;
    },
    accept: state => state === 'free' || state === requiredCount,
  }, 9);
}

const threeEvenNeighbours = conditionalParityCountSpec(3, 0, 3);
const twoOddNeighbours = conditionalParityCountSpec(2, 1, 2);

const fibonacciLine = NFA.encodeSpec({
  startState: null,
  transition(state, value) {
    if (state === null) return { phase: 'first', value };
    if (state.phase === 'first') {
      return [
        state.value + 1 === value ? { direction: 'forward', previous: state.value, current: value, length: 2 } : undefined,
        state.value > value ? { direction: 'reverse', previous: state.value, current: value, length: 2 } : undefined,
      ].filter(state => state !== undefined);
    }
    if (state.direction === 'forward') {
      return state.previous + state.current === value
        ? { ...state, previous: state.current, current: value, length: state.length + 1 }
        : undefined;
    }
    return state.previous - state.current === value
      ? { ...state, previous: state.current, current: value, length: state.length + 1 }
      : undefined;
  },
  accept: state => state?.length >= 3 && (
    state.direction === 'forward' || state.previous === state.current + 1
  ),
}, 9);

// Yellow Fibonacci paths transcribed from the drawn source lines.
const fibonacciPaths = [
  ['R4C2', 'R3C3', 'R4C3', 'R5C2', 'R5C3'],
  ['R3C7', 'R2C6', 'R1C7', 'R2C8', 'R2C7'],
  ['R7C8', 'R8C7', 'R8C8'],
  ['R5C5', 'R5C6', 'R6C6'],
  ['R5C8', 'R5C9', 'R6C9'],
  ['R2C2', 'R2C3', 'R1C3'],
  ['R3C5', 'R4C6', 'R4C7'],
];

return [
  new Shape('9x9'),
  ...graph.cells().flatMap(cell => [
    new NFA(threeEvenNeighbours, '3-even-neighbours', cell, ...graph.neighbours(cell)),
    new NFA(twoOddNeighbours, '2-odd-neighbours', cell, ...graph.neighbours(cell)),
  ]),
  ...fibonacciPaths.map(cells => new NFA(fibonacciLine, 'fibonacci', ...cells)),
];
