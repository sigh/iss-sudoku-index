// Title: Serial Killers
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=bYOwPT0KfTk
// Source: https://tinyurl.com/n5xatfn3

// Normal sudoku rules. Ten cages each sum to the printed total and each cage
// must contain at least one repeated digit (repeats are otherwise unrestricted
// within the cage, so a cage may hold more than one repeated pair or a digit
// repeated more than twice, subject only to normal sudoku).
//
// Cage totals use Sum (not Cage), which allows repeats.
//
// For each cage below, every cell pair sharing a row, column, or box is
// already forced distinct by normal sudoku, so it can never be the required
// repeat. Filtering to the remaining pairs leaves exactly one candidate pair
// per cage -- the only two cells in the cage that could actually hold equal
// digits -- so the "at least one repeat" rule reduces to that pair being
// forced equal via SameValues(2, a, b).

const givens = [
  ['R4C6', 4],
  ['R6C4', 6],
];

// Cages transcribed from the payload's cage array; repeatPair derived from
// row/column/box membership as described above.
const cages = [
  { total: 7, cells: ['R2C2', 'R2C3', 'R3C2', 'R4C2'], repeatPair: ['R2C3', 'R4C2'] },
  { total: 15, cells: ['R7C2', 'R8C2', 'R8C3', 'R8C4'], repeatPair: ['R7C2', 'R8C4'] },
  { total: 33, cells: ['R6C8', 'R7C8', 'R8C7', 'R8C8'], repeatPair: ['R6C8', 'R8C7'] },
  { total: 25, cells: ['R2C6', 'R2C7', 'R2C8', 'R3C8'], repeatPair: ['R2C6', 'R3C8'] },
  { total: 26, cells: ['R2C4', 'R3C3', 'R3C4'], repeatPair: ['R2C4', 'R3C3'] },
  { total: 23, cells: ['R6C2', 'R6C3', 'R7C3'], repeatPair: ['R6C2', 'R7C3'] },
  { total: 7, cells: ['R3C7', 'R4C7', 'R4C8'], repeatPair: ['R3C7', 'R4C8'] },
  { total: 4, cells: ['R7C6', 'R7C7', 'R8C6'], repeatPair: ['R7C7', 'R8C6'] },
  { total: 17, cells: ['R5C1', 'R5C2', 'R6C1', 'R7C1'], repeatPair: ['R5C2', 'R7C1'] },
  { total: 16, cells: ['R3C9', 'R4C9', 'R5C8', 'R5C9'], repeatPair: ['R3C9', 'R5C8'] },
];

return [
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(cage => new Sum(cage.total, ...cage.cells)),
  ...cages.map(cage => new SameValues(2, ...cage.repeatPair)),
];
