// Title: 10/23/23: Repeated Neighbors
// Author: clover!
// Video: https://www.youtube.com/watch?v=gxuYWm8Unss
// Source: https://tinyurl.com/3fbwy42j

// Normal Sudoku rules apply. For each grey cell, some pair among its orthogonal
// neighbours has equal digits; the grey cell is not itself in the pair.
const greyCells = [
  'R1C4', 'R1C7', 'R3C6', 'R3C9', 'R4C1', 'R4C3',
  'R6C7', 'R6C9', 'R7C1', 'R7C4', 'R9C3', 'R9C6',
]; // The twelve dark-grey cell fills in the source grid.

const graph = cellGraph('9x9');
const repeatedNeighbourConstraints = greyCells.map((cell) => {
  const neighbours = graph.neighbours(cell);
  const pairs = neighbours.flatMap((first, i) => neighbours
    .slice(i + 1)
    .map(second => new SameValues(2, first, second)));
  return new Or(pairs);
});

return [
  new Shape('9x9'),
  new Given('R1C3', 2), new Given('R1C7', 5), new Given('R1C9', 7),
  new Given('R3C1', 1), new Given('R3C3', 8), new Given('R3C7', 3), new Given('R3C9', 4),
  new Given('R4C4', 3), new Given('R4C6', 4), new Given('R5C5', 7),
  new Given('R6C4', 8), new Given('R6C6', 9), new Given('R7C1', 8),
  new Given('R7C3', 9), new Given('R7C7', 4), new Given('R7C9', 6),
  new Given('R9C1', 4), new Given('R9C3', 5), new Given('R9C7', 7),
  ...repeatedNeighbourConstraints,
];
