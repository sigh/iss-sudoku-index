// Title: Diwali Candle 2
// Author: Schwupel
// Video: https://www.youtube.com/watch?v=GwZcXQ1re6w
// Source: https://app.crackingthecryptic.com/sudoku/tgQJNqqB6r

// Normal sudoku rules apply (standard 3x3 boxes). Shade some cells so that
// shaded cells form one orthogonally-connected region and unshaded cells
// form another, with no 2x2 area fully shaded or fully unshaded. Candles
// (marked cells) must be unshaded. A candle's own digit equals the number of
// consecutive unshaded cells it sees along its row and column, including
// itself: itself plus the four rays of unbroken unshaded cells radiating
// from it (row left/right, column up/down), each stopped by a shaded cell or
// the grid edge.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('YY');

// Givens.
const givens = [
  ['R1C9', 3], ['R2C2', 1], ['R4C1', 8], ['R4C5', 1], ['R5C2', 6],
  ['R5C4', 9], ['R7C1', 9], ['R7C6', 4], ['R7C7', 8], ['R7C9', 1],
  ['R9C3', 3],
].map(([cell, value]) => new Given(cell, value));

// Candle cells, marked with a candle overlay.
const candles = [
  'R2C3', 'R2C5', 'R2C6', 'R2C8', 'R3C2', 'R4C4',
  'R5C9', 'R6C8', 'R8C3', 'R8C4', 'R8C5', 'R8C8',
];
const candlesUnshaded = shade.at(candles).map(cell => new Given(cell, UNSHADED));

// Candle vision: the first segment is the candle's own grid cell (its
// digit); each following segment is one ray of shade cells, ordered outward
// from the candle. `need` is digit - 1 (the candle itself already counts as
// one), and the machine tallies each ray's leading run of UNSHADED cells,
// clearing the "blocked" flag at every SEGMENT_BREAK but carrying the total
// count across all four rays. maxDepth bounds worst case: 1 digit cell + 4
// rays of at most 8 cells each + 4 breaks between the 5 segments.
const visionMachine = NFA.encodeSpec({
  startState: { need: null, seen: 0, blocked: false },
  transition: ({ need, seen, blocked }, value) => {
    if (need === null) return { need: value - 1, seen: 0, blocked: false };
    if (value === SEGMENT_BREAK) return { need, seen, blocked: false };
    if (blocked || value !== UNSHADED) return { need, seen, blocked: true };
    const next = seen + 1;
    return next > need ? undefined : { need, seen: next, blocked: false };
  },
  accept: ({ need, seen }) => seen === need,
  maxDepth: 1 + 4 * 8 + 4,
}, geometry.numValues, { multiSegment: true });

const RAY_DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const visions = candles.map(cell => new NFA(
  visionMachine, 'vision',
  [cell],
  ...RAY_DIRS
    .map(([dR, dC]) => shade.at(graph.ray(cell, dR, dC).slice(1)))
    .filter(ray => ray.length)));

return [
  new Shape('9x9'),
  new YinYang(),
  ...givens,
  ...candlesUnshaded,
  ...visions,
];
