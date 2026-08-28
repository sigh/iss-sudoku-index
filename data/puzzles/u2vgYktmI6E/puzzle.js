// Title: X-Sums or Sandwich Sudoku
// Author: Bl00dw0lf
// Video: https://www.youtube.com/watch?v=u2vgYktmI6E
// Source: https://cracking-the-cryptic.web.app/sudoku/QbGnr6P2h3

// Standard sudoku: every row, column and marked 3x3 box holds 1-9 once, no
// givens. Outside-grid clues are per-lane either a Sandwich (sum of digits
// strictly between the 1 and the 9) or an X-Sum (sum of the first X digits,
// X = the first digit, read from that clue's side). The source draws both
// kinds identically (plain white boxed numbers) -- nothing marks which is
// which -- so an undetermined lane is encoded as Or() over both readings,
// per rows/columns-with-two-clues meaning one of each kind.
//
// Four clues are pinned without solving this puzzle: brute-force enumeration
// over every permutation of 1-9 shows no lane can ever produce an X-Sum total
// of 0, 2 or 4, or a Sandwich total of 1. Those four lanes are encoded
// directly instead of disjunctively.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Outside-clue lane cell lists, nearest-clue-first (required for XSum's
// "first X digits from that direction" reading; harmless for Sandwich, which
// is order-independent). Clue values transcribed from the source's outside
// overlay text.
const topCol = (col) => graph.column(col);
const bottomCol = (col) => graph.column(col).slice().reverse();
const leftRow = (row) => graph.row(row);
const rightRow = (row) => graph.row(row).slice().reverse();

// A single undetermined clue: either reading is live.
function eitherReading(value, cells) {
  return new Or([
    Sandwich.fromCells(value, cells, geometry),
    XSum.fromCells(value, cells, geometry),
  ]);
}

// A lane with clues on both ends: exactly one end is a Sandwich and the
// other an X-Sum, but which end is which is undetermined.
function pairedLane(nearValue, nearCells, farValue, farCells) {
  return new Or([
    new And([
      Sandwich.fromCells(nearValue, nearCells, geometry),
      XSum.fromCells(farValue, farCells, geometry),
    ]),
    new And([
      XSum.fromCells(nearValue, nearCells, geometry),
      Sandwich.fromCells(farValue, farCells, geometry),
    ]),
  ]);
}

return [
  new Shape('9x9'),

  // Forced by arithmetic (see header comment): 4 and 2 are impossible X-Sum
  // totals, so their lane partners take the X-Sum reading; 0 is impossible
  // as an X-Sum and 1 is impossible as a Sandwich.
  Sandwich.fromCells(4, topCol(1), geometry),
  XSum.fromCells(1, bottomCol(1), geometry),
  XSum.fromCells(29, topCol(2), geometry),
  Sandwich.fromCells(2, bottomCol(2), geometry),
  XSum.fromCells(25, leftRow(3), geometry),
  Sandwich.fromCells(0, rightRow(3), geometry),
  Sandwich.fromCells(2, leftRow(6), geometry),

  // Undetermined two-clue lanes.
  pairedLane(3, topCol(4), 3, bottomCol(4)),
  pairedLane(13, topCol(6), 16, bottomCol(6)),
  pairedLane(3, topCol(7), 3, bottomCol(7)),
  pairedLane(6, leftRow(4), 21, rightRow(4)),
  pairedLane(35, leftRow(5), 29, rightRow(5)),
  pairedLane(10, leftRow(8), 18, rightRow(8)),

  // Undetermined single-clue lanes.
  eitherReading(35, topCol(5)),
  eitherReading(13, rightRow(1)),
];
