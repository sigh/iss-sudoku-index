// Title: August 10, 2021: X-Sums
// Author: clover!
// Video: https://www.youtube.com/watch?v=i3JiNbn1t_Q
// Source: https://tinyurl.com/ymmeadmb

// Normal sudoku rules apply. Every outside clue sums the first X digits of its
// row/column counted from the side the clue is printed on, where X is the
// digit in the first (nearest) cell of that run (X itself included). This is
// the ISS `XSum` semantics exactly, per the ruleset's own worked example.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

const givens = [
  new Given('R2C3', 8),
  new Given('R2C7', 6),
  new Given('R3C2', 2),
  new Given('R3C8', 9),
  new Given('R7C2', 6),
  new Given('R7C8', 7),
  new Given('R8C3', 5),
  new Given('R8C7', 3),
];

// Row X-Sums. Cell order encodes the reading direction named in the ruleset
// ("start summing from the direction in which the outside clue appears"):
// a left-side clue reads C1->C9, a right-side clue reverses that row.
const rowXSums = [
  XSum.fromCells(10, graph.row(1), geometry), // left
  XSum.fromCells(42, graph.row(4), geometry), // left
  XSum.fromCells(6, graph.row(4).slice().reverse(), geometry), // right
  XSum.fromCells(15, graph.row(6), geometry), // left
  XSum.fromCells(36, graph.row(6).slice().reverse(), geometry), // right
  XSum.fromCells(45, graph.row(8).slice().reverse(), geometry), // right
  XSum.fromCells(20, graph.row(9), geometry), // left
];

// Column X-Sums, same convention: a top clue reads R1->R9, a bottom clue
// reverses that column.
const colXSums = [
  XSum.fromCells(28, graph.column(1), geometry), // top
  XSum.fromCells(9, graph.column(4), geometry), // top
  XSum.fromCells(24, graph.column(4).slice().reverse(), geometry), // bottom
  XSum.fromCells(39, graph.column(6), geometry), // top
  XSum.fromCells(3, graph.column(6).slice().reverse(), geometry), // bottom
  XSum.fromCells(15, graph.column(9), geometry), // top
];

return [
  new Shape('9x9'),
  ...givens,
  ...rowXSums,
  ...colXSums,
];
