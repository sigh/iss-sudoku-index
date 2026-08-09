// Title: Cabo Verde
// Author: Qodec
// Video: https://www.youtube.com/watch?v=sUpfZ8ybXE4
// Source: https://app.crackingthecryptic.com/sudoku/jDRRgGhpN3

// Standard sudoku, anti-knight, the six drawn cages summing to their printed
// totals, and each of the two main diagonals containing only three distinct
// digits among its 9 cells.

// From the six drawn cage outlines and their top-left totals.
const cages = [
  new Cage(14, 'R1C1', 'R1C2'),
  new Cage(4, 'R2C4', 'R2C5'),
  new Cage(14, 'R3C7', 'R3C8'),
  new Cage(5, 'R5C8', 'R5C9'),
  new Cage(13, 'R9C2', 'R9C3'),
  new Cage(13, 'R8C5', 'R8C6'),
];

const mainDiagonal = [
  'R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9',
];
const antiDiagonal = [
  'R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1',
];

// "Only three distinct digits" is enforced with CountDistinct against an
// auxiliary Var pinned to 3: the control cell's value is forced to equal the
// count of distinct values among the diagonal's cells.
const diagCounts = new Var('D', 'diagonal distinct-value witnesses', 2);
const [mainControl, antiControl] = diagCounts.cells();

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...cages,
  diagCounts,
  new Given(mainControl, 3),
  new Given(antiControl, 3),
  new CountDistinct(mainControl, ...mainDiagonal),
  new CountDistinct(antiControl, ...antiDiagonal),
];
