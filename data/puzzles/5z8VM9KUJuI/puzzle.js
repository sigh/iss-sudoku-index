// Title: Jigsaw
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=5z8VM9KUJuI
// Source: https://sudokupad.app/y9rdy75smw

// Place each digit 1-7 exactly once in each row and column of the 7x7 grid
// (rows/columns only -- 7 has no rectangular box tiling, so the default grid
// adds none).
//
// The grid is covered by 16 jigsaw pieces, drawn as an irregular dissection
// of the board (not aligned to the cell grid). Each piece must cover the
// same sum. Where a piece's boundary cuts through a cell, that cell's digit
// counts toward the piece's sum only in proportion to the area of the cell
// the piece covers; every cut in the drawing lands exactly on a cell's
// quarter or half line, so every cell's area is split among its piece(s) in
// quarters. `pieces` below is that drawn dissection: one entry per piece, as
// [cell, coefficient] pairs where the coefficient is the cell's covered area
// times 4 (4 = whole cell, 2 = half, 1 = quarter), recovered from the drawn
// piece-boundary strokes and cross-checked against the rules' own worked
// example (R4C4 splits 1/4 to the piece holding R3C3, 1/2 to the piece
// holding R3C5, and 1/4 to the piece holding R5C5 -- pieces 4, 7 and 11
// below reproduce exactly that split). Every cell's coefficients across all
// 16 pieces sum to 4 (its area is fully accounted for, once).
//
// The target sum is derived, not guessed: scaled by 4, the board's digits
// (1-7 once per row, 7 rows) total 4 * 7 * 28 = 784, and since every cell's
// area is counted exactly once across the 16 equal pieces, each piece's
// scaled sum must be 784 / 16 = 49.
const pieces = [
  [['R1C3', 4], ['R1C4', 4], ['R2C2', 1], ['R2C3', 2]],
  [['R1C1', 4], ['R1C2', 4], ['R2C1', 4], ['R2C2', 1]],
  [['R1C6', 4], ['R1C7', 4], ['R2C6', 1], ['R2C7', 4]],
  [['R1C5', 4], ['R2C4', 1], ['R2C5', 4], ['R2C6', 1]],
  [['R2C2', 1], ['R2C3', 2], ['R2C4', 2], ['R3C3', 4], ['R4C2', 1], ['R4C3', 2], ['R4C4', 1]],
  [['R2C2', 1], ['R3C1', 4], ['R3C2', 4], ['R4C2', 1]],
  [['R2C6', 1], ['R3C6', 2], ['R3C7', 4], ['R4C6', 1], ['R4C7', 2]],
  [['R2C4', 1], ['R2C6', 1], ['R3C4', 4], ['R3C5', 4], ['R3C6', 2], ['R4C4', 2], ['R4C5', 2], ['R4C6', 1]],
  [['R4C1', 4], ['R4C2', 1], ['R5C1', 4], ['R5C2', 4], ['R6C2', 1]],
  [['R4C6', 1], ['R4C7', 2], ['R5C6', 4], ['R5C7', 4], ['R6C6', 1]],
  [['R4C2', 1], ['R4C3', 2], ['R5C3', 4], ['R6C2', 1], ['R6C3', 2]],
  [['R4C4', 1], ['R4C5', 2], ['R4C6', 1], ['R5C4', 4], ['R5C5', 4], ['R6C4', 1], ['R6C5', 2], ['R6C6', 1]],
  [['R6C1', 4], ['R6C2', 1], ['R7C1', 4]],
  [['R6C6', 1], ['R6C7', 4], ['R7C6', 4], ['R7C7', 4]],
  [['R6C4', 1], ['R6C5', 2], ['R6C6', 1], ['R7C4', 2], ['R7C5', 4]],
  [['R6C2', 1], ['R6C3', 2], ['R6C4', 2], ['R7C2', 4], ['R7C3', 4], ['R7C4', 2]],
];

const pieceSums = pieces.map(cells => new Sum(49, ...cells));

return [
  new Shape('7x7'),
  ...pieceSums,
];
