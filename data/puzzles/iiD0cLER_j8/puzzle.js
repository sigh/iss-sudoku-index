// Title: Search 8 or 9
// Author: Qodec
// Video: https://www.youtube.com/watch?v=iiD0cLER_j8
// Source: https://app.crackingthecryptic.com/sudoku/FRDLJb8j8p

// Rules encoded: normal 9x9 Sudoku; the given R2C9=3; and, for each drawn red
// arrow, the digit in the arrow's cell is the distance in the arrow's direction
// to a cell containing an 8 or a 9 (a nearer 8 or 9 is allowed).
// "Not all arrows are necessarily given" removes any negative rule: a cell with
// no arrow is unconstrained, so nothing is encoded for the undrawn positions.

const STEPS = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };

// Drawn geometry: each red arrow lies wholly inside one cell; the direction is
// the one its arrowhead points.
const arrows = [
  ['R1C3', 'left'],
  ['R1C4', 'down'],
  ['R1C6', 'down'],
  ['R1C8', 'down'],
  ['R2C3', 'left'],
  ['R2C6', 'down'],
  ['R3C3', 'down'],
  ['R3C4', 'right'],
  ['R4C8', 'left'],
  ['R5C2', 'down'],
  ['R5C8', 'left'],
  ['R6C3', 'right'],
  ['R6C6', 'up'],
  ['R7C3', 'right'],
  ['R7C4', 'down'],
  ['R7C5', 'down'],
  ['R7C7', 'left'],
  ['R8C6', 'left'],
  ['R9C1', 'right'],
];

const graph = cellGraph('9x9');

// One disjunct per reachable distance d: the arrow cell holds d and the cell d
// steps along the ray holds 8 or 9. Distances past the grid edge have no
// disjunct, which is what bounds the arrow cell's digit.
const arrowConstraint = ([cell, direction]) => {
  const targets = graph.ray(cell, ...STEPS[direction]).slice(1);
  return new Or(targets.map((target, i) => new And([
    new Given(cell, i + 1),
    new Given(target, 8, 9),
  ])));
};

return [
  new Shape('9x9'),
  new Given('R2C9', 3),
  ...arrows.map(arrowConstraint),
];
