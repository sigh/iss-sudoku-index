// Title: Fortress Yin Yang
// Author: yttrio
// Video: https://www.youtube.com/watch?v=p3pDjjp0cP0
// Source: https://sudokupad.app/xug1fmiw9y

// Full encoding.
// - Normal sudoku: default Shape('9x9') row/column/box all-different.
// - Yin-Yang: the shading is the YinYang constraint's YY cell group
//   (grid's two lowest values mean shaded/unshaded); connectivity and the
//   no-monochrome-2x2 rule are built in.
// - Fortress: a shaded cell must be greater than every orthogonal unshaded
//   neighbour. For each undirected edge (a, b) this is two directed clauses:
//   Or(b is shaded, a is unshaded, a > b) -- "if a is shaded and b is
//   unshaded, a must exceed b" (contrapositive form so it composes as an Or
//   of allowed outs), and the mirror clause with a and b swapped.
// - Arrow clues: the digit already in the arrow's own cell (no separate given
//   exists for it) counts the shaded cells strictly beyond it along the whole
//   ray to the border -- the rules say "counts the total number", not a
//   contiguous run, so the count is over every cell on the ray. Shade domain
//   is {SHADED:1, UNSHADED:2}, so summing raw shade values over the ray gives
//   2*N - (#shaded); linearised as one Sum per arrow:
//   digit + sum(shadeCells) == 2 * (#cells on the ray).

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('YY');
const shadeCell = cell => shade.at(cell);
const gridCells = graph.cells();

// Fortress: a shaded cell must exceed each unshaded orthogonal neighbour.
const seenEdges = new Set();
const fortressConstraints = [];
for (const cell of gridCells) {
  for (const neighbour of graph.neighbours(cell)) {
    const edgeKey = [cell, neighbour].sort().join('_');
    if (seenEdges.has(edgeKey)) continue;
    seenEdges.add(edgeKey);
    fortressConstraints.push(new Or([
      new Given(shadeCell(cell), UNSHADED),
      new Given(shadeCell(neighbour), SHADED),
      new GreaterThan(cell, neighbour),
    ]));
    fortressConstraints.push(new Or([
      new Given(shadeCell(neighbour), UNSHADED),
      new Given(shadeCell(cell), SHADED),
      new GreaterThan(neighbour, cell),
    ]));
  }
}

// Arrow clues: cell -> direction, read off the drawn tiny arrows.
const arrows = [
  ['R1C1', [0, 1]],   // right
  ['R1C2', [0, 1]],   // right
  ['R8C1', [0, 1]],   // right
  ['R9C3', [-1, 0]],  // up
  ['R2C6', [0, -1]],  // left
  ['R2C8', [0, -1]],  // left
  ['R2C9', [0, -1]],  // left
  ['R9C8', [-1, 0]],  // up
  ['R7C6', [0, -1]],  // left
  ['R2C3', [1, 0]],   // down
];

const arrowConstraints = arrows.map(([cell, [dr, dc]]) => {
  const rayCells = graph.ray(cell, dr, dc).slice(1); // exclude the cell itself
  return new Sum(2 * rayCells.length, cell, ...shade.at(rayCells));
});

return [
  new Shape('9x9'),
  new YinYang(),
  ...fortressConstraints,
  ...arrowConstraints,
];
