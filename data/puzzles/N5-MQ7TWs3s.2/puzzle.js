// Title: July 15, 2022: Makodoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=N5-MQ7TWs3s
// Source: https://tinyurl.com/32pyjkcb

// Normal sudoku rules apply. A "+" mark on the edge between two orthogonally
// adjacent cells means their digits sum to less than 10; a "x" mark means
// their digits multiply to less than 10. Marks are not exhaustive: an
// unmarked adjacent pair is unconstrained by this rule (may or may not
// satisfy either condition), so absence of a mark is not encoded.

const shape = new Shape('9x9');

const givens = [
  ['R1C3', 9], ['R1C7', 4],
  ['R2C2', 7], ['R2C8', 6],
  ['R3C3', 5], ['R3C7', 3],
  ['R5C1', 1], ['R5C5', 9], ['R5C9', 7],
  ['R7C3', 8], ['R7C7', 6],
  ['R8C2', 4], ['R8C8', 2],
  ['R9C3', 6], ['R9C7', 7],
].map(([cell, value]) => new Given(cell, value));

// Edge pairs transcribed from the drawn "+"/"x" circle marks, each sitting
// on the border between an orthogonally adjacent cell pair.
const sumPairCells = [
  ['R3C3', 'R3C4'],
  ['R3C6', 'R3C7'],
  ['R3C9', 'R4C9'],
  ['R3C5', 'R4C5'],
  ['R3C4', 'R4C4'],
  ['R3C6', 'R4C6'],
  ['R5C2', 'R5C3'],
  ['R8C1', 'R8C2'],
];
const productPairCells = [
  ['R3C1', 'R4C1'],
  ['R1C3', 'R1C4'],
  ['R1C4', 'R1C5'],
  ['R1C5', 'R1C6'],
  ['R1C6', 'R1C7'],
  ['R5C7', 'R5C8'],
  ['R6C4', 'R6C5'],
  ['R6C5', 'R6C6'],
  ['R8C2', 'R9C2'],
  ['R8C8', 'R9C8'],
  ['R8C8', 'R8C9'],
];

// Pair.fnToKey builds the binary truth table over the grid's digit range
// (1-9); one Pair per marked edge keeps each mark an independent clue.
const sumLessThan10Key = Pair.fnToKey((a, b) => a + b < 10, 9);
const productLessThan10Key = Pair.fnToKey((a, b) => a * b < 10, 9);

const sumPairs = sumPairCells.map(
  ([a, b]) => new Pair(sumLessThan10Key, 'sum < 10', a, b));
const productPairs = productPairCells.map(
  ([a, b]) => new Pair(productLessThan10Key, 'product < 10', a, b));

return [shape, ...givens, ...sumPairs, ...productPairs];
