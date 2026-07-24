// Title: Yin Yang
// Author: Jesper
// Video: https://www.youtube.com/watch?v=N1Fi3xt3NkY
// Source: https://app.crackingthecryptic.com/sudoku/t4GP9DgL9j

// Rules:
//   Divide the grid into regions of nine orthogonally connected cells. Each
//   row, column and region contains 1-9 once each (there are no boxes).
//   Shade some cells so that: all shaded cells are connected; all unshaded
//   cells are connected; no 2x2 area is fully shaded or fully unshaded; and
//   each region is either fully shaded or fully unshaded.
//   A cell with one or more arrows contains the total number of shaded cells
//   in the indicated directions combined, not counting the arrow cell itself.
//   Not all possible arrows are given (no negative constraint).
//
// Encoding:
//   ChaosConstruction deduces the regions and supplies the CC region-label
//   overlay. A separate two-valued VS overlay carries the shading, with one
//   ConnectedValues per shade for the yin-yang connectivity.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// Region labels deduced by ChaosConstruction, and the shading overlay.
const cc = graph.makeOverlay('CC');
const shade = graph.makeOverlay('VS');
const shadeCell = cell => shade.at(cell);

// Every shade Var is either shaded or unshaded.
const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(
  new Given(firstShade, SHADED, UNSHADED));

// A region is orthogonally connected, so "each region is entirely shaded or
// entirely unshaded" holds exactly when no two orthogonally adjacent cells of
// the same region take different shades. One constraint per adjacent pair:
// either the two cells sit in different regions, or they share a shade.
const adjacentPairs = gridCells.flatMap(
  cell => graph.neighbours(cell)
    // Each unordered pair once: keep the neighbour below/right of the cell.
    .filter(other => gridCells.indexOf(other) > gridCells.indexOf(cell))
    .map(other => [cell, other]));
const regionShadeLinks = adjacentPairs.map(([a, b]) => new Or([
  new AllDifferent(cc.at(a), cc.at(b)),
  // Two sets of one cell each: the two shades must match.
  new SameValues(2, shadeCell(a), shadeCell(b)),
]));

// No 2x2 block may be all shaded or all unshaded: one NFA over the top-left
// block's four shade cells, replicated to every block origin.
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

// The arrows drawn inside each cell, as (dRow, dCol) steps.
const DIRS = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
const ARROWS = [
  ['R1C1', ['down']],
  ['R1C2', ['right']],
  ['R1C3', ['down']],
  ['R1C4', ['right']],
  ['R1C5', ['down']],
  ['R1C6', ['left']],
  ['R1C7', ['down', 'right']],
  ['R2C2', ['down']],
  ['R2C8', ['up', 'left', 'right']],
  ['R4C2', ['down']],
  ['R4C5', ['left']],
  ['R4C6', ['up']],
  ['R6C2', ['right']],
  ['R6C9', ['left']],
  ['R7C1', ['right']],
  ['R7C3', ['left', 'down']],
  ['R8C1', ['right']],
  ['R8C2', ['up']],
  ['R8C3', ['left', 'up', 'right', 'down']],
  ['R8C4', ['right']],
  ['R8C8', ['left']],
  ['R8C9', ['up']],
  ['R9C1', ['up', 'right']],
  ['R9C7', ['left']],
];

// NFA: the first cell is the arrow cell's digit; the rest are shade cells,
// and exactly that many of them must be shaded. Counting stops early once the
// target is exceeded, so the machine stays small.
const countShadedMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value === SHADED ? 1 : 0);
    if (next > target) return undefined;
    return { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);

const arrowCounts = ARROWS.map(([cell, dirs]) => {
  // Each ray runs to the grid edge; slice(1) drops the arrow cell itself.
  const seen = dirs.flatMap(
    dir => shade.at(graph.ray(cell, ...DIRS[dir]).slice(1)));
  return new NFA(countShadedMachine, 'arrow-shaded-count', cell, ...seen);
});

return [
  new Shape('9x9'),
  new ChaosConstruction(),
  new NoBoxes(),
  shade.toVar('shade'),
  shadeDomain,
  // Yin-yang connectivity: each shade forms one orthogonally connected region.
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...regionShadeLinks,
  ...arrowCounts,
];
