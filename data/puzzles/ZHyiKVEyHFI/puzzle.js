// Title: Gilded Cages
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=ZHyiKVEyHFI
// Source: https://app.crackingthecryptic.com/sudoku/Mn6b323tMJ

// Normal sudoku rules apply. No repeats on the marked diagonal (anti-diagonal,
// R1C9 through R9C1). Each cage: digits do not repeat and sum to the given
// total. Each digit inside a cage is consecutive (differs by 1) with every
// orthogonally adjacent neighbour that lies outside the cage.
//
// The "consecutive with outside neighbours" rule is not itself a cage-shaped
// clue: it is derived below as one WhiteDot (Kropki, unmarked) pair per
// (cage cell, outside neighbour) edge, computed from each cage's own cell
// list and the grid's adjacency graph rather than hand-listed.

const graph = cellGraph('9x9');

// Cages, drawn as the killer-cage outlines in the source (data traced from
// the two cage overlays).
const cages = [
  { sum: 15, cells: ['R3C2', 'R3C3', 'R3C4', 'R4C4'] },
  { sum: 17, cells: ['R6C6', 'R6C7', 'R6C8', 'R7C6'] },
];

const consecutiveWithOutsideNeighbours = cages.flatMap(({ cells }) => {
  const inCage = new Set(cells);
  const pairs = [];
  for (const cell of cells) {
    for (const neighbour of graph.neighbours(cell)) {
      if (!inCage.has(neighbour)) pairs.push([cell, neighbour]);
    }
  }
  return pairs.map(([a, b]) => new WhiteDot(a, b));
});

return [
  new Shape('9x9'),
  new Diagonal(1), // anti-diagonal: R1C9-R9C1, matches the drawn line's endpoints.
  ...cages.map(({ sum, cells }) => new Cage(sum, ...cells)),
  ...consecutiveWithOutsideNeighbours,
];
