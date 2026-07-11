// Title: Golden Pointers
// Author: Hanks
// Video: https://www.youtube.com/watch?v=rIO26rioOLI
// Source: https://sudokupad.app/2e89u1hmiw

// Normal sudoku rules apply.
// Arrows: digits on an arrow sum to the digit in the attached circle.
// Golden cells: a cell is golden if it is on an arrow (circle cell
// included). No two orthogonally adjacent golden cells can contain
// consecutive digits.
// White dots: digits separated by a white dot are consecutive.

const arrows = [
  ['R4C1', 'R3C1', 'R2C1', 'R1C1'],
  ['R4C9', 'R3C9', 'R2C9', 'R1C9'],
  ['R4C5', 'R3C5', 'R2C5', 'R1C5'],
  ['R2C4', 'R2C3', 'R2C2'],
  ['R2C6', 'R2C7', 'R2C8'],
  ['R6C3', 'R7C3', 'R8C3', 'R9C3'],
  ['R6C2', 'R7C2', 'R8C2'],
  ['R7C7', 'R8C7', 'R9C7'],
  ['R6C8', 'R7C8', 'R8C8', 'R9C8'],
];

const whiteDots = [
  ['R1C5', 'R1C6'],
  ['R4C6', 'R5C6'],
];

const constraints = [
  new Shape('9x9'),
];

for (const cells of arrows) {
  constraints.push(new Arrow(...cells));
}

for (const [a, b] of whiteDots) {
  constraints.push(new WhiteDot(a, b));
}

// Golden cells are every cell that lies on an arrow.
const goldenCells = new Set();
for (const cells of arrows) {
  for (const cell of cells) goldenCells.add(cell);
}

// No two orthogonally adjacent golden cells may hold consecutive digits.
const graph = cellGraph('9x9');
const notConsecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);
const seenEdges = new Set();
for (const cell of goldenCells) {
  for (const neighbour of graph.neighbours(cell)) {
    if (!goldenCells.has(neighbour)) continue;
    const edgeKey = [cell, neighbour].sort().join('-');
    if (seenEdges.has(edgeKey)) continue;
    seenEdges.add(edgeKey);
    constraints.push(
      new Pair(notConsecutiveKey, 'golden not consecutive', cell, neighbour));
  }
}

return constraints;
