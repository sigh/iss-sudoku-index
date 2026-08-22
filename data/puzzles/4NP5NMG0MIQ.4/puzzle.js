// Title: Dec 30, 2021: High/Low Sums
// Author: clover!
// Video: https://www.youtube.com/watch?v=4NP5NMG0MIQ
// Source: https://tinyurl.com/yz32mp2u

// Normal sudoku rules. A blue circle between two cells means those two
// digits sum to 5 or less; an orange square between two cells means those
// two digits sum to 15 or more. The rules state not every possible
// square/circle is necessarily marked, so unmarked edges carry no
// constraint (no exhaustive-marking negative to encode).

const shape = new Shape('9x9');

const givens = [
  ['R1C1', 2], ['R1C9', 7], ['R2C4', 7], ['R2C6', 3],
  ['R4C2', 6], ['R4C8', 4], ['R5C3', 3], ['R5C7', 6],
  ['R7C1', 3], ['R7C9', 8], ['R8C2', 7], ['R8C8', 2],
].map(([cell, value]) => new Given(cell, value));

// Blue circle edges (source `circle` structures), sum <= 5.
const blueCircleEdges = [
  ['R2C6', 'R2C7'], ['R2C7', 'R3C7'], ['R3C7', 'R3C8'], ['R3C8', 'R4C8'],
  ['R4C8', 'R4C9'], ['R1C6', 'R2C6'], ['R4C9', 'R5C9'], ['R1C1', 'R1C2'],
  ['R3C5', 'R4C5'], ['R4C4', 'R4C5'], ['R4C4', 'R5C4'], ['R5C3', 'R5C4'],
  ['R5C3', 'R6C3'], ['R6C2', 'R6C3'], ['R6C2', 'R7C2'], ['R7C1', 'R7C2'],
  ['R9C6', 'R9C7'], ['R9C7', 'R9C8'], ['R8C8', 'R9C8'],
];

// Orange square edges (source `rectangle` structures), sum >= 15.
const orangeSquareEdges = [
  ['R4C1', 'R5C1'], ['R4C1', 'R4C2'], ['R3C2', 'R4C2'], ['R3C2', 'R3C3'],
  ['R2C3', 'R3C3'], ['R2C3', 'R2C4'], ['R1C4', 'R2C4'], ['R1C4', 'R1C5'],
  ['R1C8', 'R1C9'], ['R4C6', 'R5C6'], ['R5C6', 'R5C7'], ['R5C7', 'R6C7'],
  ['R6C7', 'R6C8'], ['R6C8', 'R7C8'], ['R7C8', 'R7C9'], ['R8C2', 'R9C2'],
  ['R9C2', 'R9C3'], ['R9C3', 'R9C4'],
];

const lowSumKey = Pair.fnToKey((a, b) => a + b <= 5, shape);
const highSumKey = Pair.fnToKey((a, b) => a + b >= 15, shape);

const blueCircles = blueCircleEdges.map(
  ([a, b]) => new Pair(lowSumKey, 'blue circle', a, b));
const orangeSquares = orangeSquareEdges.map(
  ([a, b]) => new Pair(highSumKey, 'orange square', a, b));

return [shape, ...givens, ...blueCircles, ...orangeSquares];
