// Title: 20 Lines
// Author: zetamath
// Video: https://www.youtube.com/watch?v=syte6HjZn-I
// Source: https://app.crackingthecryptic.com/sudoku/MQFjtH2mRh

// Normal sudoku rules (standard 3x3 boxes, no givens). One black (Kropki) dot
// is drawn, between R8C5 and R9C5: BlackDot enforces one value double the
// other on that adjacent pair only -- other adjacent pairs are unconstrained,
// matching "not all black dots are necessarily given". Each of the 11 drawn
// grey lines is a "20 line": SumLine(20, ...) allows the line to be split
// into any number of contiguous summing strings, each totalling 20, with
// repeats allowed throughout -- exactly the stated rule.

const lines = [
  ['R1C3', 'R1C2', 'R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'],
  ['R2C3', 'R2C2', 'R3C2', 'R3C3'],
  ['R9C2', 'R8C2', 'R7C2', 'R6C2', 'R5C2', 'R4C2', 'R4C3', 'R5C3', 'R6C3', 'R7C3'],
  ['R6C4', 'R7C4', 'R8C4', 'R8C3', 'R9C3', 'R9C4', 'R9C5', 'R9C6'],
  ['R8C6', 'R8C5', 'R7C5', 'R6C5', 'R5C6', 'R5C5', 'R5C4'],
  ['R4C4', 'R3C4', 'R3C5', 'R3C6'],
  ['R1C4', 'R1C5', 'R1C6', 'R2C7'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'],
  ['R2C8', 'R3C8', 'R4C8'],
  ['R5C8', 'R6C8', 'R6C7', 'R5C7', 'R4C7', 'R4C6', 'R4C5'],
  ['R7C8', 'R8C8', 'R9C8', 'R9C7', 'R8C7', 'R7C7', 'R7C6'],
];

return [
  new Shape('9x9'),
  new BlackDot('R8C5', 'R9C5'),
  ...lines.map(cells => new SumLine(20, ...cells)),
];
