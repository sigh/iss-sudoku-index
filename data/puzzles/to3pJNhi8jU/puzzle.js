// Title: Between 1 and 9 Sudoku
// Author: Tantan Dai
// Video: https://www.youtube.com/watch?v=to3pJNhi8jU
// Source: https://app.crackingthecryptic.com/6p97bFGMQT
//
// Normal sudoku (standard 3x3 boxes). Each row and each column carries one
// "between 1 and 9" (sandwich) clue: the sum of the digits strictly between
// the 1 and the 9 in that line. Encoded with the native Sandwich class, built
// via Sandwich.fromCells (direction-independent) so the canonical arrowId
// need not be hand-derived. Row/column totals below are transcribed from the
// drawn outside-clue overlays.

const geometry = cellGeometry('9x9');

const rowSums = [7, 10, 21, 5, 21, 0, 12, 23, 16];
const colSums = [7, 20, 23, 12, 24, 14, 25, 20, 0];

const rowSandwiches = rowSums.map((sum, i) => {
  const row = i + 1;
  const cells = Array.from({ length: 9 }, (_, j) => makeCellId(row, j + 1));
  return Sandwich.fromCells(sum, cells, geometry);
});

const colSandwiches = colSums.map((sum, i) => {
  const col = i + 1;
  const cells = Array.from({ length: 9 }, (_, j) => makeCellId(j + 1, col));
  return Sandwich.fromCells(sum, cells, geometry);
});

return [
  new Shape('9x9'),

  new Given('R1C1', 8),
  new Given('R1C9', 6),
  new Given('R3C3', 1),
  new Given('R3C7', 9),
  new Given('R7C3', 6),
  new Given('R7C7', 8),
  new Given('R9C1', 4),
  new Given('R9C9', 3),

  ...rowSandwiches,
  ...colSandwiches,
];
