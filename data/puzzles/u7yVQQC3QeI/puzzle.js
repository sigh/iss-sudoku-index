// Title: RAT RUN 6: Equilibrium
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=u7yVQQC3QeI
// Source: https://sudokupad.app/3xa2x14bxe

// Normal sudoku. The yellow teleport cells contain the same digit, and each
// drawn blackcurrant joins digits in a 1:2 ratio. Maze path rules are omitted.

const blackcurrants = [
  ['R6C9', 'R7C9'], ['R7C1', 'R7C2'], ['R5C3', 'R6C3'],
  ['R8C5', 'R8C6'], ['R5C5', 'R6C5'], ['R4C9', 'R5C9'], ['R8C4', 'R9C4'],
];

return [
  new Shape('9x9'),
  new SameValues(2, 'R1C1', 'R9C9'),
  ...blackcurrants.map(([a, b]) => new BlackDot(a, b)),
];
