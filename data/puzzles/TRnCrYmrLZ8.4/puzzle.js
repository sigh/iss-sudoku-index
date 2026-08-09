// Title: 9/11/22: Count the Odd Ones
// Author: clover!
// Video: https://www.youtube.com/watch?v=TRnCrYmrLZ8
// Source: https://tinyurl.com/5t2f3bwh

// Rules encoded here:
//  - Normal sudoku.
//  - Each grey line has a circle at one end. The circle's digit equals the
//    count of odd digits among the *other* cells on the line -- the circle's
//    own digit is excluded from the count (rules text: "not including the
//    digit in the circle itself, which may be odd or even").
// Nothing is omitted.

const givens = {
  R2C2: 1, R2C3: 5, R2C7: 3, R2C8: 4,
  R3C2: 7, R3C5: 3, R3C8: 5,
  R4C4: 2, R4C6: 4,
  R6C4: 8, R6C6: 6,
  R7C2: 9, R7C8: 7,
  R8C2: 8, R8C3: 7, R8C7: 5, R8C8: 3,
};

// Each line, transcribed from the drawn polylines, cell-first at its circle
// end.
const lines = [
  ['R3C5', 'R4C6', 'R5C7', 'R6C6', 'R7C5', 'R6C4', 'R5C3', 'R4C4'],
  ['R3C6', 'R2C5', 'R3C4'],
  ['R4C3', 'R5C2', 'R6C3'],
  ['R7C4', 'R8C5', 'R7C6'],
  ['R6C7', 'R5C8', 'R4C7'],
  ['R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3'],
  ['R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7'],
  ['R7C1', 'R6C1', 'R5C1', 'R4C1', 'R3C1'],
  ['R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9'],
];

// State machine for one line: the first cell (the circle) sets the target
// count without contributing to it; each remaining cell adds 1 to the
// running count when odd. Rejecting as soon as count exceeds target both
// clamps the state space and enforces the constraint early.
const oddCountMachine = NFA.encodeSpec({
  startState: { phase: 'circle' },
  transition: (state, value) => {
    if (state.phase === 'circle') {
      return { phase: 'line', target: value, count: 0 };
    }
    const count = state.count + value % 2;
    return count <= state.target
      ? { phase: 'line', target: state.target, count }
      : undefined;
  },
  accept: (state) => state.phase === 'line' && state.count === state.target,
  maxDepth: 9,
}, 9);

return [
  new Shape('9x9'),
  ...Object.entries(givens).map(([cell, value]) => new Given(cell, value)),
  ...lines.map(cells => new NFA(oddCountMachine, 'odd-line-count', ...cells)),
];
