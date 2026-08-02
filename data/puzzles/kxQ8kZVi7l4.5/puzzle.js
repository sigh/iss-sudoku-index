// Title: Aug. 26, 2023: Pete and Repeat
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=kxQ8kZVi7l4
// Source: https://tinyurl.com/3xp2bpkn

// Standard 9x9 Sudoku with the source givens. Each marked diagonal contains
// exactly three distinct digits; a control Var records its distinct-value count.
const givens = [
  ['R1C3', 1], ['R1C7', 7], ['R2C4', 9], ['R3C1', 8], ['R3C9', 2],
  ['R4C5', 5], ['R4C8', 6], ['R5C4', 8], ['R5C6', 6], ['R6C2', 8],
  ['R6C5', 7], ['R7C1', 4], ['R7C9', 6], ['R8C6', 3], ['R9C3', 5],
  ['R9C7', 3],
];
const diagonals = new Var('D', 'distinct count', 2);
const main = ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'];
const anti = ['R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1'];

return [
  new Shape('9x9'),
  diagonals,
  ...givens.map(([cell, value]) => new Given(cell, value)),
  new Given(diagonals.cell(1), 3),
  new Given(diagonals.cell(2), 3),
  new CountDistinct(diagonals.cell(1), ...main),
  new CountDistinct(diagonals.cell(2), ...anti),
];
