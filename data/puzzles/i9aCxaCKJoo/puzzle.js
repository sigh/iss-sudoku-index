// Title: Incremental
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=i9aCxaCKJoo
// Source: https://tinyurl.com/wkwud9zw

// Normal sudoku rules apply. 19 killer cages carry no printed totals: their
// only stated rule is "digits cannot repeat within a cage" (AllDifferent).
// "The difference between the sums of the digits in any two orthogonally
// adjacent cages is exactly 1" is checked between every pair of cages that
// share a grid edge (derived below from the cage cell lists via the cell
// graph, not hand-enumerated), each as Or(sumA - sumB = 1, sumA - sumB = -1).
// One white dot: the joined cells hold consecutive digits.

// Cage cell lists, transcribed from the drawn cage geometry (order as
// drawn; no cage carries a total).
const cages = [
  ['R1C1', 'R1C2', 'R1C3'],
  ['R2C2', 'R2C3', 'R3C3'],
  ['R1C4', 'R1C5'],
  ['R2C4', 'R2C5', 'R3C4'],
  ['R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C9'],
  ['R2C6', 'R2C7', 'R2C8'],
  ['R3C7', 'R3C8'],
  ['R3C9', 'R4C9'],
  ['R3C1', 'R4C1'],
  ['R5C1', 'R5C2'],
  ['R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7'],
  ['R5C8', 'R5C9'],
  ['R6C9', 'R7C9'],
  ['R8C9', 'R9C8', 'R9C9'],
  ['R8C6', 'R8C7'],
  ['R7C4', 'R8C4', 'R9C4', 'R9C5', 'R9C6'],
  ['R7C3', 'R8C3', 'R9C3'],
  ['R7C1', 'R8C1', 'R9C1'],
  ['R6C2', 'R7C2'],
];

// White dot, from the drawn dot overlay.
const dot = ['R4C7', 'R4C8'];

const cageOf = new Map();
cages.forEach((cells, i) => cells.forEach(c => cageOf.set(c, i)));

// Cage adjacency: pairs of cages with a cell in each that are orthogonally
// adjacent, derived from the cage cell lists rather than hand-enumerated.
const graph = cellGraph('9x9');
const adjacentPairs = new Set();
for (const [cell, cageIndex] of cageOf) {
  for (const neighbour of graph.neighbours(cell)) {
    const neighbourCage = cageOf.get(neighbour);
    if (neighbourCage !== undefined && neighbourCage !== cageIndex) {
      const key = [cageIndex, neighbourCage].sort((a, b) => a - b).join(',');
      adjacentPairs.add(key);
    }
  }
}

const diffConstraints = [...adjacentPairs].map(key => {
  const [a, b] = key.split(',').map(Number);
  const plus = cages[a].map(c => [c, 1]).concat(cages[b].map(c => [c, -1]));
  return new Or([new Sum(1, ...plus), new Sum(-1, ...plus)]);
});

return [
  new Shape('9x9'),
  ...cages.map(cells => new AllDifferent(...cells)),
  new WhiteDot(...dot),
  ...diffConstraints,
];
