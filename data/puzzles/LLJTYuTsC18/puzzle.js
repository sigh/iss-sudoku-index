// Title: Antidiagonal
// Author: Piotr Gdowski
// Video: https://www.youtube.com/watch?v=LLJTYuTsC18
// Source: https://app.crackingthecryptic.com/sudoku/Br3nfTMfbJ

// Normal sudoku rules apply (default row/column/box all-different from
// Shape('9x9')). "Every main diagonal contains only 3 different numbers":
// both drawn diagonals are the same colour/thickness, and the rule text says
// "every", so the 3-distinct-values rule applies to both diagonals, not only
// the anti-diagonal named in the title.

const givens = [
  ['R2C3', 8], ['R2C4', 1], ['R2C6', 5], ['R2C7', 6],
  ['R3C2', 9], ['R3C8', 3],
  ['R4C2', 2], ['R4C5', 4], ['R4C8', 1],
  ['R6C2', 5], ['R6C5', 8], ['R6C8', 2],
  ['R7C2', 1], ['R7C8', 8],
  ['R8C3', 6], ['R8C4', 4], ['R8C6', 3], ['R8C7', 2],
];

// Both diagonal lines, read top-left to bottom-right and top-right to
// bottom-left respectively (line #0 and #1 in the drawn geometry).
const mainDiagonal = ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'];
const antiDiagonal = ['R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1'];

// CountDistinct ties a control cell's value to the count of distinct values
// among the rest of its cell list. Each diagonal gets its own off-grid Var
// control cell, pinned to 3 with a Given, so the diagonal itself holds no
// extra digit -- only the count constraint applies.
const counts = new Var('D', 'diagonal distinct count', 2);

return [
  new Shape('9x9'),
  ...givens.map(([cell, v]) => new Given(cell, v)),
  counts,
  new Given(counts.cell(1), 3),
  new Given(counts.cell(2), 3),
  new CountDistinct(counts.cell(1), ...mainDiagonal),
  new CountDistinct(counts.cell(2), ...antiDiagonal),
];
