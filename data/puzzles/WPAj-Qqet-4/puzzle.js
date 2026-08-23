// Title: Standard Young Tableaux
// Author: Tharn11
// Video: https://www.youtube.com/watch?v=WPAj-Qqet-4
// Source: https://app.crackingthecryptic.com/sudoku/6PTDqHDB3R

// Normal sudoku rules apply (default Shape row/column/box all-different).
// Ten cages, no printed totals. Within each cage: digits increase left to
// right along a row and top to bottom along a column, and no digit repeats
// anywhere in the cage. Cage cell lists are transcribed from the source
// payload's `cages` array.
const cages = [
  ['R1C1', 'R1C2', 'R2C1'],
  ['R1C3', 'R1C4', 'R2C3'],
  ['R1C6', 'R1C7', 'R2C6', 'R2C7'],
  ['R3C3', 'R3C4', 'R3C5', 'R3C6', 'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R5C3'],
  ['R3C7', 'R3C8', 'R4C7', 'R4C8', 'R5C7', 'R5C8', 'R6C7', 'R6C8'],
  ['R3C1', 'R3C2', 'R4C1', 'R4C2', 'R5C1', 'R6C1', 'R7C1'],
  ['R8C2', 'R9C2'],
  ['R5C4', 'R5C5', 'R6C4', 'R7C4', 'R8C4'],
  ['R6C5', 'R6C6', 'R7C5'],
  ['R7C6', 'R7C7', 'R7C8', 'R8C6', 'R9C6'],
];

// Every cage in this puzzle is a Young-diagram-like staircase: each row and
// each column it touches forms one grid-contiguous run of cells (checked
// against the drawn shapes, not assumed). So the increase rule reduces to one
// GreaterThan per contiguous row run and per contiguous column run within a
// cage. GreaterThan(...cells) requires each cell to exceed any later
// grid-adjacent cell in the list, so a run is passed in reverse reading
// order (rightmost-first for rows, bottom-first for columns) to turn
// "increases left-to-right / top-to-bottom" into "earlier > later".
const orderConstraints = [];
for (const cells of cages) {
  const parsed = cells.map(c => ({ id: c, ...parseCellId(c) }));

  const byRow = new Map();
  const byCol = new Map();
  for (const p of parsed) {
    (byRow.get(p.row) ?? byRow.set(p.row, []).get(p.row)).push(p);
    (byCol.get(p.col) ?? byCol.set(p.col, []).get(p.col)).push(p);
  }

  for (const row of byRow.values()) {
    if (row.length < 2) continue;
    row.sort((a, b) => b.col - a.col); // rightmost first
    orderConstraints.push(new GreaterThan(...row.map(p => p.id)));
  }
  for (const col of byCol.values()) {
    if (col.length < 2) continue;
    col.sort((a, b) => b.row - a.row); // bottommost first
    orderConstraints.push(new GreaterThan(...col.map(p => p.id)));
  }
}

return [
  new Shape('9x9'),
  ...cages.map(cells => new AllDifferent(...cells)),
  ...orderConstraints,
];
