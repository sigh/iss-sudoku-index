// Title: 165
// Author: Leonhard Kohl-Lorting
// Video: https://www.youtube.com/watch?v=5vOIz_cBEwE
// Source: https://sudokupad.app/P3DDj2thmF

// Normal Sudoku with R7C5=7, four killer cages, and a total of 165 across
// the nine top-to-bottom column X-Sums. Each X-Sum is represented as a unique
// base-9 pair a+9b-9, so the auxiliary pairs can add to 165+9*9 = 246.
const graph = cellGraph('9x9');
const columns = graph.columns();
const xSumDigits = new Var('X', 'base-9 X-Sum pairs', '2x9');
const geometry = cellGeometry('9x9');

function xSumChoices(column, index) {
  const a = xSumDigits.cell(1, index + 1);
  const b = xSumDigits.cell(2, index + 1);
  return new Or(Array.from({ length: 45 }, (_, offset) => {
    const total = offset + 1;
    return new And([
      new Given(a, total % 9 || 9),
      new Given(b, Math.floor((total - 1) / 9) + 1),
      XSum.fromCells(total, column, geometry),
    ]);
  }));
}

return [
  new Shape('9x9'),
  new Given('R7C5', 7),
  // Drawn killer-cage totals; each two-cell cage is distinct under normal Sudoku.
  new Cage(11, 'R8C3', 'R8C4'),
  new Cage(13, 'R8C6', 'R8C7'),
  new Cage(11, 'R9C2', 'R9C3'),
  new Cage(9, 'R9C7', 'R9C8'),
  xSumDigits,
  // Each branch matches one possible X-Sum to its auxiliary base-9 pair.
  ...columns.map(xSumChoices),
  new Sum(246, ...columns.flatMap((_, index) => [
    xSumDigits.cell(1, index + 1), [xSumDigits.cell(2, index + 1), 9],
  ])),
];
