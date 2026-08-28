// Title: Antiwindoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=McjswDKMFbI
// Source: https://tinyurl.com/h7ww53nw

// Normal sudoku rules apply. Each shaded region contains exactly four
// distinct digits. The four shaded 3x3 regions sit at R2-4/C2-4, R2-4/C6-8,
// R6-8/C2-4, R6-8/C6-8 -- read from the payload's shading colour (#A8A8A8),
// matching the classic Windoku window layout (offset by one cell from the
// sudoku boxes) but here restricting each window's distinct-value count to
// four instead of requiring all nine.

function windowCells(rowStart, colStart) {
  const cells = [];
  for (let r = rowStart; r < rowStart + 3; r++) {
    for (let c = colStart; c < colStart + 3; c++) {
      cells.push(makeCellId(r, c));
    }
  }
  return cells;
}
const windows = [
  windowCells(2, 2), windowCells(2, 6),
  windowCells(6, 2), windowCells(6, 6),
];

// CountDistinct's first (control) cell is constrained to equal the number of
// distinct values among the rest. Pin one auxiliary Var per window to 4 so
// each CountDistinct enforces "exactly four distinct digits" rather than
// merely reporting the count.
const distinctCountVar = new Var('W', 'window distinct-count', windows.length);
const windowPins = distinctCountVar.cells().map(cell => new Given(cell, 4));
const windowCounts = windows.map(
  (cells, i) => new CountDistinct(distinctCountVar.cell(i + 1), ...cells));

// Givens, transcribed from the puzzle's printed clues.
const givens = [
  new Given('R1C1', 1), new Given('R1C3', 2), new Given('R1C7', 3),
  new Given('R2C4', 4), new Given('R2C6', 5),
  new Given('R3C1', 6), new Given('R3C9', 7),
  new Given('R4C2', 3), new Given('R4C6', 1), new Given('R4C8', 6),
  new Given('R6C2', 7), new Given('R6C4', 5), new Given('R6C8', 4),
  new Given('R7C1', 3), new Given('R7C9', 2),
  new Given('R8C4', 7), new Given('R8C6', 8),
  new Given('R9C3', 4), new Given('R9C7', 9), new Given('R9C9', 1),
];

return [
  new Shape('9x9'),
  ...givens,
  distinctCountVar,
  ...windowPins,
  ...windowCounts,
];
