// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=qCAQxEbgUVw
// Source: https://cracking-the-cryptic.web.app/sudoku/g92qm8fDQg

// Normal sudoku rules apply (standard 3x3 boxes), plus:
// - Identical digits cannot be a knight's move apart (AntiKnight).
// - Box 5 (R4-R6C4-C6) is a magic square: each row, column, and diagonal of
//   the box sums to 15 -- EqualSum over the box's 3 rows, 3 columns and 2
//   diagonals; the box's own all-different (from the standard box group)
//   forces the common sum to 15.
// - Box 4 (R4-R6C1-C3) and box 8 (R7-R9C4-C6) are exact clones (no rotation
//   or reflection): each cell of box 4 holds the same digit as the
//   corresponding cell (same row/col offset within the box) of box 8.
// - The grey cells are even: encoded as a restricted Given, since ISS has no
//   dedicated Even class.
// - The killer cage sums to 10 (digits in the cage are also distinct).

const box4 = ['R4C1', 'R4C2', 'R4C3', 'R5C1', 'R5C2', 'R5C3', 'R6C1', 'R6C2', 'R6C3'];
const box8 = ['R7C4', 'R7C5', 'R7C6', 'R8C4', 'R8C5', 'R8C6', 'R9C4', 'R9C5', 'R9C6'];

const magicRows = [
  ['R4C4', 'R4C5', 'R4C6'],
  ['R5C4', 'R5C5', 'R5C6'],
  ['R6C4', 'R6C5', 'R6C6'],
];
const magicCols = [
  ['R4C4', 'R5C4', 'R6C4'],
  ['R4C5', 'R5C5', 'R6C5'],
  ['R4C6', 'R5C6', 'R6C6'],
];
const magicDiags = [
  ['R4C4', 'R5C5', 'R6C6'],
  ['R4C6', 'R5C5', 'R6C4'],
];

return [
  new Shape('9x9'),

  new Given('R1C2', 7),
  new Given('R1C7', 2),
  new Given('R5C7', 8),
  new Given('R5C8', 2),
  new Given('R7C2', 5),

  // Identical digits cannot be a knight's move apart.
  new AntiKnight(),

  // Magic square: box 5's 3 rows, 3 columns and 2 diagonals all sum equally
  // (one EqualSum over all 8 segments); the box's all-different then forces
  // the common sum to 15.
  new EqualSum(...magicRows, ...magicCols, ...magicDiags),

  // Green boxes are exact clones, cell-wise (no rotation/reflection): one
  // SameValues per corresponding pair of cells (box4[i] <-> box8[i], same
  // row/col offset within each box).
  ...box4.map((cell, i) => new SameValues(2, cell, box8[i])),

  // Grey cells are even (underlay fill #CFCFCF at R1C8, R2C9, R7C8).
  new Given('R1C8', 2, 4, 6, 8),
  new Given('R2C9', 2, 4, 6, 8),
  new Given('R7C8', 2, 4, 6, 8),

  // Killer cage, sum 10.
  new Cage(10, 'R9C7', 'R9C8'),
];
