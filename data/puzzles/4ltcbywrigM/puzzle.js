// Title: Whispers in the mist
// Author: pdyxs
// Video: https://www.youtube.com/watch?v=4ltcbywrigM
// Source: https://sudokupad.app/usquoo8ao3

// Rules encoded here:
//  - Normal 9x9 sudoku.
//  - Yin Yang: every cell is shaded or unshaded; all shaded cells form one
//    orthogonally connected group, all unshaded cells form one orthogonally
//    connected group, and no 2x2 region is entirely one shade.
//  - Unshaded Whispers: two orthogonally adjacent unshaded cells differ by at
//    least 5.
//  - Kropki: a white dot separates consecutive digits.
//  - Given Digits: the white digit drawn on the board is given.
// The fog clauses ("Clearing Fog", and shaded cells staying covered once the
// grid is complete) say what a solver sees while filling the grid; they place
// no condition on the finished grid, so nothing is encoded for them.

// YinYang's YY overlay uses the grid's two lowest values for the two shades.
const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('YY');

// Drawn data: the three white circles, each centred on the edge between the
// two cells listed.
const whiteDots = [
  ['R2C7', 'R2C8'],
  ['R3C6', 'R3C7'],
  ['R6C6', 'R7C6'],
];

// Each unordered orthogonally adjacent pair once: the right and down steps.
const edges = graph.cells().flatMap(
  cell => [graph.step(cell, 0, 1), graph.step(cell, 1, 0)]
    .filter(next => next !== null)
    .map(next => [cell, next]));

// The whisper binds an edge only when both of its cells are unshaded. With
// two shades, "not both unshaded" is "at least one is shaded", so the
// conditional is a three-way Or over the edge.
const unshadedWhispers = edges.map(([a, b]) => new Or([
  new Given(shade.at(a), SHADED),
  new Given(shade.at(b), SHADED),
  new Whisper(5, a, b),
]));

return [
  new Shape('9x9'),
  new YinYang(),
  // The white 7 drawn inside R2C2: a bar across the top of the cell and a
  // stroke descending to the left.
  new Given('R2C2', 7),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...unshadedWhispers,
];
