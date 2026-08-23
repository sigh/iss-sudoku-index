// Title: Quatre Coins
// Author: tallcat
// Video: https://www.youtube.com/watch?v=yiATtxEl1XE
// Source: https://app.crackingthecryptic.com/sudoku/8DQ8dmt3bg

// Normal sudoku rules apply. Digits along an arrow sum to the digit in that
// arrow's circle. A black dot pair is in a 1:2 ratio; a white dot pair is
// consecutive; not all dots are given (dots are not exhaustive). Each of the
// two main diagonals (drawn in blue) has no repeated digit.
//
// The four arrow circles (R3C3, R3C7, R7C3, R7C7) also happen to sit on the
// diagonals, but the rules state one all-different rule per whole diagonal,
// not per segment, so each diagonal is a single 9-cell group.

return [
  new Shape('9x9'),

  new Diagonal(-1), // main diagonal R1C1..R9C9 ('\\')
  new Diagonal(1),  // anti-diagonal R1C9..R9C1 ('/')

  // Arrows: circle cell first, then arm cells, per Arrow(...cells) semantics.
  new Arrow('R3C3', 'R3C2', 'R3C1', 'R2C1'),
  new Arrow('R3C7', 'R2C7', 'R1C7', 'R1C8'),
  new Arrow('R7C7', 'R7C8', 'R7C9', 'R8C9'),
  new Arrow('R7C3', 'R8C3', 'R9C3', 'R9C2'),

  // White dots (consecutive), transcribed from the payload's overlay edges.
  new WhiteDot('R1C1', 'R1C2'),
  new WhiteDot('R1C3', 'R2C3'),
  new WhiteDot('R1C5', 'R2C5'),
  new WhiteDot('R1C9', 'R2C9'),
  new WhiteDot('R3C8', 'R3C9'),
  new WhiteDot('R4C1', 'R4C2'),
  new WhiteDot('R7C1', 'R8C1'),
  new WhiteDot('R7C2', 'R8C2'),
  new WhiteDot('R8C7', 'R9C7'),
  new WhiteDot('R9C8', 'R9C9'),

  // Black dot (1:2 ratio).
  new BlackDot('R4C5', 'R5C5'),
];
