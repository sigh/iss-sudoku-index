// Title: Lost and Found
// Author: Jeet Sampat, Myxo, dumediat, damasosos92, Agent, SSG, glum_hippo, Playmaker6174, tallcat, Malrog, mnasti2, Piatato, Christounet, MaizeGator, Shintaro Fushida-Hardy
// Video: https://www.youtube.com/watch?v=mWaNizwrJSs
// Source: https://sudokupad.app/d5s2c3o5j3

// Digits 1-9. Every row, column, and 3x3 box contains exactly eight
// distinct digits. Arrows, slow thermometers, German whispers, two
// skyscraper clues, and two region sum lines provide the remaining clues.
//
// The almost-Sudoku groups permit a repeated digit, while the ISS main grid
// always makes rows and columns all-different. The real puzzle therefore
// lives in a Var group; the main grid is a pinned 1x9 placeholder. Its nine
// columns make the Var grid render with the puzzle's natural row width.

const N = 9;
const GRID = new Var('G', 'Grid', N * N);
const cellAt = (row, col) => GRID.cell((row - 1) * N + col);

const refGraph = cellGraph('9x9');
const placeholderCells = cellGraph('1x9').cells();
const toGrid = (refCell) => {
  const { row, col } = parseCellId(refCell);
  return cellAt(row, col);
};
const toGridCells = (cells) => cells.map(toGrid);

// CountDistinct's first cell holds the exact number of distinct values.
// One shared, fixed control is sufficient for all 27 almost-Sudoku groups.
const DISTINCT_COUNT = new Var('D', 'Required distinct count', 1);
const distinctControl = DISTINCT_COUNT.cell(1);
const almostGroups = [
  ...refGraph.rows(),
  ...refGraph.columns(),
  ...refGraph.boxes(),
].map(group => new CountDistinct(distinctControl, ...toGridCells(group)));

const givens = [
  new Given(cellAt(1, 9), 9),
  new Given(cellAt(8, 2), 9),
];

const arrows = [
  [[4, 1], [4, 2], [3, 2], [3, 3], [2, 3], [2, 4], [1, 4], [1, 5]],
  [[4, 4], [3, 5], [3, 6], [3, 7]],
  [[9, 1], [8, 1], [9, 2]],
  [[9, 8], [9, 9], [8, 9], [7, 9]],
].map(cells => new Arrow(...cells.map(([row, col]) => cellAt(row, col))));

const slowThermoKey = Pair.fnToKey((a, b) => a <= b, N);
const slowThermos = [
  [[9, 5], [9, 4], [8, 4], [8, 3], [7, 3], [7, 2], [6, 2], [6, 1]],
  [[2, 9], [1, 8], [1, 7]],
].map(cells => new Pair(
  slowThermoKey,
  'slow thermometer',
  ...cells.map(([row, col]) => cellAt(row, col)),
));

const whisperLines = [
  [[5, 6], [5, 5], [6, 4]],
  [[4, 6], [5, 5], [4, 5]],
  [[5, 5], [5, 4]],
  [[9, 6], [8, 7], [7, 8], [6, 9]],
  [[5, 8], [5, 9]],
].map(cells => new Whisper(
  ...cells.map(([row, col]) => cellAt(row, col)),
));

// RegionSumLine relies on main-grid box metadata. Since the puzzle grid is a
// Var group, retain the native rule semantics by spelling out its box segments.
const regionSumLines = [
  [
    [[7, 7]],
    [[7, 6], [8, 5], [7, 5]],
    [[6, 5], [6, 4]],
  ],
  [
    [[1, 6]],
    [[2, 7], [3, 8]],
    [[4, 9]],
  ],
].map(segments => new EqualSum(
  ...segments.map(segment => segment.map(([row, col]) => cellAt(row, col))),
));

// Generalized skyscraper NFA for an ordered line of Var cells. A building is
// visible exactly when it exceeds the maximum height seen so far.
const skyscraperSpec = (target) => NFA.encodeSpec({
  startState: { max: 0, visible: 0 },
  transition: ({ max, visible }, value) => {
    const nextVisible = visible + (value > max ? 1 : 0);
    if (nextVisible > target) return undefined;
    return { max: Math.max(max, value), visible: nextVisible };
  },
  accept: ({ visible }) => visible === target,
  maxDepth: N,
}, N);

const skyscrapers = [
  new NFA(
    skyscraperSpec(6),
    'skyscraper 6',
    ...Array.from({ length: N }, (_, i) => cellAt(N - i, 3)),
  ),
  new NFA(
    skyscraperSpec(4),
    'skyscraper 4',
    ...Array.from({ length: N }, (_, i) => cellAt(3, N - i)),
  ),
];

return [
  new Shape('1x9'),
  GRID,
  ...placeholderCells.map((cell, i) => new Given(cell, i + 1)),
  DISTINCT_COUNT,
  new Given(distinctControl, 8),
  ...almostGroups,
  ...givens,
  ...arrows,
  ...slowThermos,
  ...whisperLines,
  ...regionSumLines,
  ...skyscrapers,
];
