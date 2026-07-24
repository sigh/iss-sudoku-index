// Title: Whispers In The Shadows
// Author: Scruffamudda
// Video: https://www.youtube.com/watch?v=L8XFUWyFHBU
// Source: https://sudokupad.app/e8vw82a7x0

// Yin-Yang: shade cells so the shaded cells form one orthogonally connected
// region, the unshaded cells form another, and no 2x2 block is monochrome.
// Every Kropki dot must touch (be adjacent to) at least one shaded cell.
// German Whispers has no drawn lines: it applies to every pair of
// orthogonally adjacent cells that are BOTH shaded, whose digits must then
// differ by at least 5. Kropki: black dots are a 2:1 ratio, white dots are
// consecutive.

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

// Kropki dots, decoded from the drawn overlay centers.
const blackDots = [
  ['R1C1', 'R1C2'],
  ['R2C4', 'R3C4'],
  ['R4C5', 'R4C6'],
  ['R7C3', 'R8C3'],
  ['R7C7', 'R8C7'],
  ['R5C8', 'R5C9'],
];

const whiteDots = [
  ['R1C5', 'R2C5'],
  ['R2C3', 'R2C4'],
  ['R3C8', 'R3C9'],
  ['R4C3', 'R4C4'],
  ['R4C3', 'R5C3'],
  ['R5C8', 'R6C8'],
  ['R6C4', 'R7C4'],
  ['R6C7', 'R7C7'],
  ['R7C2', 'R7C3'],
  ['R8C4', 'R9C4'],
];

// "Every dot must touch a shaded cell": at least one of the dot's two cells
// is shaded.
const dotTouchesShade = [...blackDots, ...whiteDots].map(([a, b]) => new Or([
  new Given(shadeCell(a), SHADED),
  new Given(shadeCell(b), SHADED),
]));

// No 2x2 block may be all shaded or all unshaded: one NFA on the top-left
// block, replicated to every block origin (same pattern as xin_yang_v2.js).
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

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shadeDomain,
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...dotTouchesShade,
  ...shadedWhispers,
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
];
