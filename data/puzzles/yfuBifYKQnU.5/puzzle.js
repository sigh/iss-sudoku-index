// Title: June 22, 2023: Consec. Pairs
// Author: clover!
// Video: https://www.youtube.com/watch?v=yfuBifYKQnU
// Source: https://tinyurl.com/4dvdt5fj

// Normal sudoku rules apply. Digits joined by a white dot are consecutive.
// Not all possible dots are given, so the absence of a dot carries no
// information (encoded simply by omitting a WhiteDot for that pair).

const GIVENS = [
  ['R1C7', 6], ['R2C4', 2], ['R3C1', 1], ['R4C5', 1], ['R4C8', 7],
  ['R5C4', 7], ['R5C6', 9], ['R6C2', 3], ['R6C5', 6], ['R7C9', 7],
  ['R8C6', 6], ['R9C3', 4],
];

// White dot pairs, transcribed from the drawn dots (each cell orthogonally
// adjacent to the other).
const DOTS = [
  ['R3C2', 'R3C1'], ['R3C3', 'R3C2'], ['R5C2', 'R6C2'], ['R4C2', 'R5C2'],
  ['R9C3', 'R8C3'], ['R8C3', 'R7C3'], ['R2C5', 'R2C4'], ['R2C5', 'R2C6'],
  ['R2C7', 'R1C7'], ['R3C7', 'R2C7'], ['R4C8', 'R5C8'], ['R5C8', 'R6C8'],
  ['R7C9', 'R7C8'], ['R7C8', 'R7C7'], ['R8C5', 'R8C6'], ['R8C4', 'R8C5'],
  ['R4C3', 'R4C4'], ['R3C6', 'R4C6'], ['R6C6', 'R6C7'], ['R7C4', 'R6C4'],
];

return [
  new Shape('9x9'),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
  ...DOTS.map(([a, b]) => new WhiteDot(a, b)),
];
