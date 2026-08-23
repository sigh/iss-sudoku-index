// Title: The Sailboat
// Author: Tom1i
// Video: https://www.youtube.com/watch?v=jb-piEF3gjw
// Source: https://app.crackingthecryptic.com/sudoku/6PtJf32R7L

// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Each cage is a 1-cell-wide line. Digits cannot repeat within a cage
// (Cage('', ...)). The sum of the cage's centre cells (every cell except the
// first and last) is double the sum of the two end cells: encoded per cage as
// Sum(0, [end1, -2], [end2, -2], ...centreCells) i.e.
// centreSum - 2*end1 - 2*end2 = 0. Cell order below follows the drawn cage
// path (each cage a chain of orthogonally adjacent cells), so the first and
// last listed cells are the line's ends.

const cages = [
  ['R1C4', 'R2C4', 'R3C4'],
  ['R1C5', 'R2C5', 'R3C5', 'R4C5', 'R4C4', 'R5C4', 'R6C4'],
  ['R2C6', 'R3C6', 'R4C6', 'R5C6', 'R5C5', 'R6C5'],
  ['R3C7', 'R4C7', 'R5C7', 'R5C8'],
  ['R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'],
  ['R7C7', 'R8C7', 'R8C8'],
  ['R7C4', 'R7C5', 'R7C6', 'R8C6', 'R9C6', 'R9C7', 'R9C8'],
  ['R8C5', 'R9C5', 'R9C4', 'R9C3'],
  ['R8C4', 'R8C3', 'R8C2', 'R7C2', 'R7C1'],
  ['R7C3', 'R6C3', 'R5C3'],
  ['R6C2', 'R6C1', 'R5C1', 'R4C1', 'R3C1'],
];

const cageDistinct = cages.map(cells => new Cage('', ...cells));

const cageDoubleSum = cages.map(cells => {
  const first = cells[0];
  const last = cells[cells.length - 1];
  const centre = cells.slice(1, -1);
  return new Sum(0, [first, -2], [last, -2], ...centre);
});

return [
  new Shape('9x9'),
  ...cageDistinct,
  ...cageDoubleSum,
];
