// Title: Mystery Box
// Author: CLASSIFIED
// Video: https://www.youtube.com/watch?v=jI4KZk6psNI
// Source: https://sudokupad.app/p2c2e9gnig

// Normal sudoku rules apply (standard rows, columns, and 3x3 boxes).
//
// The circled cells form a 5x5 grid rotated 45 degrees, the "Inside Grid":
// its 5 rows are the diagonals of constant row+col, its 5 columns are the
// diagonals of constant row-col. Each Inside Grid row and column holds 5
// different digits, like an ordinary sudoku line -- but unlike ordinary
// sudoku the usable digit set is not fixed to 1-5: the same set of exactly 5
// digits (drawn from 1-9) is shared by every one of the 10 lines, and which
// 5 digits that is must be worked out while solving.

// Circled cells, from the payload's overlays array (deepskyblue circles).
const circleCells = [
  'R1C5', 'R2C4', 'R2C6', 'R3C3', 'R3C5', 'R3C7', 'R4C2', 'R4C4', 'R4C6', 'R4C8',
  'R5C1', 'R5C3', 'R5C5', 'R5C7', 'R5C9', 'R6C2', 'R6C4', 'R6C6', 'R6C8', 'R7C3',
  'R7C5', 'R7C7', 'R8C4', 'R8C6', 'R9C5',
];

// Group the circled cells into the Inside Grid's 5 rows (constant row+col)
// and 5 columns (constant row-col) -- derived from the drawn positions above.
// Together the 10 groups trace the rotated diamond: 5 diagonals running
// NE-SW (the rows) and 5 running NW-SE (the columns).
const byRowSum = new Map();
const byColDiff = new Map();
for (const id of circleCells) {
  const { row, col } = parseCellId(id);
  const rowKey = row + col;
  const colKey = row - col;
  if (!byRowSum.has(rowKey)) byRowSum.set(rowKey, []);
  byRowSum.get(rowKey).push(id);
  if (!byColDiff.has(colKey)) byColDiff.set(colKey, []);
  byColDiff.get(colKey).push(id);
}
const insideRows = [...byRowSum.values()];
const insideCols = [...byColDiff.values()];

return [
  new Shape('9x9'),

  new Given('R1C1', 4), new Given('R1C2', 2), new Given('R1C7', 6),
  new Given('R1C8', 5), new Given('R1C9', 7),
  new Given('R2C1', 5), new Given('R2C2', 1), new Given('R2C8', 8),
  new Given('R2C9', 2),
  new Given('R3C1', 9),
  new Given('R7C9', 5),
  new Given('R8C1', 6), new Given('R8C2', 7), new Given('R8C8', 4),
  new Given('R8C9', 9),
  new Given('R9C1', 8), new Given('R9C2', 9), new Given('R9C3', 2),
  new Given('R9C8', 6), new Given('R9C9', 1),

  // Each Inside Grid row and column: 5 different digits.
  ...insideRows.map(cells => new AllDifferent(...cells)),
  ...insideCols.map(cells => new AllDifferent(...cells)),

  // All 10 Inside Grid lines share the same 5-digit value set -- this is what
  // makes the digit set unknown-but-common rather than free per line.
  new SameValues(10, ...[...insideRows, ...insideCols].flat()),
];
