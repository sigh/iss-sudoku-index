// Title: July 13, 2023: GAS, Kansas
// Author: clover!
// Video: https://www.youtube.com/watch?v=Wwm1MZqLneE
// Source: https://tinyurl.com/ycyy4ahr
//
// Normal 8x8 sudoku: Shape('8x8') gives the default 2-row-by-4-column boxes,
// which is exactly the "2x4 region" the rules name -- no explicit regions
// needed. Additional rule: for every pair of orthogonally-adjacent cells
// whose shared edge lies on a box boundary (the bold region border), one
// digit is odd and the other even. The box-border edges below are derived
// from the grid's own box partition rather than hand-listed.

const shape = new Shape('8x8');
const graph = cellGraph(shape);

const boxOf = new Map();
graph.boxes().forEach((box, i) => box.forEach(cell => boxOf.set(cell, i)));

const seenEdges = new Set();
const borderPairs = [];
for (const cell of graph.cells()) {
  for (const n of graph.neighbours(cell)) {
    if (boxOf.get(cell) === boxOf.get(n)) continue;
    const edgeKey = [cell, n].sort().join('-');
    if (seenEdges.has(edgeKey)) continue;
    seenEdges.add(edgeKey);
    borderPairs.push([cell, n]);
  }
}

// One odd/even Pair per box-border edge (independent dominoes, not a chain).
const parityKey = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), shape);
const boxBorderParity = borderPairs.map(
  ([a, b]) => new Pair(parityKey, '', a, b));

return [
  shape,

  // Givens -- transcribed from the puzzle's given cells.
  new Given('R1C1', 1), new Given('R1C2', 2), new Given('R1C5', 6),
  new Given('R2C4', 7), new Given('R2C7', 3), new Given('R2C8', 4),
  new Given('R4C2', 6), new Given('R4C6', 3),
  new Given('R5C3', 1), new Given('R5C7', 6),
  new Given('R7C1', 7), new Given('R7C2', 8), new Given('R7C5', 3),
  new Given('R8C4', 2), new Given('R8C7', 5), new Given('R8C8', 6),

  ...boxBorderParity,
];
