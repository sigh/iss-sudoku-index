// Title: 3 - 2 - 1 - GO
// Author: billybeth
// Video: https://www.youtube.com/watch?v=WhCYbISOzms
// Source: https://sudokupad.app/9n35i2v0ov

// Standard Sudoku. Killer cages sum to their clues. Equal digits cannot be a
// king's move apart. The black-dot rule is global, but no black dots are drawn,
// so every orthogonally adjacent pair must avoid a 1:2 ratio. This rule applies
// only to black dots; it does not forbid unmarked consecutive pairs.

const givens = [
  ['R2C5', 3], ['R2C6', 2], ['R2C8', 1],
  ['R3C8', 3], ['R3C9', 2],
  ['R4C1', 3],
  ['R5C5', 2],
  ['R6C9', 1],
  ['R8C7', 3], ['R8C8', 2],
  ['R9C3', 3], ['R9C4', 2], ['R9C7', 1],
];

const cages = [
  [12, 'R1C7', 'R2C7'],
  [11, 'R5C2', 'R6C2'],
  [13, 'R7C3', 'R8C3'],
  [11, 'R4C8', 'R5C8'],
];

const graph = cellGraph('9x9');
const noRatioKey = Pair.fnToKey(
  (a, b) => a !== 2 * b && b !== 2 * a,
  9,
);
const horizontalStarts = graph.cells().filter(
  cell => graph.step(cell, 0, 1) !== null,
);
const verticalStarts = graph.cells().filter(
  cell => graph.step(cell, 1, 0) !== null,
);
const negativeRatioConstraints = [
  graph.makeReplicate(
    new Pair(noRatioKey, 'not 1:2', 'R1C1', 'R1C2'),
    horizontalStarts,
  ),
  graph.makeReplicate(
    new Pair(noRatioKey, 'not 1:2', 'R1C1', 'R2C1'),
    verticalStarts,
  ),
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  new AntiKing(),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...negativeRatioConstraints,
];
