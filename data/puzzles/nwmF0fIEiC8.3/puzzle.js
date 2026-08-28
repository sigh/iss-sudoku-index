// Title: Oct 2, 2021: Neighbours
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=nwmF0fIEiC8
// Source: https://tinyurl.com/4ks6fntt

// Rules: Normal Sudoku rules apply (default row/column/box AllDifferent).
// A margin label outside a row or column names two digits, printed in an
// order; those two digits must appear as a directly-adjacent pair, in that
// printed order, somewhere in that row/column (position otherwise free).
// The label's near-edge digit is read first: a left-margin row label reads
// left-to-right into the grid, a top-margin column label reads top-to-bottom.
// Each pair is encoded as a Regex over the line's 9 digits: a literal
// two-digit run for the ordered pair, with '.' wildcards for the rest of the
// line so the pair may sit at any position.

const graph = cellGraph('9x9');

// Givens, transcribed from the drawn grid.
const givens = [
  new Given('R2C4', 1), new Given('R2C6', 2),
  new Given('R4C2', 4), new Given('R4C5', 5), new Given('R4C8', 6),
  new Given('R5C4', 3), new Given('R5C6', 4),
  new Given('R6C2', 7), new Given('R6C5', 8), new Given('R6C8', 9),
  new Given('R8C4', 5), new Given('R8C6', 6),
];

// Row-margin "Neighbours" clues, transcribed from the drawn margin labels.
// [row, firstDigit, secondDigit], first digit nearer the left edge.
const rowClues = [
  [1, 3, 1],
  [2, 6, 9],
  [4, 1, 2],
  [6, 1, 2],
  [8, 4, 7],
  [9, 7, 8],
];

// Column-margin "Neighbours" clues, transcribed from the drawn margin labels.
// [col, firstDigit, secondDigit], first digit nearer the top edge.
const colClues = [
  [2, 8, 9],
  [4, 6, 8],
  [6, 5, 9],
  [8, 8, 7],
];

const neighbourPattern = (a, b) => `.*${a}${b}.*`;

const rowNeighbours = rowClues.map(([row, a, b]) =>
  new Regex(neighbourPattern(a, b), ...graph.row(row)));

const colNeighbours = colClues.map(([col, a, b]) =>
  new Regex(neighbourPattern(a, b), ...graph.column(col)));

return [
  new Shape('9x9'),
  ...givens,
  ...rowNeighbours,
  ...colNeighbours,
];
