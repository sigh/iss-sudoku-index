// Title: Albert Einstein's Sudoku
// Author: Axel Abrahamsson
// Video: https://www.youtube.com/watch?v=Cg2ZCao7NN4
// Source: https://cracking-the-cryptic.web.app/sudoku/b6LrNhjgGq

// Normal sudoku rules (default rows/cols/boxes, no givens). Outside clues are
// Sandwich clues (sum of the cells between the 1 and the 9 in that row or
// column). A clue printed "<N" gives only an upper bound rather than an exact
// sum; Sandwich only takes an exact value, so each is encoded as an Or over
// every exact sum 0..N-1. Two more clues require the printed years 1879
// (Einstein's birth year) and 1955 (his death year) to each appear somewhere
// in the grid as four cells in a row, read diagonally downwards; the rules
// fix neither the diagonal direction (down-left or down-right) nor the start
// cell, and explicitly allow the two runs to overlap, so each is encoded as
// an Or over every valid diagonal placement in both directions.

const geometry = cellGeometry('9x9');
const rowCells = r => Array.from({ length: 9 }, (_, i) => makeCellId(r, i + 1));
const colCells = c => Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, c));

// Exact sandwich clues, transcribed from the outside-clue overlays.
// Top (column) clues: overlays #0, #11, #1, #2, #12, #13.
// Left (row) clues: overlays #9, #8, #7, #6, #5, #4, #3.
const exactSandwiches = [
  [colCells(1), 10], [colCells(3), 2], [colCells(6), 22], [colCells(7), 22],
  [colCells(8), 25], [colCells(9), 16],
  [rowCells(2), 14], [rowCells(3), 14], [rowCells(5), 4], [rowCells(6), 19],
  [rowCells(7), 18], [rowCells(8), 5], [rowCells(9), 32],
].map(([cells, value]) => Sandwich.fromCells(value, cells, geometry));

// "<N" sandwich clues: overlay #10 (top C2, "<5"), #18 (left R1, "<18"),
// #17 (left R4, "<10"). Sum ranges 0..34 (all digits could sandwich a pair of
// adjacent 1/9), so 0..N-1 always stays in range.
function sandwichBelow(cells, bound) {
  return new Or(Array.from(
    { length: bound }, (_, v) => Sandwich.fromCells(v, cells, geometry)));
}
const boundedSandwiches = [
  sandwichBelow(colCells(2), 5),
  sandwichBelow(rowCells(1), 18),
  sandwichBelow(rowCells(4), 10),
];

// Every length-4 diagonal run in the grid, read top-to-bottom, in both
// diagonal directions (down-right and down-left).
function diagonalRuns() {
  const runs = [];
  for (let r = 1; r <= 6; r++) {
    for (let c = 1; c <= 6; c++) {
      runs.push([0, 1, 2, 3].map(i => makeCellId(r + i, c + i)));
    }
    for (let c = 4; c <= 9; c++) {
      runs.push([0, 1, 2, 3].map(i => makeCellId(r + i, c - i)));
    }
  }
  return runs;
}
const runs = diagonalRuns();
function hiddenNumber(digits) {
  return new Or(runs.map(
    cells => new And(cells.map((cell, i) => new Given(cell, digits[i])))));
}

return [
  new Shape('9x9'),
  ...exactSandwiches,
  ...boundedSandwiches,
  hiddenNumber([1, 8, 7, 9]),
  hiddenNumber([1, 9, 5, 5]),
];
