// Title: The 13 Minute Sudoku Barrier
// Author: Akash Doulani
// Video: https://www.youtube.com/watch?v=lY569lv-x-s
// Source: https://cracking-the-cryptic.web.app/sudoku/GqNML4m32D

// Normal sudoku rules apply. If the sum of digits in two orthogonally
// adjacent cells is 10 then they are separated by an X; if the sum is 5
// then they are separated by a V. All possible X & V are marked, so
// StrictXV additionally forbids sum-10 and sum-5 on every unmarked
// adjacent pair.

const givens = [
  // Drawn digits from `cells`.
  ['R2C1', 1], ['R2C9', 5],
  ['R3C2', 4], ['R3C8', 9],
  ['R4C3', 7], ['R4C7', 8],
];

// Drawn X edges, from `overlays`.
const xEdges = [
  ['R1C2', 'R2C2'],
  ['R2C3', 'R3C3'],
  ['R3C4', 'R4C4'],
  ['R3C6', 'R4C6'],
  ['R3C6', 'R3C7'],
  ['R2C7', 'R3C7'],
  ['R1C8', 'R2C8'],
  ['R4C9', 'R5C9'],
  ['R5C5', 'R5C6'],
  ['R8C5', 'R8C6'],
  ['R8C7', 'R8C8'],
  ['R8C4', 'R9C4'],
  ['R7C1', 'R8C1'],
];

// Drawn V edge, from `overlays`.
const vEdges = [
  ['R8C3', 'R8C4'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...xEdges.map(([a, b]) => new X(a, b)),
  ...vEdges.map(([a, b]) => new V(a, b)),
  // Enforces the "all X & V marked" exhaustiveness: no unmarked adjacent
  // pair sums to 10 or 5.
  new StrictXV(),
];
