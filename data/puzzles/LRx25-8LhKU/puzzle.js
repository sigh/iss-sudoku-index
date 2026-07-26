// Title: Whispering Yin Yang
// Author: yttrio
// Video: https://www.youtube.com/watch?v=LRx25-8LhKU
// Source: https://sudokupad.app/ra3rf0qcnz

// Yin-Yang: shade cells so the shaded cells form one orthogonally connected
// region, the unshaded cells form another, and no 2x2 block is monochrome.
// German Whispers has no drawn lines: it applies to every pair of
// orthogonally adjacent cells that are BOTH shaded, whose digits must then
// differ by at least 5. Each arrow is a short direction marker inside one
// cell (not a drawn path); that cell's digit counts the shaded cells from it
// to the grid edge along the pointed direction, excluding itself.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');
const shadeCell = cell => shade.at(cell);
const gridCells = graph.cells();

// Every shade Var is either shaded or unshaded.
const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(new Given(firstShade, SHADED, UNSHADED));

// No 2x2 block may be all shaded or all unshaded: one NFA on the top-left
// block, replicated to every block origin.
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
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

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
  shade.toVar('shade'),
  shadeDomain,
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...shadedWhispers,
  ...arrowRules,
];
