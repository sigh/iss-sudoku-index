// Title: Gray circles in gray fog
// Author: Lithium-Ion
// Video: https://www.youtube.com/watch?v=lpQwJfHBCyY
// Source: https://sudokupad.app/v2ey7c3lac

// Normal sudoku rules (rows, columns, standard 3x3 boxes).
// Anti-knight: cells a knight's move apart cannot repeat a digit.
// Gray circle: the joined pair must be consecutive, in a 1:2 ratio, or both
// (an inclusive-or, unlike a black/white Kropki dot).
// Blue line: box borders split the line into segments; every segment of the
// same line shares one common sum (RegionSumLine's native semantics).
// Fog is solving UI, not a grid rule, and is not encoded.

const grayCircleKey = Pair.fnToKey(
  (a, b) => Math.abs(a - b) === 1 || a === 2 * b || b === 2 * a,
  9
);

// Each entry is one independently-drawn edge circle -- keep them as separate
// Pairs rather than one multi-cell Pair, since they are not one connected path.
const grayCircleEdges = [
  ['R1C1', 'R1C2'], ['R1C3', 'R1C4'],
  ['R1C1', 'R2C1'],
  ['R2C1', 'R2C2'], ['R2C2', 'R2C3'],
  ['R1C2', 'R2C2'], ['R2C2', 'R3C2'],
  ['R4C2', 'R5C2'],
  ['R5C1', 'R5C2'], ['R5C2', 'R5C3'], ['R5C5', 'R5C6'],
  ['R2C7', 'R2C8'],
  ['R6C9', 'R7C9'],
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...grayCircleEdges.map(
    ([a, b]) => new Pair(grayCircleKey, 'gray circle', a, b)),
  new RegionSumLine('R3C1', 'R3C2', 'R3C3', 'R3C4', 'R3C5'),
  new RegionSumLine('R4C3', 'R4C4', 'R4C5', 'R4C6'),
  new RegionSumLine('R3C6', 'R2C7', 'R2C8'),
];
