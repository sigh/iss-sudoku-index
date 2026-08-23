// Title: Brutalism
// Author: PulverizingPancake
// Video: https://www.youtube.com/watch?v=NFRjq4FbTLg
// Source: https://app.crackingthecryptic.com/sudoku/gf6J42PBQ4

// Normal sudoku rules (default row/column/box all-different from Shape).
// Cages: digits sum to the printed total (all-different within the cage is
// Cage's default semantics); one cage (R1C8,R1C9,R2C8) has no printed total,
// so per the catalog a no-total killer cage is simply AllDifferent over its
// cells.
// Both main diagonals are marked no-repeat (drawn in blue); Diagonal(1) is
// the bottom-left-to-top-right diagonal (matches R9C1..R1C9 here) and
// Diagonal(-1) is the top-left-to-bottom-right diagonal (R1C1..R9C9); both
// apply to the whole-grid diagonal automatically.

const cages = [
  { cells: ['R1C4', 'R2C4'], sum: 7 },
  { cells: ['R1C5', 'R1C6', 'R2C6'], sum: 22 },
  { cells: ['R2C5', 'R3C5'], sum: 11 },
  { cells: ['R3C6', 'R3C7'], sum: 10 },
  { cells: ['R3C3', 'R3C4'], sum: 10 },
  { cells: ['R7C3', 'R7C4'], sum: 10 },
  { cells: ['R7C6', 'R7C7'], sum: 10 },
  { cells: ['R4C4', 'R5C4', 'R6C4'], sum: 17 },
  { cells: ['R7C5', 'R8C4', 'R8C5'], sum: 13 },
  { cells: ['R8C6', 'R9C6'], sum: 12 },
  { cells: ['R9C4', 'R9C5'], sum: 15 },
  { cells: ['R8C2', 'R9C1', 'R9C2'], sum: 8 },
  { cells: ['R8C8', 'R8C9', 'R9C9'], sum: 20 },
  { cells: ['R1C8', 'R1C9', 'R2C8'], sum: null },
  { cells: ['R1C1', 'R2C1', 'R2C2'], sum: 13 },
  { cells: ['R4C1', 'R4C2'], sum: 12 },
  { cells: ['R6C1', 'R6C2'], sum: 10 },
  { cells: ['R4C7', 'R5C7', 'R6C7'], sum: 19 },
];

const cageConstraints = cages.map(({ cells, sum }) =>
  sum === null ? new AllDifferent(...cells) : new Cage(sum, ...cells)
);

return [
  new Shape('9x9'),
  ...cageConstraints,
  new Diagonal(-1),
  new Diagonal(1),
];
