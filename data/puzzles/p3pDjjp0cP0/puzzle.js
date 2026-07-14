// Title: Fortress Yin Yang
// Author: yttrio
// Video: https://www.youtube.com/watch?v=p3pDjjp0cP0
// Source: https://sudokupad.app/xug1fmiw9y

// Full encoding.
// - Normal sudoku: default Shape('9x9') row/column/box all-different.
// - Yin-Yang: a shade overlay Var restricted to {SHADED, UNSHADED}. Global
//   connectivity ("all shaded cells orthogonally connected" and likewise for
//   unshaded) is one ConnectedValues per shade over the whole-grid overlay.
//   No monochrome 2x2 is a Replicate'd NFA over each 2x2 block.
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
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');
const shadeCell = cell => shade.at(cell);
const gridCells = graph.cells();

// Every shade Var is either shaded or unshaded.
const firstShade = shade.cells()[0];

// No 2x2 block may be all shaded or all unshaded.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    const allSame = next.every(v => v === next[0]);
    return allSame ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = Array.from(gridCells).filter(cell => graph.block(cell, 2, 2));

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
  return new Sum(2 * rayCells.length, cell, ...rayCells.map(shadeCell));
});

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shade.makeReplicate(new Given(firstShade, SHADED, UNSHADED)),
  // Yin-Yang connectivity: each shade forms one orthogonally connected region.
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  shade.makeReplicate(
    new NFA(noMono2x2Machine, 'no-mono-2x2',
      ...graph.block(gridCells[0], 2, 2).map(shadeCell)),
    blockOrigins.map(shadeCell)),
  ...fortressConstraints,
  ...arrowConstraints,
];
