// Title: Bull Believer
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=ASGW-DxAPrw
// Source: https://tinyurl.com/yyv6u8rw

// Normal sudoku rules apply (the Shape default). Each listed killer cage sums
// to its corner total; every cage is a horizontal pair, so its distinctness is
// already required by the normal row rule.

// Cages transcribed from the payload's `killercage` array.
const cages = [
  [3, 'R2C1', 'R2C2'], [7, 'R2C3', 'R2C4'],
  [11, 'R2C5', 'R2C6'], [15, 'R2C7', 'R2C8'],
  [17, 'R8C8', 'R8C9'], [13, 'R8C6', 'R8C7'],
  [9, 'R8C4', 'R8C5'], [5, 'R8C2', 'R8C3'],
  [8, 'R3C5', 'R3C6'], [5, 'R3C3', 'R3C4'],
  [12, 'R7C4', 'R7C5'], [15, 'R7C6', 'R7C7'],
  [17, 'R3C1', 'R3C2'], [3, 'R7C8', 'R7C9'],
  [9, 'R4C3', 'R4C4'], [11, 'R6C6', 'R6C7'],
  [7, 'R4C1', 'R4C2'], [11, 'R5C1', 'R5C2'],
  [6, 'R6C8', 'R6C9'], [11, 'R5C8', 'R5C9'],
];

return [
  new Shape('9x9'),
  new Given('R4C6', 3),
  new Given('R4C7', 9),
  new Given('R6C3', 1),
  new Given('R6C4', 7),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
