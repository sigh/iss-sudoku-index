// Title: Irregular Miracle
// Author: GBPack
// Video: https://www.youtube.com/watch?v=dU_6RQSiaTk
// Source: https://app.crackingthecryptic.com/JJmHt3fHnt

// Place 1-6 once in every row, column, and irregular region. For each
// horizontal pair read left-to-right and vertical pair read top-to-bottom, the
// two-digit number is neither prime nor a perfect square.
const shape = new Shape('6x6');
const graph = cellGraph(shape);

// The six outlined irregular regions, transcribed from the drawn region borders.
const regions = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6'],
  ['R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R3C5'],
  ['R2C1', 'R3C1', 'R3C2', 'R3C3', 'R4C2', 'R4C3'],
  ['R3C4', 'R3C6', 'R4C4', 'R4C5', 'R4C6', 'R5C6'],
  ['R4C1', 'R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5'],
  ['R6C1', 'R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6'],
];

// In the 1-6 alphabet, these are the two-digit primes and squares.
const forbiddenNumbers = new Set([11, 13, 16, 23, 25, 31, 36, 41, 43, 49, 53, 61, 64]);
const allowedPairKey = Pair.fnToKey((tens, ones) =>
  !forbiddenNumbers.has(tens * 10 + ones), shape);
const horizontalStarts = graph.cells().filter(cell => graph.step(cell, 0, 1));
const verticalStarts = graph.cells().filter(cell => graph.step(cell, 1, 0));
const numberPairs = [
  graph.makeReplicate(
    new Pair(allowedPairKey, 'not prime or square', 'R1C1', 'R1C2'), horizontalStarts),
  graph.makeReplicate(
    new Pair(allowedPairKey, 'not prime or square', 'R1C1', 'R2C1'), verticalStarts),
];

return [
  shape,
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw('6x6', ...cells)),
  ...numberPairs,
];
