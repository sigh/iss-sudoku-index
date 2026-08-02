// Title: Sigma Pi
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=52BxMj5Y-PU
// Source: https://sudokupad.app/7mse59d0ww

// Standard 9x9 Sudoku. X markers join cells summing to 10. On each brown line,
// the product of the first and last digit equals the sum of all its digits.
// The NFA state retains the first digit, latest digit, and running line sum.
const sigmaPi = NFA.encodeSpec({
  startState: null,
  transition: (state, value) => state === null ?
    { first: value, last: value, sum: value } :
    { first: state.first, last: value, sum: state.sum + value },
  accept: state => state !== null && state.sum === state.first * state.last,
  maxDepth: 7,
}, 9);

// Brown-line paths transcribed from the drawn brown strokes, in waypoint order.
const brownLines = [
  ['R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5'],
  ['R7C4', 'R8C4', 'R9C4'],
  ['R4C6', 'R5C6', 'R6C6'],
  ['R1C3', 'R1C2', 'R1C1', 'R2C2', 'R3C1', 'R3C2', 'R3C3'],
  ['R9C7', 'R8C7', 'R7C7', 'R7C8', 'R7C9', 'R8C9', 'R9C9'],
  ['R7C1', 'R8C1', 'R9C2', 'R9C1'],
  ['R8C2', 'R9C3', 'R8C3', 'R7C2', 'R7C3'],
  ['R5C2', 'R5C3', 'R6C3', 'R6C4'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9'],
  ['R2C6', 'R3C6', 'R3C7', 'R2C7', 'R2C8', 'R3C8', 'R4C8'],
];

return [
  new Shape('9x9'),
  new X('R7C4', 'R8C4'),
  new X('R5C6', 'R6C6'),
  new X('R4C7', 'R4C8'),
  ...brownLines.map(cells => new NFA(sigmaPi, 'sigma-pi', ...cells)),
];
