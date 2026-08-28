// Title: Trust Me, I'm Lying
// Author: Chefofdeath
// Video: https://www.youtube.com/watch?v=4b5c4zcL6f8
// Source: https://tinyurl.com/5ckerryv

// Normal sudoku rules apply (rows, columns, boxes).
// Every named rule below negates the usual meaning of its marker:
//   - grey square: digit must NOT be even (so it is odd)
//   - grey circle: digit must NOT be odd (so it is even)
//   - thermometer: digits DECREASE from the bulb end
//   - white dot: the two digits must NOT differ by 1
//   - X: the two digits must NOT sum to 10; V: must NOT sum to 5
//   - purple line: the digits on it must NOT all be consecutive (as a set)
//   - green line: adjacent digits must NOT differ by 5 or more
//   - minimum-cell marker: the digit must NOT be smaller than any of its
//     orthogonally adjacent cells (i.e. must be >= every such neighbour)
//   - killer cage: the cage digits must NOT sum to the printed total (39)

const oddCells = [ // grey circle, must be even
  'R1C3', 'R1C6', 'R1C9', 'R4C9', 'R4C6', 'R4C3', 'R7C3', 'R7C6', 'R7C9',
  'R3C2', 'R3C5', 'R3C8', 'R6C2', 'R6C5', 'R6C8', 'R9C8', 'R9C5', 'R9C2',
];
const evenCells = [ // grey square, must be odd
  'R1C4', 'R1C7', 'R4C7', 'R4C4', 'R4C1', 'R7C1', 'R7C4', 'R7C7', 'R1C1',
  'R3C3', 'R6C3', 'R6C6', 'R3C6', 'R3C9', 'R6C9', 'R9C9', 'R9C6', 'R9C3',
];

// [bulb, tip] as drawn (first cell of each thermometer is the bulb).
const thermos = [
  ['R3C1', 'R2C1'], ['R6C1', 'R5C1'], ['R9C1', 'R8C1'],
  ['R9C4', 'R8C4'], ['R6C4', 'R5C4'], ['R3C4', 'R2C4'],
  ['R3C7', 'R2C7'], ['R6C7', 'R5C7'], ['R9C7', 'R8C7'],
];

// Each box's 8 marked cells (its 9th cell, carrying an odd/even marker, is
// excluded), all printed total 39.
const cages = [
  ['R1C1', 'R1C2', 'R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3'],
  ['R1C4', 'R1C5', 'R2C4', 'R2C5', 'R2C6', 'R3C4', 'R3C5', 'R3C6'],
  ['R1C7', 'R1C8', 'R2C7', 'R2C8', 'R2C9', 'R3C7', 'R3C8', 'R3C9'],
  ['R4C7', 'R4C8', 'R5C7', 'R5C8', 'R5C9', 'R6C7', 'R6C8', 'R6C9'],
  ['R4C4', 'R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5', 'R6C6'],
  ['R4C1', 'R4C2', 'R5C1', 'R5C2', 'R5C3', 'R6C1', 'R6C2', 'R6C3'],
  ['R7C1', 'R7C2', 'R8C1', 'R8C2', 'R8C3', 'R9C1', 'R9C2', 'R9C3'],
  ['R7C4', 'R7C5', 'R8C4', 'R8C5', 'R8C6', 'R9C4', 'R9C5', 'R9C6'],
  ['R7C7', 'R7C8', 'R8C7', 'R8C8', 'R8C9', 'R9C7', 'R9C8', 'R9C9'],
];

// White dots (no explicit value drawn, i.e. the default difference of 1).
const dotPairs = [
  ['R2C2', 'R3C2'], ['R3C5', 'R2C5'], ['R2C8', 'R3C8'],
  ['R5C8', 'R6C8'], ['R6C5', 'R5C5'], ['R5C2', 'R6C2'],
  ['R9C2', 'R8C2'], ['R8C5', 'R9C5'], ['R8C8', 'R9C8'],
  ['R5C7', 'R5C8'], ['R8C1', 'R8C2'], ['R2C4', 'R2C5'],
];

// X/V pairs, split by marker.
const xPairs = [
  ['R2C1', 'R3C1'], ['R3C4', 'R2C4'], ['R2C7', 'R3C7'],
  ['R5C7', 'R6C7'], ['R5C4', 'R6C4'], ['R5C1', 'R6C1'],
  ['R9C1', 'R8C1'], ['R9C4', 'R8C4'], ['R8C7', 'R9C7'],
];
const vPairs = [
  ['R6C2', 'R6C3'], ['R3C8', 'R3C9'], ['R9C6', 'R9C5'],
];

// Purple lines, each 3 cells. Every one of these 9 lines sits entirely
// inside a single box, so the box's own all-different already makes its
// 3 cells pairwise distinct.
const purpleLines = [
  ['R8C2', 'R7C2', 'R7C3'], ['R8C5', 'R7C5', 'R7C6'], ['R8C8', 'R7C8', 'R7C9'],
  ['R5C8', 'R4C8', 'R4C9'], ['R5C5', 'R4C5', 'R4C6'], ['R5C2', 'R4C2', 'R4C3'],
  ['R2C2', 'R1C2', 'R1C3'], ['R2C5', 'R1C5', 'R1C6'], ['R2C8', 'R1C8', 'R1C9'],
];

// Green lines, each 2 cells.
const greenPairs = [
  ['R9C9', 'R8C9'], ['R6C9', 'R5C9'], ['R3C6', 'R2C6'],
  ['R6C6', 'R5C6'], ['R9C3', 'R8C3'], ['R3C3', 'R2C3'],
];

// Minimum-cell markers (position only, no printed value).
const minimumCells = [
  'R4C2', 'R1C2', 'R1C5', 'R1C8', 'R4C8', 'R4C5', 'R7C2', 'R7C5', 'R7C8',
];
const graph = cellGraph('9x9');

const notDiffOne = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);
const notSumTen = Pair.fnToKey((a, b) => a + b !== 10, 9);
const notSumFive = Pair.fnToKey((a, b) => a + b !== 5, 9);
const notFarApart = Pair.fnToKey((a, b) => Math.abs(a - b) < 5, 9);
// Asymmetric: first cell (the minimum-marked one) must be >= the second
// (its neighbour) -- call order below always puts the marked cell first.
const notSmallerThan = Pair.fnToKey((a, b) => a >= b, 9);

// "Not all consecutive" as a span-only test: max - min !== 2 over the 3
// cells. This is sound only because each purple line's cells are already
// pairwise distinct (they share a box, see purpleLines above) -- otherwise
// e.g. {4,4,5} would wrongly pass the span test without being a real
// 3-consecutive run.
const notConsecutiveSpec = NFA.encodeSpec({
  startState: { min: null, max: null },
  transition: (state, value) => ({
    min: state.min === null ? value : Math.min(state.min, value),
    max: state.max === null ? value : Math.max(state.max, value),
  }),
  accept: (state) => state.max - state.min !== 2,
}, 9);

// Achievable range of an anti-killer cage's sum: its 8 cells are pairwise
// distinct (they are 8 of a box's 9 cells, and the box is all-different),
// so the sum of 8 distinct values from 1-9 ranges from 1+..+8=36 (omitting
// 9) to 2+..+9=44 (omitting 1). Enumerate that range excluding the printed
// total 39.
const achievableCageSums = [36, 37, 38, 40, 41, 42, 43, 44];

return [
  new Shape('9x9'),

  ...oddCells.map(cell => new Given(cell, 2, 4, 6, 8)),
  ...evenCells.map(cell => new Given(cell, 1, 3, 5, 7, 9)),

  // Reversing to [tip, bulb] turns Thermo's built-in "increasing from the
  // first cell" into "increasing tip->bulb", i.e. decreasing bulb->tip.
  ...thermos.map(([bulb, tip]) => new Thermo(tip, bulb)),

  ...cages.map(cells => new Or(achievableCageSums.map(s => new Sum(s, ...cells)))),

  ...dotPairs.map(([a, b]) => new Pair(notDiffOne, 'anti-kropki', a, b)),
  ...xPairs.map(([a, b]) => new Pair(notSumTen, 'anti-X', a, b)),
  ...vPairs.map(([a, b]) => new Pair(notSumFive, 'anti-V', a, b)),
  ...greenPairs.map(([a, b]) => new Pair(notFarApart, 'anti-whisper', a, b)),

  ...purpleLines.map(cells => new NFA(notConsecutiveSpec, 'anti-renban', ...cells)),

  ...minimumCells.flatMap(cell => graph.neighbours(cell).map(
    n => new Pair(notSmallerThan, 'anti-minimum', cell, n))),
];
