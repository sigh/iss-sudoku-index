// Title: Secret Killer
// Author: Wichu
// Video: https://www.youtube.com/watch?v=jKIeg9NhF_8
// Source: https://sudokupad.app/9iwqmjap7n

// Normal sudoku rules apply (standard 9 boxes; row/column/box all-different
// are the ISS default, so no explicit region constraint is required).
// Anti-King: cells that touch diagonally may not contain the same digit.
// Non-Consecutive: orthogonally adjacent cells may not contain consecutive
// digits (global rule, applies to every adjacent pair, not just marked ones).
// Killer Cages: digits in a cage must sum to the value shown; digits may not
// repeat within a cage.

return [
  new Shape('9x9'),

  new Given('R1C7', 4),

  new AntiKing(),
  new AntiConsecutive(),

  new Cage(42, 'R1C1', 'R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R4C1', 'R5C1'),
  new Cage(42, 'R2C6', 'R2C7', 'R2C8', 'R2C9', 'R3C4', 'R3C5', 'R3C6', 'R3C7'),
  new Cage(42, 'R4C5', 'R4C7', 'R5C5', 'R5C6', 'R5C7', 'R6C5', 'R6C6', 'R7C5'),
  new Cage(42, 'R3C9', 'R4C8', 'R4C9', 'R5C8', 'R6C8', 'R6C9', 'R7C8', 'R8C8'),
  new Cage(42, 'R6C7', 'R7C6', 'R7C7', 'R8C5', 'R8C6', 'R8C7', 'R9C5', 'R9C6'),
];
