// Title: Magic Sandwich Sudoku
// Author: Caleb Siegel
// Video: https://www.youtube.com/watch?v=FGdW5TWieyo
// Source: https://app.crackingthecryptic.com/webapp/t9DqTQqbL4

// Normal sudoku rules apply (default 9x9 shape and boxes, used as-is: the
// payload's regions are the standard 3x3 boxes).
//
// The central 3x3 box (R4-6,C4-6, shaded grey in the payload) is a magic
// square: its rows, columns, and both diagonals share a common sum.
// EqualSum over those 8 segments states that directly; the box's own
// all-different (from the default box constraint) then forces the shared
// sum to 15 by itself, so no separate total is asserted.
//
// Each outside clue gives the sum of the digits strictly between the 1 and
// the 9 in that row/column -- exactly Sandwich's semantics. Every clue reads
// the same value whether taken nearest-grid-first or as printed left-to-right
// / top-to-bottom, so there is no lane-direction ambiguity to resolve.

const magicRows = [
  ['R4C4', 'R4C5', 'R4C6'],
  ['R5C4', 'R5C5', 'R5C6'],
  ['R6C4', 'R6C5', 'R6C6'],
];
const magicCols = [
  ['R4C4', 'R5C4', 'R6C4'],
  ['R4C5', 'R5C5', 'R6C5'],
  ['R4C6', 'R5C6', 'R6C6'],
];
const magicDiagonals = [
  ['R4C4', 'R5C5', 'R6C6'],
  ['R4C6', 'R5C5', 'R6C4'],
];

// Sandwich sums, given as [row-or-col cell list, value] pairs read straight
// off the outside-clue lanes (left-of-row, above-column). fromCells derives
// the canonical arrowId from the cell list itself.
const geo = cellGeometry('9x9');
const rowCells = n => Array.from({ length: 9 }, (_, i) => makeCellId(n, i + 1));
const colCells = n => Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, n));
const sandwichClues = [
  [rowCells(1), 0], [rowCells(2), 10], [rowCells(3), 15], [rowCells(4), 15],
  [rowCells(5), 0], [rowCells(6), 14], [rowCells(7), 0], [rowCells(8), 9],
  [rowCells(9), 32],
  [colCells(1), 35], [colCells(2), 9], [colCells(3), 12], [colCells(4), 0],
  [colCells(5), 5], [colCells(6), 0], [colCells(7), 21], [colCells(8), 22],
  [colCells(9), 8],
];

return [
  new Shape('9x9'),

  // Givens, from the payload's cells array.
  new Given('R2C1', 7),
  new Given('R2C8', 5),
  new Given('R8C7', 4),
  new Given('R9C1', 9),

  // Magic square: center box rows/cols/diagonals share a sum.
  new EqualSum(...magicRows, ...magicCols, ...magicDiagonals),

  // Sandwich sums.
  ...sandwichClues.map(([cells, value]) => Sandwich.fromCells(value, cells, geo)),
];
