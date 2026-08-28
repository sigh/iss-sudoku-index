// Title: Nov 10 2021: Symmetric Unequal
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=urhFM_KWTg0
// Source: https://tinyurl.com/596xm5nz
//
// Normal sudoku rules apply (rows, columns, boxes all-different -- the ISS
// default). Additionally: the digit in every cell and the digit in its
// 180-degree rotationally-symmetric partner (about the grid centre) must
// differ. No cages, lines, or other geometry are drawn; only the givens
// below and the two rules above.

const givens = [
  ['R1C3', 1], ['R1C5', 2], ['R1C7', 3], ['R1C9', 4],
  ['R2C1', 2], ['R2C4', 5], ['R2C6', 6],
  ['R3C2', 3], ['R3C9', 7],
  ['R4C3', 5], ['R4C8', 4],
  ['R5C4', 8], ['R5C9', 1],
  ['R6C5', 6], ['R6C8', 9],
  ['R7C6', 4], ['R7C9', 8],
  ['R8C7', 7],
  ['R9C8', 6],
].map(([cell, value]) => new Given(cell, value));

// Every unordered cell pair related by 180-degree rotation about the grid
// centre (row, col) -> (10-row, 10-col) in 1-indexed coordinates. The centre
// cell R5C5 maps to itself and is skipped, since a cell cannot be unequal to
// itself. Each remaining cell has exactly one partner, so taking pairs where
// the cell precedes its partner in row-major order visits each pair once.
// A two-cell AllDifferent is exactly the "not equal" relation the rule needs.
const symmetricPairs = [];
for (let row = 1; row <= 9; row++) {
  for (let col = 1; col <= 9; col++) {
    const partnerRow = 10 - row;
    const partnerCol = 10 - col;
    if (row === partnerRow && col === partnerCol) continue; // centre cell
    if (row > partnerRow || (row === partnerRow && col > partnerCol)) continue;
    symmetricPairs.push([makeCellId(row, col), makeCellId(partnerRow, partnerCol)]);
  }
}

const symmetricUnequal = symmetricPairs.map(
  ([a, b]) => new AllDifferent(a, b));

return [
  new Shape('9x9'),
  ...givens,
  ...symmetricUnequal,
];
