// Title: 'Joker' Killer Sudoku
// Author: Robin Geets
// Video: https://www.youtube.com/watch?v=70n5WvUZUTM
// Source: https://cracking-the-cryptic.web.app/sudoku/qjBPD34Fj2

// Normal sudoku rules (default rows/cols/boxes all-different). Killer cages:
// digits within a cage are distinct and sum to the printed total. The payload
// carries no rules text; this is the video description's own wording ("Each
// row, column and 3x3 box contains the digits 1-9. Numbers in cages show the
// sum of (different) digits in those cages.").
//
// Four cages (R1C1, R1C2, R1C8, R1C9) are single cells with no printed total
// (empty `value` in the drawn `cages` array) -- still real cages per the
// payload, encoded as Cage(0, ...) ("no total" -> AllDifferent only), which is
// vacuous for a single cell.
//
// Two greater-than signs are drawn as text overlays on the row-1 borders next
// to these four cages: an unrotated ">" between R1C1/R1C2 (R1C1 > R1C2), and
// an unrotated "<" between R1C8/R1C9 (R1C8 < R1C9). Both are styled with a
// white box (`backgroundColor`/`borderColor` #FFFFFF) and no explicit text
// colour -- the box blends into the grid, but the glyph itself renders in the
// default visible colour.
//
// The 59 coloured cell-fill `underlays`: no rule names a colour, so they are
// the puzzle's visual theme, not a constraint.

// Given digits, transcribed from the drawn `cells` array.
const givens = [
  ['R4C5', 6],
  ['R8C3', 1],
  ['R8C4', 2],
  ['R8C5', 3],
  ['R8C6', 4],
  ['R8C7', 5],
];

// Cage cells and totals transcribed from the drawn `cages` array.
const cages = [
  [24, 'R1C3', 'R2C2', 'R2C3', 'R2C4'],
  [6, 'R3C2', 'R3C3', 'R3C4'],
  [26, 'R4C2', 'R4C3', 'R4C4', 'R5C3'],
  [24, 'R3C6', 'R3C7', 'R3C8'],
  [13, 'R4C6', 'R4C7', 'R4C8', 'R5C7'],
  [25, 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7'],
  [14, 'R7C4', 'R7C5', 'R7C6'],
  [11, 'R1C7', 'R2C6', 'R2C7', 'R2C8'],
  [20, 'R5C4', 'R5C5', 'R5C6'],
  [13, 'R7C1', 'R7C2', 'R7C3'],
  [18, 'R7C7', 'R7C8', 'R7C9'],
  [0, 'R1C1'],
  [0, 'R1C2'],
  [0, 'R1C8'],
  [0, 'R1C9'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  new GreaterThan('R1C1', 'R1C2'),
  new GreaterThan('R1C9', 'R1C8'),
];
