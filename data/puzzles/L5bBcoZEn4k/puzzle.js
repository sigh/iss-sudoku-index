// Title: Sum Odd Sandwiches (SOS)
// Author: Jodawo
// Video: https://www.youtube.com/watch?v=L5bBcoZEn4k
// Source: https://sudokupad.app/3kcwwu5uq1

// Standard sudoku (9x9, 3x3 boxes -- the payload's `regions` are exactly the
// default box tiling). Every number outside the grid is simultaneously a
// Sandwich clue (sum of the digits strictly between the 1 and the 9 in that
// row/column) and an X-Sum clue (sum of the first X cells counted from that
// clue, X = the nearest cell's own digit) -- both readings share the one
// printed value, per rules text: "Numbers outside the grid are both
// Sandwich Clues and X-Sum Clues." Shaded circles mark cells holding an odd
// digit.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Outside clues: [value, cells in clue-reading order]. All six clues sit on
// the top or left of the grid (Sandwich's only supported sides), reading
// toward the far edge -- row(n)/column(n) already return cells in that
// order. Provenance: overlay pairs (each value drawn twice, once per clue
// type sharing the same position) at R1 west=10, C1 north=16, C5 north=8,
// C9 north=14, R5 west=20, R9 west=6.
const outsideClues = [
  [10, graph.row(1)],
  [16, graph.column(1)],
  [8, graph.column(5)],
  [14, graph.column(9)],
  [20, graph.row(5)],
  [6, graph.row(9)],
];
const sandwiches = outsideClues.map(([value, cells]) =>
  Sandwich.fromCells(value, cells, geometry));
const xsums = outsideClues.map(([value, cells]) =>
  XSum.fromCells(value, cells, geometry));

// Shaded circles -> odd-digit candidate restriction (no dedicated Odd
// class; ISS's documented equivalent is a multi-value Given). Provenance:
// underlay circles at R3C3, R6C7, R9C4.
const oddGivens = ['R3C3', 'R6C7', 'R9C4'].map(cell =>
  new Given(cell, 1, 3, 5, 7, 9));

return [
  new Shape('9x9'),
  ...sandwiches,
  ...xsums,
  ...oddGivens,
];
