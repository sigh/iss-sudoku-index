// Title: Toroidal Odd Sudoku
// Author: Richard Stolk
// Video: https://www.youtube.com/watch?v=bN9WIy-fjwI
// Source: https://cracking-the-cryptic.web.app/sudoku/b8fb2FgP6t
//
// 7x7 grid, digits 1-7. Normal row/column all-different rules apply. The
// payload defines seven irregular 7-cell regions, replacing the default
// boxes; each is an all-different group. The archived payload carries no
// rules text at all (no metadata/title/author/rules field), so the meaning
// of the ten light-grey shaded cells (drawn as underlays) is not stated
// anywhere local and is left entirely unencoded.

const REGIONS = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C2', 'R2C3', 'R7C1', 'R7C2'],
  ['R2C1', 'R3C1', 'R3C2', 'R4C1', 'R4C2', 'R2C7', 'R3C7'],
  ['R1C4', 'R1C5', 'R2C4', 'R2C5', 'R2C6', 'R3C5', 'R3C6'],
  ['R1C6', 'R1C7', 'R6C5', 'R6C6', 'R7C5', 'R7C6', 'R7C7'],
  ['R3C3', 'R3C4', 'R4C3', 'R4C4', 'R4C5', 'R5C4', 'R5C5'],
  ['R5C1', 'R4C6', 'R5C6', 'R4C7', 'R5C7', 'R6C1', 'R6C7'],
  ['R5C2', 'R5C3', 'R6C2', 'R6C3', 'R6C4', 'R7C3', 'R7C4'],
];

const GIVENS = [
  ['R1C5', 2],
  ['R1C6', 6],
  ['R1C7', 3],
  ['R2C6', 1],
  ['R2C7', 5],
  ['R3C7', 4],
];

return [
  new Shape('7x7'),
  new NoBoxes(),
  ...REGIONS.map(cells => new Jigsaw('7x7', ...cells)),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
];
