// Title: Most Squares
// Author: henter
// Video: https://www.youtube.com/watch?v=_Rf4tFPFPqU
// Source: https://sudokupad.app/j8lyh1tj3o

// Each line's digit sum equals the square of its maximum digit.
const squareSumLine = NFA.encodeSpec({
  startState: {sum: 0, max: 0},
  transition: ({sum, max}, value) => ({
    sum: sum + value,
    max: Math.max(max, value),
  }),
  accept: ({sum, max}) => sum === max * max,
  maxDepth: 13,
}, 9);

const lines = [
  ['R4C1', 'R3C1', 'R2C1', 'R2C2', 'R1C2', 'R1C3', 'R1C4'],
  ['R9C1', 'R8C2', 'R8C3', 'R7C3', 'R6C4', 'R6C5', 'R5C5', 'R5C6', 'R4C6', 'R3C7', 'R3C8', 'R2C8', 'R2C9'],
  ['R9C5', 'R9C6', 'R9C7', 'R9C8', 'R8C9', 'R7C9', 'R6C9', 'R5C9'],
  ['R6C6', 'R7C6', 'R7C7'],
  ['R4C3', 'R5C3', 'R5C4', 'R4C4', 'R4C5', 'R3C5', 'R3C4', 'R2C3', 'R3C3', 'R3C2'],
];

return [
  new Shape('9x9'),
  ...lines.map((cells) => new NFA(squareSumLine, 'square-sum', ...cells)),
];
