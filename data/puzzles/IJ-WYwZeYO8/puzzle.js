// Title: Transmission
// Author: Qodec
// Video: https://www.youtube.com/watch?v=IJ-WYwZeYO8
// Source: https://sudokupad.app/pn2nbdselm

// Standard Sudoku with R9C9 = 2. On each blue line, its endpoints give the
// even- and odd-digit counts in either orientation. White dots give consecutive
// values; missing dots carry no negative information. Coordinates come from the
// drawn lines and dots.
const parityCounter = NFA.encodeSpec({
  startState: {first: null, last: null, evens: 0, odds: 0},
  transition: (state, value) => ({
    first: state.first ?? value,
    last: value,
    evens: state.evens + (value % 2 === 0 ? 1 : 0),
    odds: state.odds + (value % 2 === 1 ? 1 : 0),
  }),
  accept: state => state.evens === state.first && state.odds === state.last,
  maxDepth: 9,
}, 9);

const lines = [
  ['R1C3', 'R1C4', 'R1C5', 'R2C5', 'R2C4', 'R2C3'],
  ['R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R2C8', 'R2C7', 'R2C6'],
  ['R3C2', 'R4C2', 'R5C2', 'R5C1', 'R4C1', 'R3C1'],
  ['R3C3', 'R3C4', 'R4C3', 'R4C4', 'R4C5', 'R5C4', 'R5C5'],
  ['R3C7', 'R4C6', 'R5C6', 'R6C5', 'R6C4', 'R7C3'],
  ['R4C7', 'R5C7', 'R6C7', 'R6C6', 'R7C6', 'R7C5', 'R7C4'],
  ['R4C8', 'R5C8', 'R6C8', 'R7C8', 'R7C7', 'R8C7', 'R8C6', 'R8C5', 'R8C4'],
  ['R6C2', 'R7C2', 'R8C2', 'R9C2', 'R9C1', 'R8C1', 'R7C1', 'R6C1'],
];
const dots = [
  ['R1C2', 'R1C3'], ['R1C4', 'R1C5'], ['R2C7', 'R2C8'],
  ['R4C1', 'R5C1'], ['R7C2', 'R8C2'],
];

return [
  new Shape('9x9'),
  new Given('R9C9', 2),
  ...dots.map(([a, b]) => new WhiteDot(a, b)),
  ...lines.map(line => new Or([
    new NFA(parityCounter, 'parity-count', ...line),
    new NFA(parityCounter, 'parity-count', ...line.slice().reverse()),
  ])),
];
