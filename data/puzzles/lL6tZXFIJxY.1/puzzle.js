// Title: Feb. 11, 2023: Semikiller
// Author: clover!
// Video: https://www.youtube.com/watch?v=lL6tZXFIJxY
// Source: https://tinyurl.com/rmhvsb6r

// Normal sudoku rules apply (default row/column/box AllDifferent).
// Digits must not repeat within a cage: AllDifferent(...cells) per cage.
// A cage's printed total is the sum of all but one of its digits; which
// digit is left out is not given and must be determined by the solver.
// Encoded as: for each cage, at least one choice of excluded cell makes the
// sum of the remaining cells equal the total (Or over Sum branches, one
// branch per candidate excluded cell).

// Cage cells and totals, transcribed from the puzzle's `cage` array.
const cages = [
  { cells: ['R1C1', 'R1C2', 'R2C1', 'R2C2'], total: 6 },
  { cells: ['R1C8', 'R1C9', 'R2C8', 'R2C9'], total: 24 },
  { cells: ['R8C8', 'R8C9', 'R9C8', 'R9C9'], total: 7 },
  { cells: ['R8C1', 'R8C2', 'R9C1', 'R9C2'], total: 23 },
  { cells: ['R6C6', 'R6C7', 'R7C6', 'R7C7'], total: 7 },
  { cells: ['R6C3', 'R6C4', 'R7C3', 'R7C4'], total: 24 },
  { cells: ['R3C3', 'R3C4', 'R4C3', 'R4C4'], total: 6 },
  { cells: ['R3C6', 'R3C7', 'R4C6', 'R4C7'], total: 23 },
  { cells: ['R1C5', 'R1C6', 'R2C5'], total: 5 },
  { cells: ['R4C9', 'R5C8', 'R5C9'], total: 14 },
  { cells: ['R8C5', 'R9C4', 'R9C5'], total: 5 },
  { cells: ['R5C1', 'R5C2', 'R6C1'], total: 5 },
];

function semikillerCage({ cells, total }) {
  return [
    new AllDifferent(...cells),
    new Or(cells.map(
      (excluded) => new Sum(total, ...cells.filter((c) => c !== excluded)))),
  ];
}

return [
  new Shape('9x9'),

  // Givens, transcribed from the grid.
  new Given('R1C3', 7), new Given('R1C7', 3),
  new Given('R2C2', 9), new Given('R2C8', 6),
  new Given('R3C1', 6), new Given('R3C9', 1),
  new Given('R7C1', 2), new Given('R7C9', 3),
  new Given('R8C2', 7), new Given('R8C8', 8),
  new Given('R9C3', 4), new Given('R9C7', 5),

  ...cages.flatMap(semikillerCage),
];
