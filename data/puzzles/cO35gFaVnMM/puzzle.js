// Title: Surprising Stars
// Author: Ryan Adams
// Video: https://www.youtube.com/watch?v=cO35gFaVnMM
// Source: https://sudokupad.app/i3a78tp386

// The orange half-stars in diagonally opposite corners form one eight-cell star.
const stars = [
  ['R1C1', 'R1C2', 'R2C1', 'R3C1', 'R7C9', 'R8C9', 'R9C8', 'R9C9'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R8C1', 'R9C1', 'R9C2', 'R9C3'],
  ['R1C5', 'R2C5', 'R2C6', 'R2C7', 'R3C4', 'R3C5', 'R3C6', 'R4C6'],
  ['R3C2', 'R4C2', 'R4C3', 'R4C4', 'R5C1', 'R5C2', 'R5C3', 'R6C3'],
  ['R4C7', 'R5C7', 'R5C8', 'R5C9', 'R6C6', 'R6C7', 'R6C8', 'R7C8'],
  ['R6C4', 'R7C4', 'R7C5', 'R7C6', 'R8C3', 'R8C4', 'R8C5', 'R9C5'],
];

const xPairs = [
  ['R1C1', 'R1C2'],
  ['R2C1', 'R3C1'],
  ['R1C7', 'R1C8'],
  ['R1C9', 'R2C9'],
  ['R2C5', 'R3C5'],
  ['R5C2', 'R5C3'],
  ['R5C7', 'R5C8'],
  ['R7C5', 'R8C5'],
  ['R7C9', 'R8C9'],
  ['R8C1', 'R9C1'],
  ['R9C2', 'R9C3'],
  ['R9C8', 'R9C9'],
];

// Only X clues are exhaustive; unmarked pairs may still sum to 5.
const graph = cellGraph('9x9');
const markedX = new Set(xPairs.map(pair => pair.slice().sort().join('/')));
const unmarkedPairs = graph.cells().flatMap(cell =>
  graph.neighbours(cell)
    .filter(neighbour => cell < neighbour)
    .map(neighbour => [cell, neighbour])
).filter(pair => !markedX.has(pair.join('/')));
const notTenKey = Pair.fnToKey((a, b) => a + b !== 10, 9);
const horizontalStarts = unmarkedPairs
  .filter(([a, b]) => graph.step(a, 0, 1) === b)
  .map(([a]) => a);
const verticalStarts = unmarkedPairs
  .filter(([a, b]) => graph.step(a, 1, 0) === b)
  .map(([a]) => a);

return [
  new Shape('9x9'),

  // Every star is all-different and all six stars contain the same digit set.
  ...stars.map(cells => new AllDifferent(...cells)),
  new SameValues(stars.length, ...stars.flat()),

  ...xPairs.map(([a, b]) => new X(a, b)),
  graph.makeReplicate(
    new Pair(notTenKey, 'not 10', 'R1C1', 'R1C2'), horizontalStarts),
  graph.makeReplicate(
    new Pair(notTenKey, 'not 10', 'R1C1', 'R2C1'), verticalStarts),

  // Repeats are permitted by the cage rule, so this is a Sum rather than a Cage.
  new Sum(15, 'R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5'),
  new Thermo('R5C4', 'R4C5', 'R5C6', 'R6C5'),
];
