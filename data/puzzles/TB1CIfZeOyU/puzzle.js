// Title: No, the other side
// Author: Scott Strosahl
// Video: https://www.youtube.com/watch?v=TB1CIfZeOyU
// Source: https://sudokupad.app/znt0i5zouc

// Normal sudoku rules apply. No given digits.
// Opposite X-Sums: each clue outside the grid gives the sum of the last N
// digits in its row/column (the N digits furthest from the clue), where N is
// the first digit in that row/column read from the clue side.

const graph = cellGraph('9x9');

const row = r => graph.row(r);
const col = c => graph.column(c);

function oppositeXSum(clue, cells) {
  return new Or(Array.from({ length: 9 }, (_, i) => i + 1).map(n => new And([
    new Given(cells[0], n),
    new Sum(clue, ...cells.slice(9 - n)),
  ])));
}

const clues = [
  [30, row(1)],
  [21, row(4)],
  [14, row(6)],
  [24, row(8)],
  [17, row(2).reverse()],
  [31, row(3).reverse()],
  [20, row(4).reverse()],
  [16, row(6).reverse()],
  [33, row(9).reverse()],
  [12, col(2)],
  [15, col(4)],
  [19, col(6)],
  [37, col(9)],
  [19, col(4).reverse()],
  [22, col(6).reverse()],
  [27, col(8).reverse()],
];

return [
  new Shape('9x9'),
  ...clues.map(([clue, cells]) => oppositeXSum(clue, cells)),
];
