// Title: Frame vs X-Sum
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=bDHxgF8Ipes
// Source: https://cracking-the-cryptic.web.app/sudoku/QRbd2nfhr9

// Normal sudoku rules apply (no givens). Every one of the 20 outside clues
// is either a Frame clue or an X-Sums clue, or both (an inclusive either/or):
//   Frame:  the clue is the sum of the first three digits of the row/column.
//   X-Sums: the clue is the sum of the first X digits of the row/column,
//           where X is the value of the first digit itself.
// "First" always means starting from the cell nearest the printed clue.
// Encoded as Or(Frame-reading, XSum-reading) per clue -- the built-in XSum
// class already implements the X-Sums semantics (control cell = X, sum of
// the first X cells of the line = the clue).

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Clue values, transcribed from the drawn overlays outside the grid.
const TOP = { 1: 23, 3: 21, 5: 20, 7: 23, 9: 21 }; // read downward
const BOTTOM = { 1: 22, 3: 24, 5: 22, 7: 20, 9: 23 }; // read upward
const LEFT = { 1: 23, 3: 21, 5: 21, 7: 24, 9: 21 }; // read rightward
const RIGHT = { 1: 22, 3: 24, 5: 20, 7: 20, 9: 22 }; // read leftward

const clues = [
  ...Object.entries(TOP).map(([col, value]) => (
    { cells: graph.ray(makeCellId(1, +col), 1, 0), value })),
  ...Object.entries(BOTTOM).map(([col, value]) => (
    { cells: graph.ray(makeCellId(9, +col), -1, 0), value })),
  ...Object.entries(LEFT).map(([row, value]) => (
    { cells: graph.ray(makeCellId(+row, 1), 0, 1), value })),
  ...Object.entries(RIGHT).map(([row, value]) => (
    { cells: graph.ray(makeCellId(+row, 9), 0, -1), value })),
];

return [
  new Shape('9x9'),
  ...clues.map(({ cells, value }) => new Or([
    new Sum(value, ...cells.slice(0, 3)),
    XSum.fromCells(value, cells, geometry),
  ])),
];
