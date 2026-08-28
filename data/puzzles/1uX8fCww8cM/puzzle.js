// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=1uX8fCww8cM
// Source: https://cracking-the-cryptic.web.app/sudoku/nLfTB6T9t8

// Standard 9x9 sudoku (rows, columns, boxes all-different from the default
// Shape) plus two variant rules from the video description:
//   1. Both main diagonals contain only odd digits.
//   2. Two 9-cell diamonds (45-degree-rotated 3x3 squares, one centred on
//      R3C3, one on R7C7 -- the drawn grey star outlines, not the sudoku
//      boxes) are each a 1-9 magic square: digits 1-9 once each, with every
//      3-cell row/column/diagonal of the diamond (in its own rotated frame)
//      summing to the same total -- forced to 15, since the diamond's three
//      rows partition its 1-9 digits into three equal-sum groups of 45/3.
// ISS has no `Odd` class, so "only odd digits" on the diagonals is a
// per-cell candidate restriction via `Given`, not a distinctness rule -- 9
// diagonal cells cannot hold 9 distinct values drawn from only 5 odd digits.

const oddValues = [1, 3, 5, 7, 9];

// The two drawn diagonals (yellowgreen lines, corner to corner).
const mainDiagonal = [];
const antiDiagonal = [];
for (let i = 1; i <= 9; i++) {
  mainDiagonal.push(makeCellId(i, i));
  antiDiagonal.push(makeCellId(i, 10 - i));
}
const diagonalCells = [...new Set([...mainDiagonal, ...antiDiagonal])];
const oddDiagonalGivens = diagonalCells.map(
  cell => new Given(cell, ...oddValues));

// A magic-square diamond centred at (r0, c0) (1-indexed): the 9 cells at
// Chebyshev... no -- Manhattan distance 0 or 2 from the centre with dr, dc
// both even or both odd (the drawn star's 4 outer tips, 4 inner points, and
// centre). Using diagonal coordinates u = row + col, v = row - col, the 9
// cells form a plain 3x3 grid over u in {u0-2, u0, u0+2}, v in {-2, 0, 2},
// which is what makes "row/column/diagonal of the diamond" well-defined.
const diamondCell = (u, v) => makeCellId((u + v) / 2, (u - v) / 2);
const diamondCells = (r0, c0) => {
  const u0 = r0 + c0;
  const cells = [];
  for (const du of [-2, 0, 2]) {
    for (const v of [-2, 0, 2]) cells.push(diamondCell(u0 + du, v));
  }
  return cells;
};
const magicDiamondSegments = (r0, c0) => {
  const u0 = r0 + c0;
  const rows = [-2, 0, 2].map(
    du => [-2, 0, 2].map(v => diamondCell(u0 + du, v)));
  const cols = [-2, 0, 2].map(
    v => [-2, 0, 2].map(du => diamondCell(u0 + du, v)));
  const diags = [
    [[-2, -2], [0, 0], [2, 2]].map(([du, v]) => diamondCell(u0 + du, v)),
    [[-2, 2], [0, 0], [2, -2]].map(([du, v]) => diamondCell(u0 + du, v)),
  ];
  return [...rows, ...cols, ...diags];
};

return [
  new Shape('9x9'),

  // Givens.
  new Given('R1C4', 1),
  new Given('R4C1', 8),
  new Given('R4C8', 6),
  new Given('R9C5', 3),

  // Rule 1: both main diagonals hold only odd digits.
  ...oddDiagonalGivens,

  // Rule 2: the two drawn diamonds are each a 1-9 magic square. Neither
  // diamond is one of the 9 sudoku boxes, so its "digits 1-9 once each" is
  // not implied by a box region and needs an explicit AllDifferent; the
  // EqualSum over its 3 rows, 3 columns, and 2 diagonals (all in the
  // diamond's own rotated frame) supplies "every row/column/diagonal sums
  // the same".
  new AllDifferent(...diamondCells(3, 3)),
  new EqualSum(...magicDiamondSegments(3, 3)),
  new AllDifferent(...diamondCells(7, 7)),
  new EqualSum(...magicDiamondSegments(7, 7)),
];
