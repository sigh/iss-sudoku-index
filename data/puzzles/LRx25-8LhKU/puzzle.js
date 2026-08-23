// Title: Whispering Yin Yang
// Author: yttrio
// Video: https://www.youtube.com/watch?v=LRx25-8LhKU
// Source: https://sudokupad.app/ra3rf0qcnz

// Yin-Yang shading is the native YinYang constraint's YY cell group.
// German Whispers has no drawn lines: it applies to every pair of
// orthogonally adjacent cells that are BOTH shaded, whose digits must then
// differ by at least 5. Each arrow is a short direction marker inside one
// cell (not a drawn path); that cell's digit counts the shaded cells from it
// to the grid edge along the pointed direction, excluding itself.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('YY');
const shadeCell = cell => shade.at(cell);
const gridCells = graph.cells();

// German Whispers, conditional on shading: every orthogonally adjacent pair
// of cells that are BOTH shaded must differ by at least 5. Walked as the
// grid's right- and down-neighbour edges, so each edge is counted once.
const adjacentPairs = gridCells.flatMap(cell => {
  const pairs = [];
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  if (right) pairs.push([cell, right]);
  if (down) pairs.push([cell, down]);
  return pairs;
});

const shadedWhispers = adjacentPairs.map(([a, b]) => new Or([
  new Given(shadeCell(a), UNSHADED),
  new Given(shadeCell(b), UNSHADED),
  new Whisper(5, a, b),
]));

// Arrows: cell + compass direction, transcribed from the drawn short
// direction markers (each anchored at one cell, snapped to a (dRow, dCol)
// step).
const arrows = [
  { cell: 'R1C1', dir: [0, 1] },   // right
  { cell: 'R1C2', dir: [0, 1] },   // right
  { cell: 'R8C2', dir: [0, 1] },   // right
  { cell: 'R7C5', dir: [0, 1] },   // right
  { cell: 'R7C9', dir: [0, -1] },  // left
  { cell: 'R6C7', dir: [0, -1] },  // left
  { cell: 'R7C8', dir: [1, 0] },   // down
  { cell: 'R6C6', dir: [-1, 0] },  // up
  { cell: 'R5C4', dir: [1, -1] },  // down-left (diagonal)
];

// The arrow's digit equals the count of SHADED cells among the `n` cells
// from the arrow cell to the grid edge (exclusive of the arrow cell itself).
// Each ray cell's shade Var is SHADED(1) or UNSHADED(2), so
// (2 - shadeValue) is 1 when shaded and 0 when unshaded; summing that over
// the ray gives the count. Rearranged to a linear equation Sum can express
// directly: digit + sum(shadeValues) = 2 * n.
const arrowRules = arrows.map(({ cell, dir }) => {
  const rayCells = graph.ray(cell, ...dir).slice(1);
  return new Sum(2 * rayCells.length, cell, ...shade.at(rayCells));
});

return [
  new Shape('9x9'),
  new YinYang(),
  ...shadedWhispers,
  ...arrowRules,
];
