// Title: Antidiagonal Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=ztvshyksPS8
// Source: https://app.crackingthecryptic.com/sudoku/DgqqmmghFg

// Standard sudoku rules apply (default 3x3 boxes). Two diagonals are marked:
// the main diagonal R1C1-R9C9 and the anti-diagonal R1C9-R9C1. Each marked
// diagonal must contain only three distinct digit values among its 9 cells.
//
// CountDistinct ties a control cell's value to the number of distinct values
// among a cell list. One aux Var per diagonal is pinned to 3 with Given, then
// CountDistinct enforces the diagonal's distinct-value count equals it.

const mainDiagonal = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => makeCellId(i, i));
const antiDiagonal = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => makeCellId(i, 10 - i));

const distinctCount = new Var('D', 'distinctCount', 2);
const mainControl = distinctCount.cell(1);
const antiControl = distinctCount.cell(2);

return [
  new Shape('9x9'),
  distinctCount,

  new Given('R2C3', 6), new Given('R2C7', 2),
  new Given('R3C2', 1), new Given('R3C8', 7),
  new Given('R4C1', 4), new Given('R4C5', 6), new Given('R4C9', 2),
  new Given('R5C2', 2), new Given('R5C4', 7), new Given('R5C6', 8), new Given('R5C8', 3),
  new Given('R6C1', 1), new Given('R6C5', 9), new Given('R6C9', 4),
  new Given('R7C2', 6), new Given('R7C8', 9),
  new Given('R8C3', 7), new Given('R8C7', 8),

  new Given(mainControl, 3),
  new CountDistinct(mainControl, ...mainDiagonal),

  new Given(antiControl, 3),
  new CountDistinct(antiControl, ...antiDiagonal),
];
