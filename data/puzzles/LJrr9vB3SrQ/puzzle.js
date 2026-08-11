// Title: Number 5 Is Still Alive
// Author: Sed Holaysan
// Video: https://www.youtube.com/watch?v=LJrr9vB3SrQ
// Source: https://app.crackingthecryptic.com/sudoku/HPh3njgLdr
//
// Normal sudoku rules apply (standard rows/columns/3x3 boxes, digits 1-9).
// Rules: "Digits in cages sum to a number that ends in 5. Digits cannot
// repeat within a cage." Every cage carries both clauses: an AllDifferent
// for the no-repeat clause, and a total-ends-in-5 clause. No cage has a
// printed total (all draw as bare outlines), so each cage's actual total is
// left free among the values that end in 5 and are reachable by that many
// distinct digits from 1-9.
//
// For a k-cell cage the reachable range is
//   min = 1+2+...+k = k(k+1)/2 , max = sum of the top k digits = (19-k)*k/2 .
// Intersecting that range with {5, 15, 25, 35, 45, ...} gives each cage's
// candidate totals (an arithmetic fact about the 1-9 alphabet, independent
// of any solution): k=2 -> {5,15}; k=3 -> {15} only (a 3-cell distinct sum
// can't reach 5 or 25); k=4 -> {15,25}; k=5 -> {15,25,35}; k=9 -> {45} only,
// so a 9-cell cage's clause is automatically satisfied once AllDifferent
// forces it to hold all nine digits 1-9 (sum 45, which ends in 5) -- no Sum
// constraint is added for those two cages, since the base rules alone
// already force the residual clause to hold.
// A cage with two or more candidate totals is Or(Sum(t1,...), Sum(t2,...)).
//
// Cage cell lists are transcribed from the puzzle's drawn cage outlines;
// none of the 11 cages carries a printed total.

const cages = [
  { cells: ['R1C6', 'R1C7', 'R1C8'], sums: [15] },
  { cells: ['R1C2', 'R1C3'], sums: [5, 15] },
  {
    cells: [
      'R1C1', 'R2C1', 'R3C1', 'R3C2', 'R3C3',
      'R4C3', 'R5C3', 'R5C2', 'R5C1',
    ],
    sums: null, // 9-cell cage: forced to {1..9}, sum 45 -- see header.
  },
  { cells: ['R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8'], sums: [15, 25, 35] },
  { cells: ['R3C4', 'R4C4', 'R5C4'], sums: [15] },
  { cells: ['R5C5', 'R5C6', 'R6C6'], sums: [15] },
  { cells: ['R7C6', 'R8C6', 'R8C5'], sums: [15] },
  { cells: ['R8C4', 'R8C3', 'R8C2', 'R7C2'], sums: [15, 25] },
  {
    cells: [
      'R5C9', 'R5C8', 'R5C7', 'R6C7', 'R7C7',
      'R7C8', 'R7C9', 'R8C9', 'R9C9',
    ],
    sums: null, // 9-cell cage: forced to {1..9}, sum 45 -- see header.
  },
  { cells: ['R9C8', 'R9C7'], sums: [5, 15] },
  { cells: ['R9C4', 'R9C3', 'R9C2', 'R9C1'], sums: [15, 25] },
];

const givens = [
  new Given('R1C4', 7),
  new Given('R2C4', 8),
  new Given('R4C8', 3),
  new Given('R4C9', 4),
  new Given('R5C5', 9),
  new Given('R6C1', 1),
  new Given('R6C2', 2),
  new Given('R8C6', 5),
  new Given('R9C6', 6),
];

const cageConstraints = cages.flatMap(({ cells, sums }) => {
  const parts = [new AllDifferent(...cells)];
  if (sums) {
    parts.push(
      sums.length === 1
        ? new Sum(sums[0], ...cells)
        : new Or(sums.map(s => new Sum(s, ...cells))));
  }
  return parts;
});

return [
  new Shape('9x9'),
  ...givens,
  ...cageConstraints,
];
