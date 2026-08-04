// Title: 3/4/23: Consecutive Chains
// Author: clover!
// Video: https://www.youtube.com/watch?v=MhlzTkWXXEM
// Source: https://tinyurl.com/bdefmnek

// Normal sudoku rules apply. Each gray area contains the digits 1-9 exactly
// once each (AllDifferent), and these digits must form a consecutive chain
// of adjacent digits from 1 to 9 by moving horizontally or vertically from
// one cell to the next: for every k in 1..8, the cells holding k and k+1
// must be orthogonally adjacent.
//
// Encoded per region as AllDifferent(9 cells) plus, for every pair of the
// region's cells that are NOT orthogonally adjacent, a Pair forbidding their
// values from being consecutive. That leaves adjacency as the only place
// consecutive digits are allowed to land, which forces the 1..9 assignment
// to trace an adjacency path through the region -- without needing a
// separate path/position overlay, since the digit value already is the
// path position.

// Gray (#A8A8A8) cell coordinates transcribed from the puzzle's per-cell
// shading, split into their three orthogonally-connected 9-cell components.
const regions = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R4C2'],
  ['R3C5', 'R4C5', 'R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5', 'R7C5'],
  ['R6C8', 'R7C8', 'R7C9', 'R8C7', 'R8C8', 'R8C9', 'R9C7', 'R9C8', 'R9C9'],
];

const graph = cellGraph('9x9');
// Predicate for the Pair below: true (allowed) unless the two cells' values
// are consecutive integers.
const notConsecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);

const regionConstraints = regions.flatMap((cells, i) => {
  const nonAdjacentPairs = [];
  for (let a = 0; a < cells.length; a++) {
    for (let b = a + 1; b < cells.length; b++) {
      if (!graph.neighbours(cells[a]).includes(cells[b])) {
        nonAdjacentPairs.push([cells[a], cells[b]]);
      }
    }
  }
  return [
    new AllDifferent(...cells),
    ...nonAdjacentPairs.map(([a, b]) =>
      new Pair(notConsecutiveKey, `chain${i}`, a, b)),
  ];
});

return [
  new Shape('9x9'),

  // Givens, transcribed from the puzzle payload.
  new Given('R1C9', 6),
  new Given('R2C6', 8),
  new Given('R2C8', 7),
  new Given('R3C9', 2),
  new Given('R7C1', 4),
  new Given('R8C2', 1),
  new Given('R8C4', 3),
  new Given('R9C1', 2),

  ...regionConstraints,
];
