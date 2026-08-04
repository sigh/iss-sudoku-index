// Title: Molly Hogan
// Author: DylanD
// Video: https://www.youtube.com/watch?v=1Y2CNJb9Aek
// Source: https://app.crackingthecryptic.com/sudoku/QP8dphbD78

// Normal sudoku (standard 3x3 boxes). Grey lines are palindromes. Each arrow's
// circle cell equals the sum of the rest of its path. Each cage sums to its
// top-left total (standard killer no-repeat convention). Grey and yellow 1x3
// strips are clone pairs: same digits, same order.
//
// Clone correspondence: both strips of each pair are drawn in the same
// (top-to-bottom) orientation -- no rotation or reflection between them -- so
// "identical order" is matched cell-by-cell in that shared top-to-bottom
// order (R1C1=R7C9 etc., not R1C1=R9C9). Encoded as one SameValues(2, a, b)
// per matched cell pair: a plain positional equality between two cells.

return [
  new Shape('9x9'),

  new Given('R6C3', 7),
  new Given('R6C5', 5),
  new Given('R6C7', 9),

  // Cages: top-left total, killer (distinct + sum).
  new Cage(23, 'R5C4', 'R5C5', 'R5C6'),
  new Cage(14, 'R4C4', 'R4C5', 'R4C6'),

  // Palindrome lines (grey lines "read the same in either direction").
  new Palindrome('R4C1', 'R5C1', 'R6C1', 'R7C2', 'R8C2', 'R9C2'),
  new Palindrome('R6C9', 'R5C9', 'R4C9', 'R3C8', 'R2C8', 'R1C8'),
  new Palindrome('R2C2', 'R2C3', 'R1C4', 'R1C5'),
  new Palindrome('R9C5', 'R9C6', 'R8C7', 'R8C8'),

  // Arrows: first cell is the circle, sum of the rest equals it.
  new Arrow('R9C3', 'R8C3', 'R7C3', 'R6C2', 'R5C2'),
  new Arrow('R1C7', 'R2C7', 'R3C7', 'R4C8', 'R5C8'),
  new Arrow('R7C8', 'R7C7', 'R8C6', 'R8C5'),
  new Arrow('R3C2', 'R3C3', 'R2C4', 'R2C5'),

  // Clone pairs (see header note for the correspondence).
  new SameValues(2, 'R1C1', 'R7C9'),
  new SameValues(2, 'R2C1', 'R8C9'),
  new SameValues(2, 'R3C1', 'R9C9'),
  new SameValues(2, 'R7C1', 'R1C9'),
  new SameValues(2, 'R8C1', 'R2C9'),
  new SameValues(2, 'R9C1', 'R3C9'),
];
