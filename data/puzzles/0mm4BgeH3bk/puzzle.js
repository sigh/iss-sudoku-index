// Title: Qaak
// Author: dumediat
// Video: https://www.youtube.com/watch?v=0mm4BgeH3bk
// Source: https://sudokupad.app/zroqrn8dgg

// Rules encoded below, in full:
// - Quattroquadri sudoku: place the digits 1 to 9 once each into the 3x3 boxes.
//   Digits may not repeat in the same row, column, or box of the 6x6 grid.
// - Anti-Diagonal: each of the two marked diagonals contains only 3 distinct
//   digits.
// - Arrow: digits along an arrow must sum to the value in that arrow's circle.
// - Killer: digits in cages must not repeat, and sum to the small number in the
//   top left corner of the cage.
// There are no given digits, and nothing is omitted.

// 6x6 board with the alphabet widened to 1-9 and the boxes resized to the 3x3
// tiling; a 9-cell box over 9 values is "1 to 9 once each". Rows and columns
// keep the default all-different, so each holds 6 of the 9 digits.
const shape = new Shape('6x6', 9);

// Killer cages as drawn: printed total, then the cage's cells.
const cages = [
  [23, 'R1C1', 'R1C2', 'R2C1', 'R2C2'],
  [11, 'R1C5', 'R1C6', 'R2C6'],
  [13, 'R5C5', 'R5C6', 'R6C5', 'R6C6'],
].map(([total, ...cells]) => new Cage(total, ...cells));

// Arrows as drawn: the circle cell first, then the shaft cells running outwards
// from the circle. The third arrow's shaft is a single cell, and the sixth bends
// at R6C1.
const arrows = [
  ['R4C6', 'R3C5', 'R2C4', 'R1C3'],
  ['R2C3', 'R3C4', 'R4C5'],
  ['R4C4', 'R3C3'],
  ['R3C2', 'R4C3', 'R5C4'],
  ['R6C4', 'R5C3', 'R4C2', 'R3C1'],
  ['R6C2', 'R6C1', 'R5C1'],
].map(cells => new Arrow(...cells));

// The two marked diagonals. They are drawn as two strokes meeting at the board's
// centre point; the four rays leaving that point form two exactly opposite
// pairs, so the ink is the main and anti diagonals crossing - which is also what
// the rules sentence calls them - rather than two V-shaped clues.
const diagonals = [
  [1, 2, 3, 4, 5, 6].map(i => makeCellId(i, i)),
  [1, 2, 3, 4, 5, 6].map(i => makeCellId(i, 7 - i)),
];

// CountDistinct reads its target count from a control cell, so a single Var cell
// pinned to 3 supplies the constant "only 3 distinct digits" for both diagonals.
const distinctCount = new Var('D', 'distinct digits per diagonal', 1);
const control = distinctCount.cell(1);

return [
  shape,
  new RegionSize(9),
  ...cages,
  ...arrows,
  distinctCount,
  new Given(control, 3),
  ...diagonals.map(cells => new CountDistinct(control, ...cells)),
];
