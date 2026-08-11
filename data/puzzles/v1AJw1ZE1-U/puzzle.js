// Title: Par 9
// Author: Dragonoidrules & Tyrgannus
// Video: https://www.youtube.com/watch?v=v1AJw1ZE1-U
// Source: https://app.crackingthecryptic.com/sudoku/9LmpFnQr2F

// Normal sudoku rules (rows, columns, boxes -- the payload's 9 regions are
// the standard 3x3 boxes). 20 'Putteria' cages partition 73 of the 81 cells
// (none carry a printed total). A cage of size N must contain the digit N,
// and that N cannot repeat within the cage -- together, exactly one N per
// cage, which ContainExact states directly. Other digits may repeat within
// a cage (no all-different beyond the row/column/box defaults). A cell
// holding its own cage's N is a "putteria number"; two putteria numbers may
// not be orthogonally adjacent. The 8 cells outside every cage have no N of
// their own and so can never be a putteria number.

const givens = [
  new Given('R1C4', 6),
  new Given('R1C7', 7),
  new Given('R2C2', 8),
  new Given('R3C9', 8),
  new Given('R5C1', 8),
  new Given('R5C5', 6),
  new Given('R5C9', 1),
  new Given('R7C1', 1),
  new Given('R8C8', 9),
  new Given('R9C3', 6),
  new Given('R9C6', 9),
];

// Cages transcribed from the puzzle's own cage layout, in each cage's own
// cell order; none carry a printed total.
const cages = [
  ['R2C3', 'R1C3', 'R1C2', 'R1C1', 'R2C1'],
  ['R2C2', 'R3C2', 'R3C1', 'R4C1'],
  ['R4C2', 'R5C2'],
  ['R5C1', 'R6C1', 'R7C1', 'R6C2', 'R7C2', 'R7C3'],
  ['R8C2', 'R8C1', 'R9C1'],
  ['R8C3', 'R9C3', 'R9C4', 'R9C5', 'R9C6'],
  ['R7C5', 'R8C4', 'R8C6', 'R8C5'],
  ['R6C5', 'R6C4', 'R7C4'],
  ['R6C3', 'R5C3', 'R5C4', 'R4C4'],
  ['R4C3', 'R3C3', 'R3C4'],
  ['R3C5', 'R2C4', 'R1C4', 'R2C5', 'R1C5'],
  ['R1C6', 'R2C6'],
  ['R2C7', 'R1C7', 'R1C8', 'R1C9', 'R2C9'],
  ['R3C8', 'R3C9', 'R4C9'],
  ['R4C7', 'R4C6', 'R4C5', 'R5C5'],
  ['R5C6', 'R6C6', 'R6C7', 'R6C8'],
  ['R5C9'],
  ['R6C9', 'R7C9', 'R7C8'],
  ['R8C7', 'R8C9', 'R9C7', 'R9C9', 'R9C8'],
  ['R7C7', 'R7C6'],
];

// "Must contain N" + "N cannot repeat" together: exactly one N per cage.
const putteriaCages = cages.map(
  cells => new ContainExact(String(cells.length), ...cells));

// Map every cage cell to its cage index and size so the no-touch rule is
// derived from the same drawn cage table above, not a hand-listed edge set.
const cellCageIndex = new Map();
const cellCageSize = new Map();
cages.forEach((cells, idx) => {
  for (const cell of cells) {
    cellCageIndex.set(cell, idx);
    cellCageSize.set(cell, cells.length);
  }
});

// Two putteria numbers cannot be orthogonally adjacent. Scan every grid
// edge once; an edge inside one cage is already covered by that cage's
// ContainExact (only one N possible in the cage), so only cross-cage edges
// between two cage cells need an explicit check here. Each Pair forbids its
// two fixed cage sizes (sizeA, sizeB) from landing on (cellA, cellB) at once.
const graph = cellGraph('9x9');
const seenEdges = new Set();
const noTouchPairs = [];
for (const cell of graph.cells()) {
  for (const nb of graph.neighbours(cell)) {
    const edgeKey = cell < nb ? `${cell}|${nb}` : `${nb}|${cell}`;
    if (seenEdges.has(edgeKey)) continue;
    seenEdges.add(edgeKey);
    if (!cellCageSize.has(cell) || !cellCageSize.has(nb)) continue;
    if (cellCageIndex.get(cell) === cellCageIndex.get(nb)) continue;
    const sizeA = cellCageSize.get(cell);
    const sizeB = cellCageSize.get(nb);
    const key = Pair.fnToKey((a, b) => !(a === sizeA && b === sizeB), 9);
    noTouchPairs.push(
      new Pair(key, `no-touch-${sizeA}-${sizeB}`, cell, nb));
  }
}

return [
  new Shape('9x9'),
  ...givens,
  ...putteriaCages,
  ...noTouchPairs,
];
