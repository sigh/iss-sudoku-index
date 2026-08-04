// Title: Jan. 17, 2023: Repeat After Me
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=DnRGUWffGsc
// Source: https://tinyurl.com/57x798n9
//
// Normal sudoku rules apply. Each of the two drawn diagonals (main and
// anti-diagonal, both length 9) contains only three distinct digit values
// among its 9 cells.
//
// "Only three distinct digits" is enforced with CountDistinct against an
// auxiliary Var pinned to 3: the control cell's value is forced to equal the
// count of distinct values among the diagonal's cells.

const givens = [
  new Given('R1C3', 1), new Given('R1C6', 2), new Given('R1C7', 6),
  new Given('R2C2', 2), new Given('R2C5', 6), new Given('R2C8', 1),
  new Given('R3C1', 5), new Given('R3C4', 1), new Given('R3C9', 2),
  new Given('R4C7', 7),
  new Given('R5C1', 3), new Given('R5C2', 4), new Given('R5C8', 2), new Given('R5C9', 1),
  new Given('R6C3', 5),
  new Given('R7C1', 4), new Given('R7C6', 3), new Given('R7C9', 7),
  new Given('R8C2', 3), new Given('R8C5', 8), new Given('R8C8', 4),
  new Given('R9C3', 8), new Given('R9C4', 4), new Given('R9C7', 3),
];

const antiDiagonal = [
  'R9C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8', 'R1C9',
];
const mainDiagonal = [
  'R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9',
];

// One control Var per diagonal, pinned to 3.
const diagCounts = new Var('D', 'diagonal distinct-value witnesses', 2);
const [antiControl, mainControl] = diagCounts.cells();

return [
  new Shape('9x9'),
  ...givens,
  diagCounts,
  new Given(antiControl, 3),
  new Given(mainControl, 3),
  new CountDistinct(antiControl, ...antiDiagonal),
  new CountDistinct(mainControl, ...mainDiagonal),
];
