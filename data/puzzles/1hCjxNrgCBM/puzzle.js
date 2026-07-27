// Title: Hot Potato
// Author: sujoyku
// Video: https://www.youtube.com/watch?v=1hCjxNrgCBM
// Source: https://sudokupad.app/w0298g25jm

// Rules encoded:
// - Normal sudoku: rows, columns, and boxes all-different -- default Shape/box
//   behaviour, no NoBoxes needed (the grid's regions are the standard 3x3
//   boxes).
// - Killer cages: cage cells distinct and sum to the given total -- Cage.
// - Cage adjacency: two cages sharing a grid edge (any cell of one orthogonally
//   touching any cell of the other) must contain at least one common digit.
//   "Cage A and cage B share a digit" holds iff some cell of A equals some cell
//   of B in value (a shared digit witnesses such a matching pair; a matching
//   pair witnesses that its value is a shared digit), so each adjacent pair is
//   encoded as an Or of two-cell SameValues equalities over the full cross
//   product of the two cages' cells.

// Cage cell lists and totals transcribed from the drawn cage geometry
// (top-left cell holds the total, per the rules text).
const cages = [
  { total: 11, cells: ['R3C2', 'R4C2'] },
  { total: 8, cells: ['R5C2', 'R5C3'] },
  { total: 11, cells: ['R6C3', 'R7C3'] },
  { total: 13, cells: ['R2C1', 'R2C2'] },
  { total: 10, cells: ['R8C3', 'R8C4'] },
  { total: 7, cells: ['R8C5', 'R9C5'] },
  { total: 6, cells: ['R1C5', 'R2C5'] },
  { total: 11, cells: ['R2C6', 'R2C7'] },
  { total: 15, cells: ['R3C7', 'R4C7'] },
  { total: 12, cells: ['R5C7', 'R5C8'] },
  { total: 10, cells: ['R6C8', 'R7C8'] },
  { total: 12, cells: ['R8C8', 'R8C9'] },
  { total: 10, cells: ['R1C2', 'R1C3', 'R1C4'] },
  { total: 16, cells: ['R5C6', 'R6C6', 'R7C5', 'R7C6'] },
];

// Derive cage adjacency from the drawn cage cells rather than hand-listing
// pairs: two cages are adjacent when some cell of one orthogonally touches
// some cell of the other.
const graph = cellGraph('9x9');
const cageOf = new Map();
cages.forEach((cage, i) => cage.cells.forEach(c => cageOf.set(c, i)));

const adjacentPairs = [];
for (let i = 0; i < cages.length; i++) {
  const neighbourCages = new Set();
  for (const cell of cages[i].cells) {
    for (const n of graph.neighbours(cell)) {
      const j = cageOf.get(n);
      if (j !== undefined && j > i) neighbourCages.add(j);
    }
  }
  for (const j of neighbourCages) adjacentPairs.push([i, j]);
}

const shareDigit = (cellsA, cellsB) => new Or(
  cellsA.flatMap(a => cellsB.map(b => new SameValues(2, a, b)))
);

return [
  new Shape('9x9'),
  ...cages.map(({ total, cells }) => new Cage(total, ...cells)),
  ...adjacentPairs.map(([i, j]) => shareDigit(cages[i].cells, cages[j].cells)),
];
