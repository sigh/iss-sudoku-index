// Title: Jun 25, 2022: XV Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=idOQ2SbahmQ
// Source: https://tinyurl.com/5n6zk2dn

// Normal Sudoku rules apply. Each pair of cells listed below is joined by an
// "XV" marking and its two digits must sum to 15. The rules state markings
// are not exhaustive ("Cells without such a marking may or may not add up to
// 15"), so there is no negative constraint on unmarked adjacent pairs -- only
// the marked pairs are constrained. `Sum` (not `Cage`) is used per pair since
// the rule gives only a total, and the two cells of each pair are already
// orthogonally adjacent so row/column all-different already forces them
// distinct.

const givens = [
  new Given('R1C1', 2), new Given('R1C2', 4), new Given('R1C5', 6),
  new Given('R2C8', 4), new Given('R2C9', 3),
  new Given('R4C7', 3), new Given('R4C8', 5),
  new Given('R5C5', 1),
  new Given('R6C2', 2), new Given('R6C3', 4),
  new Given('R8C1', 5), new Given('R8C2', 3),
  new Given('R9C5', 8), new Given('R9C8', 3), new Given('R9C9', 1),
];

// XV markings, transcribed from the drawn circle markers on the grid edges.
const xvPairs = [
  ['R4C1', 'R5C1'],
  ['R2C2', 'R2C3'],
  ['R5C4', 'R4C4'],
  ['R5C6', 'R6C6'],
  ['R5C9', 'R6C9'],
  ['R1C8', 'R1C9'],
  ['R2C7', 'R2C6'],
  ['R8C3', 'R8C4'],
  ['R8C7', 'R8C8'],
  ['R9C1', 'R9C2'],
];

const xvSums = xvPairs.map(([a, b]) => new Sum(15, a, b));

return [
  new Shape('9x9'),
  ...givens,
  ...xvSums,
];
