// Title: Rossini Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=ojOATs9SDgY
// Source: https://tinyurl.com/52264n43

// Normal sudoku. Rossini: an arrow outside a row/column shows the direction in
// which the three nearest digits in that row/column strictly increase. All
// possible arrows are given, so every row/column end without an arrow means
// the three nearest digits from that end are not strictly monotonic (neither
// all increasing nor all decreasing read from that side).
//
// This puzzle's payload carries no arrow geometry at all -- every one of the
// 36 row/column ends is a "no arrow" end, so every nearest-three-cell triple
// is non-monotonic. No arrows are drawn, so there is nothing to place a
// GreaterThan chain on.

const givens = [
  ['R1C3', 1],
  ['R1C8', 2],
  ['R2C6', 4],
  ['R2C8', 5],
  ['R3C1', 3],
  ['R3C3', 8],
  ['R3C4', 9],
  ['R3C6', 1],
  ['R3C9', 6],
  ['R4C1', 1],
  ['R4C7', 5],
  ['R5C2', 7],
  ['R5C8', 1],
  ['R6C3', 3],
  ['R6C9', 2],
  ['R7C1', 2],
  ['R7C4', 5],
  ['R7C6', 8],
  ['R7C7', 9],
  ['R7C9', 4],
  ['R8C2', 4],
  ['R8C4', 6],
  ['R9C2', 3],
  ['R9C7', 2],
];

function rowTriples(r) {
  return [
    [makeCellId(r, 1), makeCellId(r, 2), makeCellId(r, 3)],
    [makeCellId(r, 9), makeCellId(r, 8), makeCellId(r, 7)],
  ];
}

function colTriples(c) {
  return [
    [makeCellId(1, c), makeCellId(2, c), makeCellId(3, c)],
    [makeCellId(9, c), makeCellId(8, c), makeCellId(7, c)],
  ];
}

// All 36 row/column ends (2 per row x 9 rows, 2 per column x 9 columns) have
// no drawn arrow, so every triple is non-monotonic.
const noArrows = [
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9].flatMap(rowTriples),
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9].flatMap(colTriples),
];

// A triple is non-monotonic when its middle cell is a strict local peak or a
// strict local valley relative to its two neighbours.
function notMonotonic([a, b, c]) {
  return new Or([
    new And([
      new GreaterThan(b, a),
      new GreaterThan(b, c),
    ]),
    new And([
      new GreaterThan(a, b),
      new GreaterThan(c, b),
    ]),
  ]);
}

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...noArrows.map(notMonotonic),
];
