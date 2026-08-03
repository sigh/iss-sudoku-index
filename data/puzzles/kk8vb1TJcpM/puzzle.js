// Title: King's Gambit
// Author: GemmaOane
// Video: https://www.youtube.com/watch?v=kk8vb1TJcpM
// Source: https://app.crackingthecryptic.com/sudoku/nNFRM62pbG
//
// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Digits along an arrow sum to the digit in that arrow's circle.
// Digits cannot repeat in a grey region (two 9-cell regions).
// Cells a king's move apart cannot hold the same digit (global AntiKing).
//
// The circle at R4C3 is shared by two separate arrows (drawn as two distinct
// lines leaving the same bulb): one runs R4C3 -> R4C4,R4C5,R5C5, the other
// R4C3 -> R5C2,R6C1. Both `Arrow` constraints below share that bulb cell.
// The circle at R6C7 is likewise both an arrow's own bulb and an arm cell of
// a different arrow (R8C5's arrow ends at R6C7).
return [
  new Shape('9x9'),

  new AntiKing(),

  // Grey region A: the 3x4 block rows 2-5 / cols 2-4, minus column 3's top
  // three rows (which are left clear for the arrows through that area).
  new AllDifferent(
    'R2C2', 'R2C4',
    'R3C2', 'R3C4',
    'R4C2', 'R4C4',
    'R5C2', 'R5C3', 'R5C4',
  ),

  // Grey region B: the mirrored 4x3 block rows 5-8 / cols 6-8, minus column
  // 7's bottom three rows (left clear for the arrows through that area).
  new AllDifferent(
    'R5C6', 'R5C7', 'R5C8',
    'R6C6', 'R6C8',
    'R7C6', 'R7C8',
    'R8C6', 'R8C8',
  ),

  new Arrow('R6C7', 'R6C6', 'R6C5', 'R5C5'),
  new Arrow('R8C5', 'R7C6', 'R6C7'),
  new Arrow('R1C9', 'R1C8', 'R2C8', 'R3C8'),
  new Arrow('R2C4', 'R3C3', 'R2C2', 'R3C1'),
  new Arrow('R6C1', 'R7C1', 'R8C1', 'R9C1'),
  new Arrow('R4C3', 'R4C4', 'R4C5', 'R5C5'),
  new Arrow('R4C3', 'R5C2', 'R6C1'),
  new Arrow('R3C9', 'R4C9', 'R4C8', 'R4C7'),
  new Arrow('R7C7', 'R8C7', 'R9C7'),
];
