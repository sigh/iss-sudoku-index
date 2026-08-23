// Title: Wedged Sum
// Author: AndreasV
// Video: https://www.youtube.com/watch?v=I7N00gj2j9g
// Source: https://app.crackingthecryptic.com/sudoku/j42NrmtQhP

// Normal sudoku rules apply. For each green cell and the next green cell
// along the same row or column (i.e. every pair of green cells adjacent in
// that row's/column's left-to-right or top-to-bottom order, with no other
// green cell between them), the two digits must sum to the digit shown in
// at least one of the cells strictly between them.

const given = {
  R3C5: 4, R3C9: 9, R5C2: 5, R5C3: 9, R6C1: 6,
  R6C9: 7, R7C6: 9, R7C7: 1, R8C5: 5,
};

// Green (yellowgreen) underlay cells drawn on the board.
const green = [
  'R1C4', 'R1C8', 'R2C6', 'R2C9', 'R3C2', 'R3C5', 'R3C7', 'R4C1', 'R4C4',
  'R5C2', 'R5C5', 'R6C1', 'R6C6', 'R6C8', 'R7C4', 'R7C7', 'R8C5', 'R9C2',
  'R9C6', 'R9C9',
];

// Build the "wedge" pairs: for each row and each column, every pair of
// green cells consecutive in that row's/column's index order, together with
// the (possibly empty-of-green, but never empty-of-cells) list of cells
// strictly between them.
const wedges = [];

function collectWedges(cellsInLine, betweenFn) {
  // cellsInLine: green cells sorted along one row/column, as {id, pos}.
  for (let i = 0; i + 1 < cellsInLine.length; i++) {
    const a = cellsInLine[i];
    const b = cellsInLine[i + 1];
    wedges.push({ a: a.id, b: b.id, between: betweenFn(a.pos, b.pos) });
  }
}

// parseCellId/makeCellId use the literal 1-9 R#C# numbering (row/col fields
// equal the printed row/column number, not a 0-indexed offset).
for (let r = 1; r <= 9; r++) {
  const rowGreens = green
    .map(parseCellId)
    .filter(rc => rc.row === r)
    .map(rc => ({ id: makeCellId(rc.row, rc.col), pos: rc.col }))
    .sort((x, y) => x.pos - y.pos);
  collectWedges(rowGreens, (c1, c2) => {
    const cells = [];
    for (let c = c1 + 1; c < c2; c++) cells.push(makeCellId(r, c));
    return cells;
  });
}

for (let c = 1; c <= 9; c++) {
  const colGreens = green
    .map(parseCellId)
    .filter(rc => rc.col === c)
    .map(rc => ({ id: makeCellId(rc.row, rc.col), pos: rc.row }))
    .sort((x, y) => x.pos - y.pos);
  collectWedges(colGreens, (r1, r2) => {
    const cells = [];
    for (let r = r1 + 1; r < r2; r++) cells.push(makeCellId(r, c));
    return cells;
  });
}

// Each wedge: a + b == value(between-cell) for at least one between-cell.
// EqualSum([a, b], [cell]) enforces a + b == cell as two equal-sum segments.
const wedgeConstraints = wedges.map(({ a, b, between }) =>
  new Or(between.map(cell => new EqualSum([a, b], [cell])))
);

return [
  new Shape('9x9'),
  ...Object.entries(given).map(([cell, v]) => new Given(cell, v)),
  ...wedgeConstraints,
];
