// Title: Whispering Fives
// Author: M.K.
// Video: https://www.youtube.com/watch?v=konQKbnvhoQ
// Source: https://sudokupad.app/wdb9oj31j6

// Every row, column and 2x5 box (2 columns wide, 5 rows tall) contains 0-9
// once each.
//
// Killer cages: digits in a cage sum to the small number in its corner.
//
// A green line: adjacent digits differ by at least 5. The cage at the top of
// the line starts it from its left cell. The cage's two digits, read as a
// two-digit number (left digit tens, right digit units - zero tens allowed),
// equal the sum of the digits on the line.

const graph = cellGraph('10x10');

// Cell ids are written as [row, col] (1-indexed) and converted with
// makeCellId, since row/col 10 is not the literal substring "10" in ISS's
// cell-id alphabet.
const cid = (row, col) => makeCellId(row, col);

// -- Regions: 2-column x 5-row boxes -------------------------------------
const boxCells = [];
for (const band of [0, 5]) {
  for (let p = 0; p < 5; p++) {
    boxCells.push(graph.block(cid(band + 1, 2 * p + 1), 5, 2));
  }
}

return [
  new Shape('10x10', '0-9'),
  new NoBoxes(),
  ...boxCells.map(cells => new AllDifferent(...cells)),

  // Givens.
  new Given(cid(1, 1), 1),
  new Given(cid(1, 10), 0),
  new Given(cid(2, 3), 7),
  new Given(cid(3, 5), 1),
  new Given(cid(4, 7), 0),
  new Given(cid(7, 1), 0),
  new Given(cid(7, 6), 9),
  new Given(cid(8, 3), 9),
  new Given(cid(10, 10), 1),

  // Killer cages with a given corner sum.
  new Cage(5, cid(9, 1), cid(9, 2)),
  new Cage(5, cid(8, 8), cid(8, 9)),
  new Cage(5, cid(4, 9), cid(4, 10)),

  // The one green whisper line: starts at the cage's left cell (R5C6) and
  // runs down to R6C6. Adjacent line digits differ by at least 5.
  new Whisper(5, cid(5, 6), cid(6, 6)),
  // The cage's two digits (R5C6 tens, R5C7 units) equal the line's digit sum
  // (R5C6 + R6C6): 9*R5C6 + R5C7 - R6C6 = 0.
  new Sum(0, [cid(5, 6), 9], cid(5, 7), [cid(6, 6), -1]),
];
