// Title: Anti-Windoku
// Author: Italy
// Video: https://www.youtube.com/watch?v=rqFz9WRbNi0
// Source: https://app.crackingthecryptic.com/bBrphQNn66

// Normal sudoku rules apply. Each light-grey shaded 3x3 region has exactly four distinct digits.
// Givens are transcribed from the puzzle grid.
const givens = [
  ['R1C1', 8], ['R1C5', 4], ['R1C9', 2],
  ['R2C1', 4], ['R2C2', 2], ['R2C5', 9], ['R2C8', 1],
  ['R3C3', 7], ['R3C5', 3], ['R3C8', 8],
  ['R5C1', 2], ['R5C2', 1], ['R5C5', 8], ['R5C8', 4], ['R5C9', 3],
  ['R7C2', 4], ['R7C7', 3], ['R8C2', 6], ['R8C5', 5], ['R8C8', 9],
  ['R9C1', 5], ['R9C3', 2], ['R9C5', 6], ['R9C9', 4],
];

// The four 3x3 arrays are the separate light-grey regions in the drawn grid.
const shaded = [
  ['R2C2', 'R2C3', 'R2C4', 'R3C2', 'R3C3', 'R3C4', 'R4C2', 'R4C3', 'R4C4'],
  ['R2C6', 'R2C7', 'R2C8', 'R3C6', 'R3C7', 'R3C8', 'R4C6', 'R4C7', 'R4C8'],
  ['R6C2', 'R6C3', 'R6C4', 'R7C2', 'R7C3', 'R7C4', 'R8C2', 'R8C3', 'R8C4'],
  ['R6C6', 'R6C7', 'R6C8', 'R7C6', 'R7C7', 'R7C8', 'R8C6', 'R8C7', 'R8C8'],
];
const counts = new Var('D', 'distinct counts', 4);

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  counts,
  ...counts.cells().map(cell => new Given(cell, 4)),
  ...shaded.map((cells, index) => new CountDistinct(counts.cell(index + 1), ...cells)),
];
