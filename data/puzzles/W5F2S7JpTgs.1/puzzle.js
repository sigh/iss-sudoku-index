// Title: April 18, 2022: Median
// Author: clover!
// Video: https://www.youtube.com/watch?v=W5F2S7JpTgs
// Source: https://tinyurl.com/5xehesp7

// Normal sudoku rules apply. Each of the 12 marked 3-cell cages holds
// distinct digits; the printed number is the median (middle) digit among the
// three. Cage cell lists and printed values below are transcribed from the
// source's `cage` array (`cells` + `value`).
//
// Median-of-three is encoded with one small NFA per cage. It scans the three
// cells in any order, counting how many are below the printed value (lt) and
// how many are above it (gt), each clamped at 2. Accepting exactly
// lt===1 && gt===1 is "the median equals V": with three distinct digits,
// lt+gt+eq==3, so lt===1 && gt===1 forces eq===1 -- one cage cell equals V,
// one cell is smaller, one is larger.

const medianCages = [
  [['R1C2', 'R1C3', 'R1C4'], 2],
  [['R1C6', 'R1C7', 'R1C8'], 4],
  [['R2C1', 'R3C1', 'R4C1'], 8],
  [['R6C1', 'R7C1', 'R8C1'], 6],
  [['R9C2', 'R9C3', 'R9C4'], 3],
  [['R9C6', 'R9C7', 'R9C8'], 6],
  [['R2C9', 'R3C9', 'R4C9'], 7],
  [['R6C9', 'R7C9', 'R8C9'], 2],
  [['R3C3', 'R3C4', 'R4C3'], 4],
  [['R6C7', 'R7C6', 'R7C7'], 6],
  [['R6C3', 'R7C3', 'R7C4'], 6],
  [['R3C6', 'R3C7', 'R4C7'], 5],
];

const medianSpec = (v) => NFA.encodeSpec({
  startState: { lt: 0, gt: 0 },
  transition: ({ lt, gt }, value) => {
    if (value < v) return { lt: Math.min(lt + 1, 2), gt };
    if (value > v) return { lt, gt: Math.min(gt + 1, 2) };
    return { lt, gt }; // value === v
  },
  accept: ({ lt, gt }) => lt === 1 && gt === 1,
  maxDepth: 3,
}, 9);

const medianConstraints = medianCages.flatMap(([cells, v]) => [
  new AllDifferent(...cells),
  new NFA(medianSpec(v), `median-${v}`, cells),
]);

// Givens, transcribed from the source's grid.
const givens = [
  ['R1C5', 8], ['R2C2', 1], ['R2C8', 3], ['R3C3', 9], ['R3C5', 7],
  ['R3C7', 8], ['R5C2', 3], ['R5C5', 5], ['R5C8', 7], ['R7C3', 7],
  ['R7C5', 3], ['R7C7', 6], ['R8C2', 2], ['R8C8', 4], ['R9C5', 1],
].map(([cell, v]) => new Given(cell, v));

return [
  new Shape('9x9'),
  ...givens,
  ...medianConstraints,
];
