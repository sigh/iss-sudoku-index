// Title: unknown
// Author: Richard Stolk
// Video: https://www.youtube.com/watch?v=qmmjYNwaowk
// Source: https://cracking-the-cryptic.web.app/sudoku/phN62739HR

// Normal sudoku rules (default rows/cols/boxes, no givens). The grid is
// fully partitioned into killer cages: digits within a cage are distinct
// and, where a total is printed, sum to it. A cage with no printed total is
// still distinct-only (`AllDifferent`). Additionally, if a digit appears in
// a cage it cannot also appear in any orthogonally connected cage -- i.e.
// any other cage sharing a grid edge with it, whether or not either carries
// a total. Cage-adjacency is derived below from the cage cell lists
// themselves rather than hand-enumerated, so it can't drift from them.
// Unioning an adjacent pair's cells under one `AllDifferent` expresses this
// exactly: each cage's own no-repeat rule still holds inside its own cells,
// and the union adds the missing cross-cage no-repeat.

// Cage cells and totals (null = no printed total), transcribed in drawn
// order from the source `cages` array.
const cages = [
  [null, 'R1C1'],
  [null, 'R1C2', 'R1C3', 'R2C2'],
  [18, 'R2C1', 'R3C1', 'R3C2'],
  [9, 'R2C3', 'R3C3'],
  [11, 'R4C1', 'R4C2'],
  [15, 'R5C1', 'R5C2', 'R6C1'],
  [null, 'R4C3', 'R5C3', 'R6C2', 'R6C3'],
  [15, 'R7C1', 'R8C1', 'R9C1'],
  [null, 'R7C2', 'R7C3', 'R8C3'],
  [null, 'R8C2', 'R9C2', 'R9C3'],
  [9, 'R8C4', 'R9C4'],
  [null, 'R7C4', 'R7C5'],
  [null, 'R7C6', 'R8C5', 'R8C6'],
  [11, 'R9C5', 'R9C6'],
  [24, 'R4C4', 'R5C4', 'R6C4', 'R6C5'],
  [null, 'R5C5'],
  [null, 'R4C5', 'R4C6', 'R5C6', 'R6C6'],
  [null, 'R2C4', 'R2C5', 'R3C4'],
  [null, 'R1C4', 'R1C5'],
  [13, 'R1C6', 'R2C6'],
  [null, 'R3C5', 'R3C6'],
  [null, 'R1C7', 'R1C8', 'R2C8'],
  [null, 'R2C7', 'R3C7', 'R3C8'],
  [17, 'R1C9', 'R2C9', 'R3C9'],
  [16, 'R4C7', 'R4C8', 'R5C7', 'R6C7'],
  [14, 'R4C9', 'R5C8', 'R5C9'],
  [null, 'R6C8', 'R6C9'],
  [5, 'R7C7', 'R8C7'],
  [null, 'R7C8', 'R7C9', 'R8C9'],
  [null, 'R9C9'],
  [19, 'R8C8', 'R9C7', 'R9C8'],
];

// Map each cell to its cage index, then find every pair of cages with a
// cell in one orthogonally adjacent to a cell in the other.
const graph = cellGraph('9x9');
const cageOfCell = new Map();
cages.forEach(([, ...cells], idx) => {
  for (const cell of cells) cageOfCell.set(cell, idx);
});

const adjacentPairs = new Set();
for (const [cellId, idx] of cageOfCell) {
  for (const neighborId of graph.neighbours(cellId)) {
    const neighborIdx = cageOfCell.get(neighborId);
    if (neighborIdx !== undefined && neighborIdx !== idx) {
      const key = idx < neighborIdx ? `${idx}_${neighborIdx}` : `${neighborIdx}_${idx}`;
      adjacentPairs.add(key);
    }
  }
}

const cageConstraints = cages.map(([total, ...cells]) =>
  total === null ? new AllDifferent(...cells) : new Cage(total, ...cells));

const adjacencyConstraints = [...adjacentPairs].map((key) => {
  const [i, j] = key.split('_').map(Number);
  return new AllDifferent(...cages[i].slice(1), ...cages[j].slice(1));
});

return [
  new Shape('9x9'),
  ...cageConstraints,
  ...adjacencyConstraints,
];
