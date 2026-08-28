// Title: Mystery Killer Sudoku
// Author: Sam Cavnar-Johnson
// Video: https://www.youtube.com/watch?v=FVyMkeU1iBs
// Source: https://cracking-the-cryptic.web.app/sudoku/nB7tD6Fnn8

// Normal sudoku rules apply (default row/column/box all-different, no
// givens). The grid holds 16 cages; digits within a cage do not repeat, and
// every cage sums to the same total NI, a value the rules leave to be
// discovered while solving -- so each cage is an AllDifferent with no known
// total, and one EqualSum ties all 16 cage totals to each other.

const cages = [
  ['R1C2', 'R1C3'],
  ['R1C4', 'R1C5', 'R1C6'],
  ['R1C9', 'R2C9', 'R2C8'],
  ['R2C7', 'R2C6', 'R2C5'],
  ['R3C1', 'R3C2', 'R4C2', 'R4C1'],
  ['R3C3', 'R3C4', 'R3C5', 'R3C6'],
  ['R3C7', 'R3C8', 'R3C9', 'R4C8'],
  ['R4C4', 'R4C5', 'R4C6', 'R5C5'],
  ['R5C3', 'R6C3', 'R7C3'],
  ['R6C1', 'R6C2', 'R7C2'],
  ['R6C4', 'R6C5', 'R7C5', 'R8C5'],
  ['R6C6', 'R6C7', 'R7C7'],
  ['R5C9', 'R6C9', 'R6C8'],
  ['R7C8', 'R7C9', 'R8C9', 'R8C8'],
  ['R8C7', 'R9C7'],
  ['R8C3', 'R9C3', 'R9C2'],
];

return [
  new Shape('9x9'),
  ...cages.map((cells) => new AllDifferent(...cells)),
  new EqualSum(...cages),
];
