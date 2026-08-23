// Title: August 14, 2021: Deficit Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=Y-VrdZMHMqM
// Source: https://app.crackingthecryptic.com/sudoku/dnDqHDQNB8
//
// Place 1-7 so that each row, column and outlined 6-cell region contains
// each number at most once. A 7x7 grid already gives rows and columns
// exactly 7 cells for 7 values, so "at most once" there is equivalent to
// the usual sudoku line and needs no extra encoding (default row/column
// all-different). 7x7 has no default box tiling, so no boxes are added or
// need removing.
//
// The 8 outlined regions have only 6 cells each -- one short of the full
// value count -- so "at most once" there is a genuine weaker constraint
// than a sudoku house: no repeats, but not required to contain every
// value. AllDifferent expresses exactly that (unlike Jigsaw, which also
// requires full coverage). Region cell lists are transcribed from the
// payload's `regions` array; their union covers every grid cell except the
// centre, R4C4, which belongs to no region.

const regions = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R3C1', 'R4C1'],
  ['R1C4', 'R1C5', 'R1C6', 'R1C7', 'R2C7', 'R3C7'],
  ['R4C7', 'R5C7', 'R6C7', 'R7C7', 'R7C6', 'R7C5'],
  ['R7C1', 'R7C2', 'R7C3', 'R7C4', 'R6C1', 'R5C1'],
  ['R2C2', 'R3C2', 'R2C3', 'R3C3', 'R2C4', 'R3C4'],
  ['R2C5', 'R3C6', 'R3C5', 'R2C6', 'R4C5', 'R4C6'],
  ['R4C3', 'R4C2', 'R6C3', 'R5C3', 'R6C2', 'R5C2'],
  ['R5C4', 'R5C5', 'R6C5', 'R6C4', 'R5C6', 'R6C6'],
];

return [
  new Shape('7x7'),

  new Given('R1C2', 1),
  new Given('R1C6', 5),
  new Given('R2C1', 2),
  new Given('R2C3', 3),
  new Given('R2C5', 6),
  new Given('R2C7', 4),
  new Given('R3C2', 4),
  new Given('R3C6', 3),
  new Given('R5C2', 7),
  new Given('R5C6', 2),
  new Given('R6C1', 4),
  new Given('R6C3', 5),
  new Given('R6C5', 1),
  new Given('R6C7', 3),
  new Given('R7C2', 6),
  new Given('R7C6', 4),

  ...regions.map(cells => new AllDifferent(...cells)),
];
