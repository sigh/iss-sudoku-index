// Title: Mad Dogs and English Names
// Author: David Rutten
// Video: https://www.youtube.com/watch?v=fooaoPJcdF4
// Source: https://sudokupad.app/8w2995rgim

// Normal Sudoku rules apply.
// Black dots mark a 1:2 ratio, and all possible black dots are given.
// Digits in each cage sum to its total.
// Orthogonally adjacent digits have English names of different lengths.

const blackDots = [
  ['R2C2', 'R2C3'],
  ['R1C4', 'R1C5'],
  ['R2C5', 'R3C5'],
  ['R3C4', 'R4C4'],
  ['R3C7', 'R3C8'],
  ['R1C8', 'R2C8'],
  ['R4C7', 'R5C7'],
  ['R5C9', 'R6C9'],
  ['R6C9', 'R7C9'],
  ['R6C8', 'R6C9'],
  ['R6C6', 'R7C6'],
  ['R8C5', 'R8C6'],
  ['R8C6', 'R9C6'],
  ['R9C6', 'R9C7'],
  ['R8C9', 'R9C9'],
];

const graph = cellGraph();
const pairId = (a, b) => [a, b].sort().join('-');
const dottedPairIds = new Set(blackDots.map(cells => pairId(...cells)));
const horizontalStarts = graph.cells().filter(cell => graph.step(cell, 0, 1));
const verticalStarts = graph.cells().filter(cell => graph.step(cell, 1, 0));
const undottedHorizontalStarts = horizontalStarts.filter(cell =>
  !dottedPairIds.has(pairId(cell, graph.step(cell, 0, 1))));
const undottedVerticalStarts = verticalStarts.filter(cell =>
  !dottedPairIds.has(pairId(cell, graph.step(cell, 1, 0))));

const notRatioKey = Pair.fnToKey(
  (a, b) => a !== 2 * b && b !== 2 * a,
  9,
);
const englishNameLengths = [0, 3, 3, 5, 4, 4, 3, 5, 5, 4];
const differentNameLengthKey = Pair.fnToKey(
  (a, b) => englishNameLengths[a] !== englishNameLengths[b],
  9,
);

return [
  new Shape('9x9'),
  new Cage(8, 'R1C1', 'R2C1'),
  new Cage(10, 'R8C8', 'R9C8'),
  ...blackDots.map(cells => new BlackDot(...cells)),
  graph.makeReplicate(
    new Pair(notRatioKey, 'not 1:2', 'R1C1', 'R1C2'),
    undottedHorizontalStarts,
  ),
  graph.makeReplicate(
    new Pair(notRatioKey, 'not 1:2', 'R1C1', 'R2C1'),
    undottedVerticalStarts,
  ),
  graph.makeReplicate(
    new Pair(differentNameLengthKey, 'different English-name lengths', 'R1C1', 'R1C2'),
    horizontalStarts,
  ),
  graph.makeReplicate(
    new Pair(differentNameLengthKey, 'different English-name lengths', 'R1C1', 'R2C1'),
    verticalStarts,
  ),
];
