// Title: August 30, 2021: To Me, My...
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=O1vAKJyVvG0
// Source: https://tinyurl.com/52fyfva3

// Normal sudoku rules apply. Every clue is an X-Sum: the sum of the first X
// digits in the row/column, starting at the digit adjacent to the clue and
// continuing away from it, equals the clue, where X is that adjacent digit
// itself. This is exactly ISS's built-in `XSum` semantics ("X is the number
// in the first cell in the direction of the row or column").
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Row clues (left/right of grid), transcribed from the puzzle's outside-clue
// text overlay. 'L' clues read rightward starting at column 1; 'R' clues
// read leftward starting at column 9.
const rowClues = [
  [1, 'L', 3], [1, 'R', 42],
  [3, 'L', 40], [3, 'R', 5],
  [4, 'L', 6], [4, 'R', 39],
  [6, 'L', 36], [6, 'R', 9],
  [7, 'L', 10], [7, 'R', 35],
  [9, 'L', 31], [9, 'R', 14],
];

// Column clues (above/below grid), transcribed from the puzzle's outside-clue
// text overlay. 'T' clues read downward starting at row 1; 'B' clues read
// upward starting at row 9.
const colClues = [
  [3, 'T', 14],
  [5, 'T', 20], [5, 'B', 25],
  [7, 'B', 30],
];

const rowXSums = rowClues.map(([row, side, value]) => {
  const startCell = side === 'L' ? makeCellId(row, 1) : makeCellId(row, 9);
  const dCol = side === 'L' ? 1 : -1;
  return XSum.fromCells(value, graph.ray(startCell, 0, dCol), geometry);
});

const colXSums = colClues.map(([col, side, value]) => {
  const startCell = side === 'T' ? makeCellId(1, col) : makeCellId(9, col);
  const dRow = side === 'T' ? 1 : -1;
  return XSum.fromCells(value, graph.ray(startCell, dRow, 0), geometry);
});

return [
  new Shape('9x9'),
  ...rowXSums,
  ...colXSums,
];
