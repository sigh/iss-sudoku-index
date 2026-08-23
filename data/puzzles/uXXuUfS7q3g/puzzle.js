// Title: Potpourri
// Author: zetamath
// Video: https://www.youtube.com/watch?v=uXXuUfS7q3g
// Source: https://app.crackingthecryptic.com/sudoku/f3FQJG6rbq

// Normal sudoku (rows/cols/boxes) plus:
// - Green lines: adjacent digits differ by >= 5 (Whisper, default difference).
// - Purple lines: digits form a consecutive, non-repeating set in any order
//   (Renban).
// - Arrows: digits along the arm sum to the digit in the circle. Both arrows
//   here share the same circle cell (R5C5) with two different arms.
// - X: adjacent pair sums to 10. V: adjacent pair sums to 5. No exhaustiveness
//   clause is stated ("all such pairs marked"), so unmarked adjacent pairs are
//   left unconstrained.

return [
  new Shape('9x9'),

  new Given('R8C7', 8),

  // Green whisper lines (diff >= 5), from source line coordinates.
  new Whisper(5, 'R4C1', 'R5C2', 'R6C1', 'R7C2', 'R8C1', 'R9C1'),
  new Whisper(5, 'R1C9', 'R2C9', 'R3C8', 'R4C9', 'R5C8', 'R6C9'),

  // Purple renban lines (consecutive set, any order).
  new Renban('R2C4', 'R3C4', 'R3C3', 'R3C2'),
  new Renban('R6C6', 'R7C6', 'R7C7', 'R7C8'),

  // Arrows: circle cell first, then arm cells. Both share circle R5C5.
  new Arrow('R5C5', 'R4C6', 'R3C6'),
  new Arrow('R5C5', 'R6C4', 'R7C4'),

  // X pairs (sum to 10), each a single marked adjacent pair.
  new X('R1C1', 'R2C1'),
  new X('R1C5', 'R2C5'),
  new X('R8C5', 'R9C5'),
  new X('R8C9', 'R9C9'),

  // V pairs (sum to 5), each a single marked adjacent pair.
  new V('R4C4', 'R4C5'),
  new V('R6C5', 'R6C6'),
];
