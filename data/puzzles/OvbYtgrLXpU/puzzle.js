// Title: A sudoku with only '1' given!
// Author: James Marjamaa
// Video: https://www.youtube.com/watch?v=OvbYtgrLXpU
// Source: https://cracking-the-cryptic.web.app/sudoku/G7hqr49JQ9

// Standard sudoku (9x9, nine 3x3 boxes, both enforced by default). One given:
// R1C1=1. Two variant rules, from the video description:
//   1. Sandwich sums: outside clues give the sum of the digits strictly
//      between the 1 and the 9 in that row/column.
//   2. Prime positions: numbering cells in reading order (R1C1..R1C9 are
//      1-9, R2C1..R2C9 are 10-18, ..., R9C9 is 81), a cell whose position
//      number is prime may only hold a prime digit (2, 3, 5, 7).

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Prime-position cells: position = (row-1)*9 + col, per the rules text.
const isPrime = n => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
};
const primeCells = [];
for (let row = 1; row <= 9; row++) {
  for (let col = 1; col <= 9; col++) {
    if (isPrime((row - 1) * 9 + col)) primeCells.push(makeCellId(row, col));
  }
}

// Sandwich sums, read off the drawn outside-clue overlays: rows R1..R9 down
// the left, columns C1..C9 across the top.
const rowSums = [27, 3, 0, 16, 16, 19, 5, 13, 0];
const colSums = [11, 0, 17, 6, 22, 0, 10, 35, 9];

return [
  new Given('R1C1', 1),

  // Prime digits only in prime-numbered positions.
  ...primeCells.map(cell => new Given(cell, 2, 3, 5, 7)),

  ...rowSums.map((sum, i) =>
    Sandwich.fromCells(sum, graph.row(i + 1), geometry)),
  ...colSums.map((sum, i) =>
    Sandwich.fromCells(sum, graph.column(i + 1), geometry)),
];
