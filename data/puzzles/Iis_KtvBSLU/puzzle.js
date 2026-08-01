// Title: Bene Divisa
// Author: Aleksandra Z
// Video: https://www.youtube.com/watch?v=Iis_KtvBSLU
// Source: https://app.crackingthecryptic.com/p683PqhgHD

// Normal Sudoku rules apply. Each digit must be a factor or multiple of at
// least one orthogonally adjacent digit; 1 is a factor of every digit.
const graph = cellGraph('9x9');
const factorOrMultiple = Pair.fnToKey((a, b) => a % b === 0 || b % a === 0, 9);

// Givens transcribed from the source payload.
const givens = [
  ['R1C3', 8], ['R1C7', 2], ['R1C8', 4], ['R2C4', 2], ['R3C1', 9],
  ['R4C5', 9], ['R4C8', 3], ['R4C9', 8], ['R5C1', 1], ['R5C4', 5],
  ['R5C6', 3], ['R6C5', 7], ['R7C2', 3], ['R8C7', 8], ['R8C9', 3],
  ['R9C2', 5], ['R9C8', 7],
];

// For each cell, one of its orthogonal neighbour pairs must satisfy the rule.
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
