// Title: June 4, 2022: Epic Crossover
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=aceUogoL-QM
// Source: https://tinyurl.com/6x5kvvep

// Rules encoded here, in full:
//  * Normal sudoku: 1-9 once per row, column and 3x3 box.
//  * A white dot between two adjacent cells: those digits are consecutive
//    (differ by 1).
//  * A black dot between two adjacent cells: one digit is double the
//    other. No negative constraint: unmarked adjacent cells may still
//    happen to be consecutive or in a 2:1 ratio.
//
// Dot cell pairs below are transcribed from the payload's `difference`
// (white dot) and `ratio` (black dot) arrays.

const whiteDots = [
  ['R3C1', 'R3C2'], ['R5C3', 'R5C4'], ['R7C5', 'R7C6'], ['R9C7', 'R9C8'],
  ['R1C3', 'R2C3'], ['R2C4', 'R3C4'], ['R3C5', 'R4C5'], ['R5C7', 'R6C7'],
  ['R6C8', 'R7C8'], ['R7C9', 'R8C9'], ['R4C6', 'R5C6'],
];

const blackDots = [
  ['R2C1', 'R3C1'], ['R3C2', 'R4C2'], ['R4C3', 'R5C3'], ['R6C5', 'R7C5'],
  ['R7C6', 'R8C6'], ['R8C7', 'R9C7'], ['R1C2', 'R1C3'], ['R3C4', 'R3C5'],
  ['R5C6', 'R5C7'], ['R7C8', 'R7C9'], ['R5C4', 'R6C4'],
];

return [
  new Shape('9x9'),
  new Given('R2C2', 7),
  new Given('R2C5', 3),
  new Given('R2C8', 8),
  new Given('R5C2', 5),
  new Given('R5C5', 6),
  new Given('R5C8', 1),
  new Given('R8C2', 4),
  new Given('R8C5', 9),
  new Given('R8C8', 2),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
];
