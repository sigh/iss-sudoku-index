// Title: Ten Triples
// Author: Simon Ferre
// Video: https://www.youtube.com/watch?v=nxgiZuapNME
// Source: https://cracking-the-cryptic.web.app/sudoku/M72DgptNmt

// Normal sudoku rules apply (rows, columns, boxes all-different from the
// default Shape('9x9') and the payload's standard box regions).
// Ten grey diagonal lines are drawn; each line's three cells hold a trio of
// identical digits. Numbers outside the grid give the sum of the digits that
// lie on a drawn line, within that row/column (cells off every line are not
// counted). Every line crosses each of its three rows/columns exactly once,
// so each outside clue is a plain sum over the line-cells found in that
// row/column -- computed below from the drawn line list rather than
// hand-enumerated, so the row/column grouping can't drift from the lines.

// Drawn line cells, in row/col order as drawn.
const LINES = [
  ['R6C8', 'R7C7', 'R8C6'],
  ['R8C7', 'R7C6', 'R6C5'],
  ['R7C5', 'R6C6', 'R5C7'],
  ['R5C6', 'R4C7', 'R3C8'],
  ['R4C8', 'R3C7', 'R2C6'],
  ['R2C3', 'R3C4', 'R4C5'],
  ['R2C4', 'R3C3', 'R4C2'],
  ['R3C5', 'R4C4', 'R5C3'],
  ['R5C4', 'R6C3', 'R7C2'],
  ['R6C2', 'R7C3', 'R8C4'],
];

// Outside clues: printed marginal totals, keyed by row/column number.
const ROW_CLUES = { 2: 17, 3: 25, 4: 25, 5: 25, 6: 30, 7: 30, 8: 13 };
const COL_CLUES = { 2: 24, 3: 29, 4: 29, 5: 18, 6: 26, 7: 26, 8: 13 };

const sameValueLines = LINES.map(cells => new SameValues(3, ...cells));

const rowSums = Object.entries(ROW_CLUES).map(([row, total]) => {
  const cells = LINES.flat().filter(id => parseCellId(id).row === Number(row));
  return new Sum(total, ...cells);
});

const colSums = Object.entries(COL_CLUES).map(([col, total]) => {
  const cells = LINES.flat().filter(id => parseCellId(id).col === Number(col));
  return new Sum(total, ...cells);
});

return [
  new Shape('9x9'),
  new Given('R1C2', 1),
  new Given('R5C2', 3),
  new Given('R8C8', 1),
  new Given('R9C4', 1),
  ...sameValueLines,
  ...rowSums,
  ...colSums,
];
