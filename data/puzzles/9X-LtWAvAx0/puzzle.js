// Title: PrimeSweeper Sudoku
// Author: SenatorGronk
// Video: https://www.youtube.com/watch?v=9X-LtWAvAx0
// Source: https://cracking-the-cryptic.web.app/sudoku/fMNd7nJMrt

// Rules encoded here:
//  - Normal sudoku: rows, columns and 3x3 boxes each hold 1-9 once (the
//    payload's 9 drawn regions are the standard boxes).
//  - "All instances of a digit showing the number of primes surrounding it
//    (including diagonally) are marked with a circle": for every cell, let
//    its neighbour-prime-count be the number of its up-to-8 king-move
//    neighbours whose digit is 2, 3, 5 or 7. Exhaustive marking (the "all
//    instances" clause) means a circled cell's digit equals that count AND
//    an uncircled cell's digit does not.
//  - "Identical circles must contain different digits": the 14 drawn
//    circles come in three visually distinct renderings -- solid grey fill,
//    hollow grey border, purple fill with grey border. Each rendering's
//    cells are pairwise different.

const graph = cellGraph('9x9');
const cells = graph.cells();
const isPrimeDigit = d => d === 2 || d === 3 || d === 5 || d === 7;

// primeFlags.at(cell): an aux 1-9 Var, 2 when `cell`'s digit is prime, else
// 1. Encoded as {1,2} rather than {0,1} so it fits the default 1-9 domain
// with no widened Shape.
const primeFlags = graph.makeOverlay('VP');
const primeFlagKey = Pair.fnToKey(
  (digit, flag) => flag === (isPrimeDigit(digit) ? 2 : 1), 9);
const primeFlagPairs = cells.map(
  cell => new Pair(primeFlagKey, 'prime flag', cell, primeFlags.at(cell)));

// counts.at(cell): an aux 1-9 Var holding (neighbour-prime-count of `cell`)
// + 1 -- shifted by one so the 0-8 range fits the default 1-9 domain.
const counts = graph.makeOverlay('VN');
const countSumConstraints = cells.map(cell => {
  const neighbours = graph.kingNeighbours(cell);
  const n = neighbours.length;
  const flagCells = primeFlags.at(neighbours);
  // Each flag is 1 or 2, so sum(flags) = n + primeCount(neighbours).
  // Want countVar = primeCount(neighbours) + 1 = sum(flags) - (n - 1):
  //   countVar - sum(flags) = -(n - 1)
  return new Sum(
    -(n - 1),
    [counts.at(cell), 1],
    ...flagCells.map(fc => [fc, -1]));
});

// Circle groups, transcribed from the drawn overlays by rendering (fill/
// border colour combination).
const filledCircles =
  ['R2C6', 'R3C6', 'R3C7', 'R1C9', 'R1C1', 'R8C2', 'R8C8', 'R6C3'];
const hollowCircles = ['R6C9', 'R4C8', 'R4C1', 'R1C2'];
const purpleCircles = ['R4C3', 'R6C6'];
const circledCells =
  new Set([...filledCircles, ...hollowCircles, ...purpleCircles]);

// Marker rule (exhaustive): circled cells match digit == count; every other
// cell must not.
const matchKey = Pair.fnToKey((digit, countVar) => digit + 1 === countVar, 9);
const noMatchKey =
  Pair.fnToKey((digit, countVar) => digit + 1 !== countVar, 9);
const markerConstraints = cells.map(cell => new Pair(
  circledCells.has(cell) ? matchKey : noMatchKey,
  circledCells.has(cell) ? 'circled: digit matches count' :
    'uncircled: digit does not match count',
  cell, counts.at(cell)));

return [
  new Shape('9x9'),
  primeFlags.toVar('prime flags'),
  counts.toVar('neighbour prime counts (+1)'),
  ...primeFlagPairs,
  ...countSumConstraints,
  ...markerConstraints,
  new AllDifferent(...filledCircles),
  new AllDifferent(...hollowCircles),
  new AllDifferent(...purpleCircles),
];
