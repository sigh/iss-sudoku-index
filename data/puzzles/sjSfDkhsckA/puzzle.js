// Title: Untitled
// Author: Alice
// Video: https://www.youtube.com/watch?v=sjSfDkhsckA
// Source: https://cracking-the-cryptic.web.app/sudoku/n89nTn7Bpt

// Standard 9x9 sudoku (rows, columns and the nine 3x3 boxes all-different,
// from the default Shape). Every cell must have at least one orthogonal
// neighbour whose digit differs from its own by exactly 1 -- for each cell,
// an Or of WhiteDot (Kropki white: differ-by-1) against every orthogonal
// neighbour. Twelve grid edges additionally carry a plain inequality-arrow
// overlay (drawn as `>`, `<`, `^` or `v`), read only as a bigger/smaller
// direction (no forced margin): the arrow's "pointy" end names the smaller
// side. Each is one GreaterThan(bigger, smaller) pair. The consecutive-
// neighbour rule and the arrows are independent -- an arrow is not itself
// claimed to be the cell's witness for the first rule, and the arrows are a
// drawn subset, not a claim that every consecutive pair in the grid is
// marked.

const graph = cellGraph('9x9');

const givens = [
  new Given('R1C3', 7), new Given('R1C5', 2),
  new Given('R2C2', 1), new Given('R2C8', 3),
  new Given('R3C6', 5), new Given('R3C9', 7),
  new Given('R4C3', 1),
  new Given('R5C1', 8), new Given('R5C5', 9), new Given('R5C9', 4),
  new Given('R6C7', 6),
  new Given('R7C1', 3), new Given('R7C4', 2),
  new Given('R8C2', 7), new Given('R8C8', 5),
  new Given('R9C5', 6), new Given('R9C7', 3),
];

// "each cell must be orthogonally adjacent to a number greater or lower by 1":
// an existential, not a per-edge marking -- every cell needs >=1 orthogonal
// neighbour whose digit is exactly 1 away, whether or not that edge carries
// one of the twelve drawn arrows below.
const consecutiveNeighbour = graph.cells().map(
  cell => new Or(graph.neighbours(cell).map(n => new WhiteDot(cell, n))));

// Directed arrows. Cell order in each pair is (first, second) reading order
// (row-major); the drawn glyph's "pointy" end names the smaller side:
//  - '>' and 'v' point at the second-listed cell (right / below) -> first is
//    bigger.
//  - '<' and '^' point at the first-listed cell (left / above) -> second is
//    bigger.
// A reading that also forces these pairs to differ by exactly 1 puts two
// same-box cells (e.g. R2C6 and R3C5, both pinned to R2C5 minus 1) at the
// same value -- unsatisfiable on its own, with no givens needed -- so only
// direction is encoded here.

// '>' / 'v' edges: first cell is bigger.
const firstBiggerEdges = [
  ['R3C2', 'R3C3'], ['R5C2', 'R5C3'], ['R2C5', 'R2C6'],
  ['R2C5', 'R3C5'], ['R2C7', 'R3C7'], ['R5C1', 'R6C1'],
];
// '<' / '^' edges: second cell is bigger.
const secondBiggerEdges = [
  ['R8C4', 'R8C5'], ['R5C7', 'R5C8'], ['R7C7', 'R7C8'],
  ['R7C3', 'R8C3'], ['R7C5', 'R8C5'], ['R4C9', 'R5C9'],
];
const arrows = [
  ...firstBiggerEdges.map(([a, b]) => new GreaterThan(a, b)),
  ...secondBiggerEdges.map(([a, b]) => new GreaterThan(b, a)),
];

return [
  new Shape('9x9'),
  ...givens,
  ...consecutiveNeighbour,
  ...arrows,
];
