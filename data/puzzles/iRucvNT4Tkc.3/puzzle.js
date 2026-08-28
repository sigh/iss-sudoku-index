// Title: Feb 5, 2022: Killer Between
// Author: clover!
// Video: https://www.youtube.com/watch?v=iRucvNT4Tkc
// Source: https://tinyurl.com/542nzek6

// Normal sudoku (default rows/cols/boxes). Killer cages: digits in a cage
// don't repeat and sum to the printed total. Between lines: the first and
// last cell of each line is a circled endpoint, and every interior cell
// must be strictly between the two endpoint values (endpoints unconstrained
// relative to each other; repeats allowed among interior cells subject to
// normal sudoku).

const givens = [
  ['R1C8', 9],
  ['R4C5', 4],
  ['R6C5', 3],
  ['R9C8', 7],
];

// Killer cages: [total, ...cells].
const cages = [
  [6, 'R4C1', 'R5C1', 'R6C1'],
  [7, 'R1C3', 'R1C4', 'R1C5'],
  [8, 'R9C3', 'R9C4', 'R9C5'],
  [18, 'R4C3', 'R5C3', 'R6C3'],
  [9, 'R1C6', 'R1C7'],
  [11, 'R9C6', 'R9C7'],
  [7, 'R5C6', 'R5C7', 'R5C8'],
];

// Between-line paths, first/last cell circled, walked in drawn order. Line
// R4C3-R5C3-R6C3 shares all its cells with the sum-18 killer cage above.
const betweenLines = [
  ['R4C1', 'R3C2', 'R2C3', 'R1C4'],
  ['R6C1', 'R7C2', 'R8C3', 'R9C4'],
  ['R4C3', 'R3C4', 'R2C5', 'R1C6'],
  ['R4C3', 'R5C3', 'R6C3'],
  ['R6C3', 'R7C4', 'R8C5', 'R9C6'],
  ['R9C8', 'R8C7', 'R7C6', 'R6C5'],
  ['R1C8', 'R2C7', 'R3C6', 'R4C5'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
  ...betweenLines.map(cells => new Between(...cells)),
];
