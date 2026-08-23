// Title: Between Lines Killer Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=ztvshyksPS8
// Source: https://app.crackingthecryptic.com/sudoku/f6tJLF98b9

// Normal sudoku rules apply (rows, columns, boxes all-different; no givens).
// Digits do not repeat in cages, which show their sums.
// A digit on a line must be somewhere between the digits in the circles on
// the end of the line.
//
// Each of the 14 groups below is drawn once as both a killer cage (3 cells,
// distinct digits, printed sum) and a between line over the same 3 cells,
// whose two end cells carry the circles; the cell listed second in each
// triple is the shared middle/corner cell. Cell order within each group is
// end, middle, end, matching the drawn stroke and circle placement.

const groups = [
  ['R1C2', 'R1C1', 'R2C1', 6],
  ['R2C3', 'R2C2', 'R3C2', 15],
  ['R3C4', 'R3C3', 'R4C3', 16],
  ['R5C4', 'R4C4', 'R4C5', 6],
  ['R5C6', 'R6C6', 'R6C5', 24],
  ['R6C7', 'R7C7', 'R7C6', 14],
  ['R7C8', 'R8C8', 'R8C7', 15],
  ['R8C9', 'R9C9', 'R9C8', 24],
  ['R3C6', 'R3C7', 'R4C7', 12],
  ['R2C7', 'R2C8', 'R3C8', 24],
  ['R1C8', 'R1C9', 'R2C9', 14],
  ['R6C3', 'R7C3', 'R7C4', 14],
  ['R7C2', 'R8C2', 'R8C3', 19],
  ['R8C1', 'R9C1', 'R9C2', 8],
];

return [
  new Shape('9x9'),
  ...groups.map(([a, b, c, sum]) => new Cage(sum, a, b, c)),
  ...groups.map(([a, b, c]) => new Between(a, b, c)),
];
