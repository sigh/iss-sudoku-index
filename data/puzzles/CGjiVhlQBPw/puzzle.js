// Title: Consecutive Bars Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=CGjiVhlQBPw
// Source: https://cracking-the-cryptic.web.app/sudoku/hgF8hMB8Nj

// Normal sudoku rules on the 9x9 grid (default rows/columns/3x3 boxes); no
// digits are given. A bar joins every pair of orthogonally adjacent cells
// whose digits are consecutive, and the rule is exhaustive ("wherever
// neighbouring digits are consecutive, a bar is shown"): any adjacent pair
// with no bar must NOT be consecutive. The two green cells sum to more than
// 10.

// Drawn bar positions (each a small white rect straddling one cell edge).
const barred = [
  ['R1C1', 'R1C2'], ['R2C1', 'R2C2'], ['R3C1', 'R3C2'], ['R7C1', 'R7C2'],
  ['R8C1', 'R8C2'], ['R9C2', 'R9C3'], ['R2C6', 'R2C7'], ['R3C6', 'R3C7'],
  ['R5C6', 'R5C7'], ['R5C5', 'R5C6'], ['R7C6', 'R7C7'], ['R7C8', 'R7C9'],
  ['R9C8', 'R9C9'], ['R9C6', 'R9C7'], ['R8C4', 'R8C5'], ['R7C3', 'R7C4'],
  ['R5C3', 'R5C4'], ['R3C3', 'R3C4'], ['R2C3', 'R2C4'], ['R5C8', 'R5C9'],
  ['R3C8', 'R3C9'], ['R1C2', 'R2C2'], ['R1C3', 'R2C3'], ['R3C3', 'R4C3'],
  ['R4C2', 'R5C2'], ['R4C1', 'R5C1'], ['R6C2', 'R7C2'], ['R6C3', 'R7C3'],
  ['R8C1', 'R9C1'], ['R8C3', 'R9C3'], ['R8C5', 'R9C5'], ['R6C5', 'R7C5'],
  ['R3C5', 'R4C5'], ['R1C7', 'R2C7'], ['R1C8', 'R2C8'], ['R3C7', 'R4C7'],
  ['R6C7', 'R7C7'], ['R6C8', 'R7C8'], ['R7C9', 'R8C9'], ['R8C7', 'R9C7'],
];

const bars = barred.map(([a, b]) => new WhiteDot(a, b));

// Every orthogonally adjacent pair NOT in `barred` is constrained negative
// (the exhaustive-marking clause above). Derive the unmarked pairs from the
// grid's own adjacency graph rather than hand-listing 104 pairs, and use
// Replicate to shift one horizontal and one vertical "not consecutive"
// template onto each unmarked origin instead of stamping 104 near-identical
// Pair constraints.
const graph = cellGraph('9x9');
const barredKeys = new Set(barred.map(([a, b]) => [a, b].sort().join('-')));
const notConsecutiveKey = Pair.fnToKey(
  (a, b) => a !== b + 1 && a !== b - 1, 9);

const horizStarts = [];
const vertStarts = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 8; c++) {
    const a = makeCellId(r, c), b = makeCellId(r, c + 1);
    if (!barredKeys.has([a, b].sort().join('-'))) horizStarts.push(a);
  }
}
for (let c = 1; c <= 9; c++) {
  for (let r = 1; r <= 8; r++) {
    const a = makeCellId(r, c), b = makeCellId(r + 1, c);
    if (!barredKeys.has([a, b].sort().join('-'))) vertStarts.push(a);
  }
}

const negatives = [
  graph.makeReplicate(
    new Pair(notConsecutiveKey, 'not consecutive (horiz)', 'R1C1', 'R1C2'),
    horizStarts),
  graph.makeReplicate(
    new Pair(notConsecutiveKey, 'not consecutive (vert)', 'R1C1', 'R2C1'),
    vertStarts),
];

// The two green cells (R3C5, R4C5) sum to more than 10.
const greenSumKey = Pair.fnToKey((a, b) => a + b > 10, 9);

return [
  new Shape('9x9'),
  ...bars,
  ...negatives,
  new Pair(greenSumKey, 'green sum > 10', 'R3C5', 'R4C5'),
];
