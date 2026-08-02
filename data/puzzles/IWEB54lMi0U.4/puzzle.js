// Title: September 26, 2023: Hang 10
// Author: clover!
// Video: https://www.youtube.com/watch?v=IWEB54lMi0U
// Source: https://tinyurl.com/4kb4w6bn

// Normal Sudoku. The ten drawn cages have distinct digits; their distinct
// totals are the values 1 through 10 in an unknown order. The T variables
// represent those totals, while the candidate restrictions retain digits 1-9
// on the 9x9 Sudoku grid after widening the shared value range for T=10.
const rows = cellGraph('9x9').rows();
const totals = new Var('T', 'cage totals', 10);
const cageTotals = totals.cells();
const cages = [
  ['R2C5', 'R3C5'],
  ['R5C2', 'R5C3'],
  ['R2C7', 'R3C7', 'R3C8'],
  ['R7C2', 'R7C3', 'R8C3'],
  ['R4C4', 'R4C5', 'R5C4'],
  ['R6C6'],
  ['R1C1', 'R1C2', 'R2C1', 'R2C2'],
  ['R4C7'],
  ['R7C4'],
  ['R8C9', 'R9C8', 'R9C9'],
];
const givens = [
  ['R1C7', 5], ['R2C8', 9], ['R3C3', 9], ['R3C4', 5], ['R3C6', 6],
  ['R3C9', 3], ['R4C3', 8], ['R4C6', 9], ['R4C7', 3], ['R6C3', 7],
  ['R6C4', 8], ['R6C7', 4], ['R7C1', 7], ['R7C4', 2], ['R7C6', 5],
  ['R7C7', 9], ['R8C2', 6], ['R9C3', 4],
];

return [
  new Shape('9x9', '1-10'),
  ...rows.map((row) => new Regex('[1-9]{9}', ...row)),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  totals,
  new AllDifferent(...cageTotals),
  ...cages.flatMap((cells, index) => [
    new AllDifferent(...cells),
    new EqualSum(cells, [cageTotals[index]]),
  ]),
];
