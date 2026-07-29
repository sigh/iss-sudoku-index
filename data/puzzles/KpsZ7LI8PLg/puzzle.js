// Title: Primal Roots
// Author: Matt Tressel
// Video: https://www.youtube.com/watch?v=KpsZ7LI8PLg
// Source: https://app.crackingthecryptic.com/7v7lat2oxd

// Standard 9x9 Sudoku. White dots join consecutive digits; black dots join
// digits in a 1:2 ratio. Not all possible dots are given. Prime digits cannot
// be orthogonally adjacent. Every 2 touches a 4, and every 3 touches a 9.
// Dot coordinates are transcribed from the drawn white and black edge marks.
const WHITE_DOTS = [
  ['R1C2', 'R2C2'], ['R4C1', 'R5C1'], ['R5C1', 'R5C2'],
  ['R9C2', 'R9C3'], ['R8C3', 'R9C3'], ['R1C4', 'R2C4'],
  ['R2C4', 'R3C4'], ['R4C4', 'R5C4'], ['R5C4', 'R6C4'],
  ['R2C8', 'R3C8'], ['R3C8', 'R4C8'], ['R4C8', 'R5C8'],
  ['R7C7', 'R7C8'], ['R7C8', 'R8C8'], ['R7C6', 'R7C7'],
];
const BLACK_DOTS = [
  ['R4C2', 'R5C2'], ['R2C2', 'R2C3'], ['R1C3', 'R2C3'],
  ['R9C1', 'R9C2'], ['R7C3', 'R8C3'], ['R7C4', 'R8C4'],
  ['R3C7', 'R4C7'], ['R7C8', 'R7C9'],
];

const graph = cellGraph('9x9');
const cells = graph.cells();

// Each custom Pair key is its truth table. The first forbids an adjacent pair
// of primes. The other two are directional: their first cell is the possible
// square root, and an Or over its neighbours requires the matching square.
const noPrimePair = Pair.fnToKey((a, b) =>
  !([2, 3, 5, 7].includes(a) && [2, 3, 5, 7].includes(b)), 9);
const twoHasFour = Pair.fnToKey((a, b) => a !== 2 || b === 4, 9);
const threeHasNine = Pair.fnToKey((a, b) => a !== 3 || b === 9, 9);

function rootRequirement(key, name, cell) {
  return new Or(graph.neighbours(cell).map(neighbour =>
    new Pair(key, name, cell, neighbour)));
}

function rootRequirements(key, name) {
  return cells.map(cell => rootRequirement(key, name, cell));
}

return [
  new Shape('9x9'),
  ...WHITE_DOTS.map(([a, b]) => new WhiteDot(a, b)),
  ...BLACK_DOTS.map(([a, b]) => new BlackDot(a, b)),
  // Horizontal and vertical edges are translated separately from R1C1.
  graph.makeReplicate(
    new Pair(noPrimePair, 'no adjacent primes', 'R1C1', 'R1C2'),
    cells.filter(cell => parseCellId(cell).col < 9),
  ),
  graph.makeReplicate(
    new Pair(noPrimePair, 'no adjacent primes', 'R1C1', 'R2C1'),
    cells.filter(cell => parseCellId(cell).row < 9),
  ),
  ...rootRequirements(twoHasFour, '2 touches 4'),
  ...rootRequirements(threeHasNine, '3 touches 9'),
];
