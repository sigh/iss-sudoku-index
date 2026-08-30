// Title: IQ Boosting With Sandwich Sudoku
// Author: Axel Abrahamson
// Video: https://www.youtube.com/watch?v=KxR6QCu6kuA
// Source: https://cracking-the-cryptic.web.app/sudoku/FGhhD2HBnF

// Normal sudoku rules apply (rows, columns and 3x3 boxes each 1-9 once).
// Sandwich clues outside the grid give the sum of the digits between the 1
// and the 9 in that row/column. The grey shape is a palindrome: digits
// equidistant from the two ends are equal.

const givens = [
  ['R9C4', 8], ['R9C5', 9], ['R9C6', 2],
];

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// Sandwich clue totals, from the outside overlay text, addressed by the
// row/column of cells the clue lane runs over (Sandwich.fromCells derives
// the canonical corner/direction from the cells themselves).
const rowSandwiches = [
  [2, 24], [4, 12], [5, 5], [6, 23], [7, 17], [8, 19], [9, 13],
].map(([row, v]) => Sandwich.fromCells(v, graph.row(row), geometry));
const colSandwiches = [
  [1, 24], [3, 22], [4, 0], [6, 28], [7, 7], [9, 29],
].map(([col, v]) => Sandwich.fromCells(v, graph.column(col), geometry));

// Palindrome ("grey shape"): 11 connected cells forming a single unbranched
// path (verified: each cell has exactly the two neighbours implied by this
// order, no other adjacency among the 11 cells), read from one end to the
// other.
const palindromeCells = [
  'R7C5', 'R6C5', 'R5C6', 'R4C7', 'R3C7', 'R2C7', 'R1C6', 'R1C5', 'R1C4', 'R2C3', 'R3C3',
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, v]) => new Given(cell, v)),
  ...rowSandwiches,
  ...colSandwiches,
  new Palindrome(...palindromeCells),
];
