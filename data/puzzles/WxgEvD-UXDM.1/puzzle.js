// Title: Arrow Sudoku
// Author: Clover
// Video: https://www.youtube.com/watch?v=WxgEvD-UXDM
// Source: https://app.crackingthecryptic.com/sudoku/MRqgDj3MJR

// Normal sudoku rules apply. Digits along an arrow sum to the 2-digit
// number, written left-to-right, in the attached pill.
//
// Every pill is a rounded overlay spanning two ordinary grid cells, not a
// separate value slot; the pill's number is simply those two cells' own
// digits, tens then ones by increasing column (all five pills are
// horizontal). Each arrow's arm cells exclude its own pill cells.

const givens = [
  ['R1C5', 9], ['R2C1', 1], ['R2C9', 6], ['R3C4', 8], ['R3C6', 3],
  ['R4C5', 3], ['R5C1', 3], ['R5C9', 5], ['R6C3', 1], ['R6C5', 4],
  ['R6C7', 7], ['R7C4', 2], ['R7C6', 4], ['R8C2', 7], ['R8C8', 1],
  ['R9C3', 3], ['R9C7', 5],
];

// PillArrow(pillSize, ...pillCells, ...armCells): pill cells given
// left-to-right / top-to-bottom per the source rules text.
const pillArrows = [
  new PillArrow(2, 'R2C1', 'R2C2', 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5'),
  new PillArrow(2, 'R2C8', 'R2C9', 'R1C6', 'R1C7', 'R1C8', 'R1C9'),
  new PillArrow(2, 'R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9'),
  new PillArrow(2, 'R8C1', 'R8C2', 'R9C1', 'R9C2', 'R9C3', 'R9C4'),
  new PillArrow(2, 'R8C8', 'R8C9', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'),
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...pillArrows,
];
