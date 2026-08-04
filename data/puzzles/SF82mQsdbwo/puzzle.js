// Title: Toasty Jackpot
// Author: Alaric Taqi A. (Crusader175)
// Video: https://www.youtube.com/watch?v=SF82mQsdbwo
// Source: https://app.crackingthecryptic.com/sudoku/7fpRmpM7fT

// Normal sudoku rules apply (default row/column/box groups).
// Outside clues are sandwich sums: digits strictly between the 1 and the 9
// in that row/column add to the given total (Sandwich below).
// Columns 1, 5 and 9 are each self-indexing: a digit in one of those columns
// names the column, in its own row, holding the digit matching its own
// column number -- 1 for column 1, 5 for column 5, 9 for column 9
// (Indexing below, one call per column, scoped to that column's cells).
// The "slot machine": columns 1, 5 and 9, each read top-to-bottom and
// wrapped cyclically, all show the same 9-digit sequence, only possibly
// started at a different point (cyclicMatch below).

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const col1 = graph.column(1);
const col5 = graph.column(5);
const col9 = graph.column(9);

// Sandwich sums (drawn overlays: top of columns 1, 4, 9; left of row 3).
const sandwiches = [
  Sandwich.fromCells(10, col1, geometry),
  Sandwich.fromCells(10, graph.column(4), geometry),
  Sandwich.fromCells(25, col9, geometry),
  Sandwich.fromCells(25, graph.row(3), geometry),
];

// Column self-indexing. Indexing('C', ...cells) applies once per listed
// cell: for control cell (R,C) holding value V, it forces cell (R,V) to
// hold C. Passing only one column's cells per call scopes the rule to that
// column, matching the rules' worked example (R7C1=6 => R7C6=1, i.e. C=1).
const indexing = [
  new Indexing('C', ...col1),
  new Indexing('C', ...col5),
  new Indexing('C', ...col9),
];

// Slot machine: colA read top-to-bottom must equal colB read top-to-bottom
// for SOME cyclic rotation k (colA[r] == colB[(r+k) mod 9] for every row r).
// Built as Or over the 9 candidate rotations, each an And of 9 cell-equality
// constraints (one per row); SameValues(2, a, b) forces two single cells
// equal (the catalog's "clone cells" idiom). Matching col1 against both col5
// and col9 is enough: rotation is transitive (composing two rotations of the
// same base column yields a rotation between the other two), so col5 and
// col9 are automatically related without a third Or.
const cyclicMatch = (colA, colB) => new Or(
  Array.from({ length: 9 }, (_, k) => new And(
    colA.map((cell, r) => new SameValues(2, cell, colB[(r + k) % 9]))
  ))
);

const slotMachine = [
  cyclicMatch(col1, col5),
  cyclicMatch(col1, col9),
];

return [
  new Shape('9x9'),
  ...sandwiches,
  ...indexing,
  ...slotMachine,
];
