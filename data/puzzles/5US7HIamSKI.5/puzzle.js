// Title: 8/1/22: Around and Around
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=5US7HIamSKI
// Source: https://tinyurl.com/5yrp5eth

// Normal sudoku rules apply (default row/column/box all-different). Digits
// on arrows must sum to the circled total. Each `Arrow` call lists the
// circle cell first, then the shaft cells in order, matching this class's
// constructor and the source payload's `lines` array.

const givens = [
  ['R1C1', 1], ['R1C6', 8], ['R1C9', 3],
  ['R3C6', 5], ['R3C7', 1],
  ['R4C1', 5], ['R4C3', 6],
  ['R5C5', 5],
  ['R6C7', 5], ['R6C9', 9],
  ['R7C3', 9], ['R7C4', 6],
  ['R9C1', 6], ['R9C4', 3], ['R9C9', 2],
];

// [circle, ...shaft] for each of the 12 arrows.
const arrows = [
  ['R1C6', 'R2C7', 'R3C8'],
  ['R6C7', 'R5C8', 'R4C9'],
  ['R6C9', 'R7C8', 'R8C7'],
  ['R7C4', 'R8C5', 'R9C6'],
  ['R9C4', 'R8C3', 'R7C2'],
  ['R4C3', 'R5C2', 'R6C1'],
  ['R4C1', 'R3C2', 'R2C3'],
  ['R3C6', 'R2C5', 'R1C4'],
  ['R6C3', 'R5C4'],
  ['R4C7', 'R5C6'],
  ['R3C4', 'R4C5'],
  ['R7C6', 'R6C5'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...arrows.map((cells) => new Arrow(...cells)),
];
