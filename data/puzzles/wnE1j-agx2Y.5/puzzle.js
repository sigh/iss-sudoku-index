// Title: 4/17/22: Yer A Hairy Wizard
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=wnE1j-agx2Y
// Source: https://tinyurl.com/2p93mftb

// Normal sudoku rules apply. Every blue region is a 3x3 magic square: digits
// 1-9 once each, and every row, column, and diagonal within the square sums
// to 15. None of the four blue regions is aligned to a standard sudoku box
// (each straddles a box boundary), so each needs its own AllDifferent and
// EqualSum rather than relying on the box constraint.

// Givens, transcribed from the drawn digits.
const givens = [
  ['R2C5', 6], ['R2C6', 7],
  ['R4C2', 9],
  ['R5C2', 2], ['R5C8', 8],
  ['R6C8', 1],
  ['R8C4', 3], ['R8C5', 4],
];

// The four blue 3x3 regions, transcribed from the shaded overlay
// (#D0D0FF), which exactly matches the drawn totalless killer-cage outlines
// for the same cells.
const magicSquares = [
  ['R1C2', 'R1C3', 'R1C4', 'R2C2', 'R2C3', 'R2C4', 'R3C2', 'R3C3', 'R3C4'],
  ['R2C7', 'R2C8', 'R2C9', 'R3C7', 'R3C8', 'R3C9', 'R4C7', 'R4C8', 'R4C9'],
  ['R6C1', 'R6C2', 'R6C3', 'R7C1', 'R7C2', 'R7C3', 'R8C1', 'R8C2', 'R8C3'],
  ['R7C6', 'R7C7', 'R7C8', 'R8C6', 'R8C7', 'R8C8', 'R9C6', 'R9C7', 'R9C8'],
];

// For each region: AllDifferent over all 9 cells (digits 1-9 once each), plus
// EqualSum over its 3 rows, 3 columns, and 2 diagonals -- all 8 segments tied
// to one common sum. AllDifferent alone forces that common sum to 15 (the 9
// cells sum to 45, split 3-ways by the row segments), so no explicit sum
// value is needed.
const magicSquareConstraints = magicSquares.flatMap(cells => {
  const rows = [[0, 1, 2], [3, 4, 5], [6, 7, 8]].map(idx => idx.map(i => cells[i]));
  const cols = [[0, 3, 6], [1, 4, 7], [2, 5, 8]].map(idx => idx.map(i => cells[i]));
  const diags = [[0, 4, 8], [2, 4, 6]].map(idx => idx.map(i => cells[i]));
  return [
    new AllDifferent(...cells),
    new EqualSum(...rows, ...cols, ...diags),
  ];
});

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...magicSquareConstraints,
];
