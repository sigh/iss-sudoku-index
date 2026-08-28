// Title: Factor Attractor
// Author: Volatility
// Video: https://www.youtube.com/watch?v=kE_Jb_4IeH4
// Source: https://cracking-the-cryptic.web.app/sudoku/4PLfPt72pN

// Normal Sudoku rules apply (standard 3x3 box regions; no other drawn
// geometry in the payload). Rules text, from the video description (not
// present in the payload itself): "Each digit is either a multiple or a
// factor of an orthogonally adjacent digit." The indefinite article ("an
// orthogonally adjacent digit", not "every"/"each") reads as existential:
// each cell needs at least one qualifying neighbour, not all of them. This
// pipeline's negative counterpart of the same phrase ("may not be a
// multiple or divisor of an orthogonally adjacent digit", MMe5c_zxF0k)
// negates to universal ("not, for all neighbours"), confirming the
// un-negated form is existential ("for at least one neighbour").
const graph = cellGraph('9x9');
const factorOrMultiple = Pair.fnToKey((a, b) => a % b === 0 || b % a === 0, 9);

// Givens transcribed from the source payload.
const givens = [
  ['R1C1', 4], ['R1C8', 6],
  ['R2C2', 3],
  ['R3C5', 6],
  ['R4C4', 4], ['R4C6', 2], ['R4C9', 5],
  ['R5C3', 9], ['R5C7', 4],
  ['R6C1', 5], ['R6C4', 9], ['R6C6', 6],
  ['R7C5', 3],
  ['R9C2', 7],
];

// For each cell, at least one of its orthogonal neighbours must satisfy the
// factor-or-multiple relation with it.
const adjacencyRule = graph.cells().map(cell => new Or(
  [[-1, 0], [0, -1], [0, 1], [1, 0]]
    .map(([dR, dC]) => graph.step(cell, dR, dC))
    .filter(Boolean)
    .map(neighbour => new Pair(factorOrMultiple, '', cell, neighbour))
));

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...adjacencyRule,
];
