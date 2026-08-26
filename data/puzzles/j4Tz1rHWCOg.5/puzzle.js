// Title: Substitution
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=j4Tz1rHWCOg
// Source: https://tinyurl.com/bddj565n

// Normal Sudoku rules apply (rows, columns, boxes). Outside clues are
// standard X-Sums: reading into the row/column from the clue's side, the
// first digit seen is X, and the sum of the first X digits (that first
// digit included) equals the printed clue -- the native XSum class.
// XSum.fromCells takes the clue value and the row/column cells ordered
// nearest-to-farthest from the clue's side.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');
const reversed = cells => cells.slice().reverse();

// Row clues, transcribed from the left- and right-side outside badges.
const leftClues = { 1: 1, 2: 42, 3: 6, 4: 35, 5: 15, 7: 28, 8: 9, 9: 45 };
const rightClues = { 1: 44, 2: 3, 3: 39, 4: 10, 6: 21, 7: 17, 8: 36 };
// Column clues, transcribed from the top- and bottom-side outside badges.
const topClues = { 4: 6 };
const bottomClues = { 6: 6 };

const xsums = [
  ...Object.entries(leftClues).map(([row, value]) =>
    XSum.fromCells(value, graph.row(+row), geometry)),
  ...Object.entries(rightClues).map(([row, value]) =>
    XSum.fromCells(value, reversed(graph.row(+row)), geometry)),
  ...Object.entries(topClues).map(([col, value]) =>
    XSum.fromCells(value, graph.column(+col), geometry)),
  ...Object.entries(bottomClues).map(([col, value]) =>
    XSum.fromCells(value, reversed(graph.column(+col)), geometry)),
];

return [
  new Shape('9x9'),

  new Given('R2C5', 9),
  new Given('R3C3', 8),
  new Given('R3C7', 5),
  new Given('R5C2', 1),
  new Given('R5C5', 2),
  new Given('R5C8', 6),
  new Given('R7C3', 7),
  new Given('R7C7', 3),
  new Given('R8C5', 4),

  ...xsums,
];
