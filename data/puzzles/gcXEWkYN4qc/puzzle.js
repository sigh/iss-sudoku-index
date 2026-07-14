// Title: Split Ends
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=gcXEWkYN4qc
// Source: https://sudokupad.app/pbe8o0wy1e

// Normal sudoku, no givens. Each blonde line is confined to one row; its
// digits sum to a two-digit number formed, in either order, by the digits
// at that row's own start (column 1) and end (column 9) cells. Each
// brunette line is confined to one column; its digits sum to a two-digit
// number formed, in either order, by the digits at that column's own top
// (row 1) and bottom (row 9) cells. A row/column may carry more than one
// line segment; segments sharing a row/column also share the same end-cell
// pair. Encoded as sum(line cells) - 10*end1 - end2 == 0, ORed with the
// swapped-coefficient version for the other digit order.

const rowLine = (row, colFrom, colTo) => {
  const cells = [];
  for (let c = colFrom; c <= colTo; c++) cells.push(makeCellId(row, c));
  return { cells, end1: makeCellId(row, 1), end2: makeCellId(row, 9) };
};

const colLine = (col, rowFrom, rowTo) => {
  const cells = [];
  for (let r = rowFrom; r <= rowTo; r++) cells.push(makeCellId(r, col));
  return { cells, end1: makeCellId(1, col), end2: makeCellId(9, col) };
};

// Blonde (horizontal) lines, one entry per drawn row segment.
const blondeLines = [
  rowLine(2, 2, 6),
  rowLine(3, 4, 9),
  rowLine(4, 2, 5),
  rowLine(4, 6, 8),
  rowLine(5, 2, 3),
  rowLine(5, 4, 5),
  rowLine(6, 2, 8),
  rowLine(8, 1, 9),
  rowLine(9, 3, 8),
];

// Brunette (vertical) lines, one entry per drawn column segment.
const brunetteLines = [
  colLine(1, 2, 7),
  colLine(3, 5, 9),
  colLine(4, 2, 3),
  colLine(4, 5, 6),
  colLine(4, 7, 8),
  colLine(7, 2, 3),
  colLine(7, 5, 6),
  colLine(7, 7, 8),
  colLine(5, 1, 9),
];

// A line's digit sum must equal 10*end1 + end2, or 10*end2 + end1.
const twoDigitLine = ({ cells, end1, end2 }) => new Or([
  new Sum(0, ...cells, [end1, -10], [end2, -1]),
  new Sum(0, ...cells, [end1, -1], [end2, -10]),
]);

return [
  new Shape('9x9'),
  ...blondeLines.map(twoDigitLine),
  ...brunetteLines.map(twoDigitLine),
];
