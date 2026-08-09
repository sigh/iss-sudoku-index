// Title: Lost and Found
// Author: Jeet Sampat, Myxo, dumediat, damasosos92, Agent, SSG, glum_hippo, Playmaker6174, tallcat, Malrog, mnasti2, Piatato, Christounet, MaizeGator, Shintaro Fushida-Hardy
// Video: https://www.youtube.com/watch?v=mWaNizwrJSs
// Source: https://sudokupad.app/d5s2c3o5j3

// Rules encoded below, all of them:
//   Almost Sudoku: digits 1-9; each row, column and 3x3 box holds exactly 8
//     distinct digits (so exactly one digit repeats in each).
//   Arrows: the digits on an arm sum to the digit in the attached bulb.
//   Slow thermometers: digits do not decrease from the bulb to the tip.
//   German whispers: cells joined by a green line differ by at least 5.
//   Skyscrapers: an outside clue counts the digits visible along its line,
//     each digit hiding every later digit that is not larger than it.
//   Region sum lines: box borders cut a blue line into equal-sum segments.
//
// Rows and columns of a Sudoku grid are always all-different, which the
// Almost Sudoku rule contradicts, so the grid is Raw: no implicit
// row/column/box rules, so every rule below is stated over its cells
// explicitly.

const N = 9;
const shape = new Shape(`${N}x${N}`, '1-9', 'Raw');
const graph = cellGraph(shape);

const at = (row, col) => makeCellId(row, col);
const path = (...coords) => coords.map(([row, col]) => at(row, col));

// CountDistinct's first cell holds the number of distinct values among the
// rest; one control cell fixed at 8 serves all 27 groups.
const COUNT = new Var('D', 'Distinct digits per group', 1);
const control = COUNT.cell(1);
// A Raw grid has no default boxes, so build the nine 3x3 boxes explicitly.
const boxes = [];
for (let r = 1; r <= N; r += 3)
  for (let c = 1; c <= N; c += 3)
    boxes.push(graph.block(makeCellId(r, c), 3, 3));
const almostSudoku = [
  ...graph.rows(),
  ...graph.columns(),
  ...boxes,
].map(group => new CountDistinct(control, ...group));

const givens = [
  new Given(at(1, 9), 9),
  new Given(at(8, 2), 9),
];

// Arrows, bulb cell first then the arm from the bulb outwards.
const arrows = [
  [[4, 1], [4, 2], [3, 2], [3, 3], [2, 3], [2, 4], [1, 4], [1, 5]],
  [[4, 4], [3, 5], [3, 6], [3, 7]],
  [[9, 1], [8, 1], [9, 2]],
  [[9, 8], [9, 9], [8, 9], [7, 9]],
].map(cells => new Arrow(...path(...cells)));

// Native Thermo is strictly increasing, so the non-decreasing relation is
// spelled out as a pairwise key applied along each line, bulb first.
const nonDecreasing = Pair.fnToKey((a, b) => a <= b, N);
const slowThermos = [
  [[9, 5], [9, 4], [8, 4], [8, 3], [7, 3], [7, 2], [6, 2], [6, 1]],
  [[2, 9], [1, 8], [1, 7]],
].map(cells => new Pair(nonDecreasing, 'slow thermometer', ...path(...cells)));

// Green lines as drawn; the R4C6-R5C5-R4C5 line is an open V, its two
// endpoints are not joined by a stroke.
const whispers = [
  [[5, 6], [5, 5], [6, 4]],
  [[4, 6], [5, 5], [4, 5]],
  [[5, 5], [5, 4]],
  [[9, 6], [8, 7], [7, 8], [6, 9]],
  [[5, 8], [5, 9]],
].map(cells => new Whisper(...path(...cells)));

// RegionSumLine reads its segments from main-grid boxes, which do not exist
// here, so each blue line is given as its drawn box segments directly.
const regionSumLines = [
  [[[7, 7]], [[7, 6], [8, 5], [7, 5]], [[6, 5], [6, 4]]],
  [[[1, 6]], [[2, 7], [3, 8]], [[4, 9]]],
].map(segments => new EqualSum(...segments.map(segment => path(...segment))));

// Skyscraper as a state machine over the clue's line of sight: the state is the
// tallest digit seen so far and the number of digits visible, a digit is
// visible exactly when it exceeds that maximum, and the run is accepted when
// the final count equals the clue.
const skyscraperSpec = (clue) => NFA.encodeSpec({
  startState: { max: 0, visible: 0 },
  transition: ({ max, visible }, value) => {
    const nextVisible = visible + (value > max ? 1 : 0);
    if (nextVisible > clue) return undefined;
    return { max: Math.max(max, value), visible: nextVisible };
  },
  accept: ({ visible }) => visible === clue,
  maxDepth: N,
}, N);

// The 6 sits below column 3 and looks up it; the 4 sits right of row 3 and
// looks left along it.
const skyscrapers = [
  new NFA(skyscraperSpec(6), 'skyscraper 6', ...graph.ray(at(9, 3), -1, 0)),
  new NFA(skyscraperSpec(4), 'skyscraper 4', ...graph.ray(at(3, 9), 0, -1)),
];

return [
  shape,
  COUNT,
  new Given(control, 8),
  ...almostSudoku,
  ...givens,
  ...arrows,
  ...slowThermos,
  ...whispers,
  ...regionSumLines,
  ...skyscrapers,
];
