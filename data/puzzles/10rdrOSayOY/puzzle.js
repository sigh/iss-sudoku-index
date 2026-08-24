// Title: Cage Scraper
// Author: Philipp Blume
// Video: https://www.youtube.com/watch?v=10rdrOSayOY
// Source: https://app.crackingthecryptic.com/sudoku/hngDFJtH92

// Normal sudoku. Cages hold no printed total; digits inside a cage are
// distinct, and a cage's "building height" is the sum of its digits. Cells
// outside every cage are ignored by the outside clues. Each outside clue
// counts, looking inward, the cage-buildings that are taller than every
// building already passed (ties do not add to the count) -- classic
// skyscraper visibility applied to cage totals instead of cell digits. In
// any row/column carrying an outside clue, no two of its buildings may
// share a height (stated separately from the visibility count); a
// row/column without a clue is explicitly unconstrained on this point.
const shape = new Shape('9x9', '0-15');
const graph = cellGraph(shape);
const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Cage cells transcribed from the drawn no-total cages, in payload order.
// Index i (0-based) backs Var id i+1 below.
const cages = [
  ['R1C1', 'R1C2', 'R1C3'],
  ['R1C4', 'R1C5', 'R1C6', 'R2C4'],
  ['R1C7', 'R1C8', 'R1C9'],
  ['R2C1', 'R2C2', 'R2C3', 'R3C2'],
  ['R3C4', 'R3C3', 'R4C1', 'R4C2', 'R4C3', 'R5C3'],
  ['R2C6', 'R2C7'],
  ['R3C7', 'R3C8'],
  ['R3C9', 'R4C9', 'R4C8'],
  ['R4C7', 'R5C7', 'R6C7', 'R5C8'],
  ['R5C9', 'R6C9'],
  ['R7C9', 'R7C8', 'R8C8'],
  ['R8C9', 'R9C9'],
  ['R9C8', 'R8C6', 'R8C7', 'R9C7'],
  ['R9C6', 'R9C5'],
  ['R8C5'],
  ['R7C6', 'R6C6', 'R5C6'],
  ['R6C4', 'R6C5', 'R7C5'],
  ['R4C4', 'R4C5', 'R4C6'],
  ['R5C1', 'R5C2', 'R6C2'],
  ['R6C1', 'R7C1'],
  ['R7C2', 'R8C2'],
  ['R7C3', 'R7C4'],
  ['R8C3', 'R9C3', 'R9C4'],
  ['R9C2', 'R9C1'],
];

// Two base-16 Var digits per cage encode its height: height = 16*high + low.
// A cage of n cells has height at most the sum of its n largest digits, so
// `high` only ever needs the values 0 .. floor(maxSum/16); restricting it
// keeps the domain honest per cage instead of a blanket 0-2 for every cage.
const high = new Var('H', 'cage height high digit', cages.length);
const low = new Var('L', 'cage height low digit', cages.length);
const maxHighForSize = n => {
  const maxSum = Array.from({ length: n }, (_, k) => 9 - k)
    .reduce((a, b) => a + b, 0);
  return Math.floor(maxSum / 16);
};
const heightParts = cages.flatMap((cells, i) => {
  const maxHigh = maxHighForSize(cells.length);
  return [
    new Given(high.cell(i + 1), ...Array.from({ length: maxHigh + 1 }, (_, k) => k)),
    new Sum(0, ...cells, [high.cell(i + 1), -16], [low.cell(i + 1), -1]),
  ];
});
const heightCells = id => [high.cell(id), low.cell(id)];

// Visibility NFA: reads (high, low) pairs for the buildings visible along a
// line, in viewing order, and accepts iff exactly `clue` of them are each
// taller than every building already read (a tie with the running maximum
// does not add to the count -- "taller buildings obscure shorter buildings").
const skyline = clue => NFA.encodeSpec({
  startState: { high: null, maximum: -1, visible: 0 },
  transition: (state, value) => {
    if (state.high === null)
      return value <= 2 ? { ...state, high: value } : undefined;
    const height = 16 * state.high + value;
    const visible = state.visible + (height > state.maximum ? 1 : 0);
    if (visible > clue) return undefined;
    return { high: null, maximum: Math.max(state.maximum, height), visible };
  },
  accept: state => state.high === null && state.visible === clue,
  maxDepth: 12,
}, shape);

// Outside clues: [clue value, building ids in viewing order (nearest first)].
// Ids are 1-based cage indices (Var suffixes); direction/order read off the
// drawn overlay position (left/right/top/bottom) against each line's cages
// in grid order, skipping cells outside every cage and collapsing
// consecutive same-cage cells into one building.
const clues = [
  [1, [1, 2, 3]],                    // left of R1
  [2, [8, 7, 5, 4]],                 // right of R3 (viewed right-to-left)
  [2, [3, 6, 7, 9, 13]],             // top of C7
  [2, [24, 23, 14, 13, 12]],         // left of R9
  [2, [24, 20, 19, 5, 4, 1]],        // bottom of C1 (viewed bottom-to-top)
  [4, [20, 21, 22, 17, 16, 11]],     // left of R7
  [4, [1, 4, 5, 19, 20, 24]],        // top of C1
  [3, [8, 9, 18, 5]],                // right of R4 (viewed right-to-left)
  [3, [12, 11, 10, 8, 3]],           // bottom of C9 (viewed bottom-to-top)
  [6, [21, 23, 15, 13, 11, 12]],     // left of R8
  [6, [2, 6, 18, 16, 13, 14]],       // top of C6
];

// Distinctness: every row/column that carries an outside clue may not repeat
// a building height among its own buildings (rule clause 2), independent of
// the visibility count. A row/column without a clue is explicitly exempt.
// One set of building ids per clued line (column C1 has two clues but one
// line, so it is listed once).
const distinctLines = [
  [1, 2, 3],                  // R1
  [4, 5, 7, 8],                // R3
  [5, 8, 9, 18],                // R4
  [11, 16, 17, 20, 21, 22],     // R7
  [11, 12, 13, 15, 21, 23],     // R8
  [12, 13, 14, 23, 24],         // R9
  [1, 4, 5, 19, 20, 24],        // C1
  [2, 6, 13, 14, 16, 18],       // C6
  [3, 6, 7, 9, 13],             // C7
  [3, 8, 10, 11, 12],           // C9
];
// "Not equal" is read as NOT(high-parts equal AND low-parts equal), i.e. an
// Or of the two parts differing -- comparing only one part would wrongly
// forbid two buildings that merely share that one base-16 digit.
const neqKey = Pair.fnToKey((a, b) => a !== b, shape);
const heightsDiffer = (idA, idB) => new Or([
  new Pair(neqKey, `h${idA}-h${idB}`, high.cell(idA), high.cell(idB)),
  new Pair(neqKey, `l${idA}-l${idB}`, low.cell(idA), low.cell(idB)),
]);
const distinctPairs = distinctLines.flatMap(ids => ids.flatMap(
  (a, i) => ids.slice(i + 1).map(b => heightsDiffer(a, b))));

return [
  shape,
  graph.makeReplicate(new Given('R1C1', ...digits)),
  new Given('R3C4', 7),
  new Given('R5C5', 4),
  high,
  low,
  ...cages.filter(cells => cells.length > 1).map(cells => new AllDifferent(...cells)),
  ...heightParts,
  ...clues.map(([clue, ids]) => new NFA(
    skyline(clue), `visible ${clue}`, ids.flatMap(heightCells))),
  ...distinctPairs,
];
