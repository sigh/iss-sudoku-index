// Title: The Cube
// Author: Marvin Kannhauser
// Video: https://www.youtube.com/watch?v=IWRhLjITgQM
// Source: https://app.crackingthecryptic.com/sudoku/m7mqTjNQb4

// Normal sudoku rules apply (default 9x9 rows/cols/boxes).
//
// White circles: each printed digit must appear in at least one of the four
// cells touching the circle (Quad semantics match the rules text exactly).
//
// Grey cell (R6C6, drawn underlay) must be greater than each of its four
// orthogonal neighbours.
//
// The drawn purple stroke traces a classic 2D cube projection: a hexagon
// outline (R2C2-R2C6-R4C8-R8C8-R8C4-R6C2-R2C2) plus three spokes from the
// centre point R4C4 to the alternating hexagon vertices R2C2, R4C8 and R8C4
// -- 9 straight "edges" in all, each a run of grid cells between two
// vertices (vertex cells are shared between the edges that meet there).
// Every edge's digits sum to the same two-digit number N, whose tens and
// units digits are also written directly into each of the 3 two-cell cages
// (top cell = tens, bottom cell = units); the rules state the 3 cages are
// filled identically, so all three are tied together and edges are summed
// against one of them.

const edges = [
  ['R2C2', 'R3C3', 'R4C4'],
  ['R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8'],
  ['R4C4', 'R5C4', 'R6C4', 'R7C4', 'R8C4'],
  ['R4C8', 'R3C7', 'R2C6'],
  ['R2C6', 'R2C5', 'R2C4', 'R2C3', 'R2C2'],
  ['R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2'],
  ['R6C2', 'R7C3', 'R8C4'],
  ['R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8'],
  ['R8C8', 'R7C8', 'R6C8', 'R5C8', 'R4C8'],
];

// Cage provenance: the 3 drawn two-cell cages, top-to-bottom cell order.
const cage1 = ['R2C9', 'R3C9'];
const cage2 = ['R4C7', 'R5C7'];
const cage3 = ['R8C6', 'R9C6'];
const [tens, ones] = cage1;

// Quads: each drawn circle's 2x2 touching square, anchored at its
// top-left cell.
const quads = [
  ['R2C3', 3, 4, 8],
  ['R2C5', 1, 7],
  ['R3C6', 2, 3, 9],
  ['R3C4', 4, 7],
  ['R3C2', 1, 2, 8],
  ['R4C3', 2, 7],
  ['R4C4', 2, 4, 7],
  ['R5C2', 5, 7],
  ['R6C3', 1, 3, 6],
  ['R7C4', 3, 7, 8],
  ['R7C7', 1, 2, 3],
  ['R4C7', 2, 5, 7],
];

return [
  new Shape('9x9'),

  new GreaterThan('R6C6', 'R5C6', 'R6C7', 'R7C6', 'R6C5'),

  ...quads.map(([cell, ...values]) => new Quad(cell, ...values)),

  // No printed total: each pair is still a real cage (all-different only).
  new AllDifferent(...cage1),
  new AllDifferent(...cage2),
  new AllDifferent(...cage3),

  // "All three cages filled identically": tie tens digits together and
  // units digits together.
  new SameValues(3, cage1[0], cage2[0], cage3[0]),
  new SameValues(3, cage1[1], cage2[1], cage3[1]),

  // Every cube edge's digit sum equals the two-digit number in cage1
  // (10*tens + ones); the SameValues above ties cage2/cage3 to it too.
  ...edges.map(
    (cells) => new Sum(0, ...cells, [tens, -10], [ones, -1])
  ),
];
