// Title: 3/9: Plus C'est la Meme Chose
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=BqmW8Cw_Mn8
// Source: https://tinyurl.com/2kewu823

// Normal sudoku rules apply. Killer: digits in cages cannot repeat and must
// sum to the total given. No givens. Cages do not cover the whole grid; the
// remaining cells are constrained only by row/column/box all-different.
// Cage cells and totals transcribed from the payload's killercage array.

const cages = [
  [7, 'R1C1', 'R1C2'],
  [3, 'R1C3', 'R1C4'],
  [17, 'R2C8', 'R2C9'],
  [24, 'R4C7', 'R4C8', 'R4C9'],
  [6, 'R6C1', 'R6C2', 'R6C3'],
  [13, 'R9C8', 'R9C9'],
  [17, 'R9C6', 'R9C7'],
  [3, 'R8C1', 'R8C2'],
  [13, 'R6C9', 'R7C9'],
  [7, 'R3C1', 'R4C1'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
