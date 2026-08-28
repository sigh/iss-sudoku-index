// Title: Oct 10, 2021: Odd Sum Pair
// Author: clover!
// Video: https://www.youtube.com/watch?v=B1GJadtsIRg
// Source: https://tinyurl.com/yn8r37hp
//
// Normal sudoku rules. Each dot below joins two orthogonally adjacent cells
// whose digits must sum to an odd value (i.e. one odd, one even). Dots are
// not exhaustively marked, so unmarked adjacent pairs carry no constraint --
// only the drawn pairs are encoded.

const oddSum = Pair.fnToKey((a, b) => (a + b) % 2 === 1, 9);

// Drawn dot pairs (each cell pair is an orthogonally adjacent edge).
const dotPairs = [
  ['R2C1', 'R3C1'], ['R1C4', 'R1C5'], ['R5C8', 'R6C8'], ['R3C8', 'R2C8'],
  ['R8C9', 'R9C9'], ['R8C2', 'R7C2'], ['R2C1', 'R1C1'], ['R9C5', 'R9C6'],
  ['R5C5', 'R5C4'], ['R4C5', 'R5C5'], ['R2C3', 'R1C3'], ['R4C2', 'R3C2'],
  ['R6C8', 'R6C7'], ['R1C5', 'R1C6'], ['R3C3', 'R2C3'], ['R4C2', 'R4C1'],
  ['R8C7', 'R7C7'], ['R6C8', 'R7C8'], ['R5C2', 'R4C2'], ['R2C8', 'R1C8'],
  ['R9C2', 'R8C2'], ['R4C2', 'R4C3'], ['R5C6', 'R5C5'], ['R7C9', 'R8C9'],
  ['R6C8', 'R6C9'], ['R8C7', 'R9C7'], ['R9C4', 'R9C5'], ['R5C5', 'R6C5'],
];

const dots = dotPairs.map(
  ([a, b], i) => new Pair(oddSum, `OddSumDot${i}`, a, b));

return [
  new Shape('9x9'),

  new Given('R1C7', 6), new Given('R1C9', 5),
  new Given('R2C7', 3), new Given('R2C9', 4),
  new Given('R3C6', 7), new Given('R3C7', 1),
  new Given('R4C2', 1), new Given('R4C8', 2),
  new Given('R5C5', 3),
  new Given('R6C2', 4), new Given('R6C8', 5),
  new Given('R7C3', 7), new Given('R7C4', 5),
  new Given('R8C1', 2), new Given('R8C3', 9),
  new Given('R9C1', 1), new Given('R9C3', 8),

  ...dots,
];
