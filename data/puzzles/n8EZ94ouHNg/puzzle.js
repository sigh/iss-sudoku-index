// Title: Happy Easter
// Author: Peter Veenis (PjotrV)
// Video: https://www.youtube.com/watch?v=n8EZ94ouHNg
// Source: https://app.crackingthecryptic.com/sudoku/n7jmhb6HpN

// Normal sudoku rules apply (default Shape('9x9') row/col/box). No givens are
// drawn. Arrows: digits along the arm sum to the bulb digit (Arrow, bulb
// first). Purple lines: consecutive non-repeating digit sets (Renban). Green
// lines: adjacent digits differ by >= 5 (Whisper(5)). Grey lines: palindromes
// (Palindrome); all three drawn grey lines are only 2 cells, so each just
// forces its pair of cells equal. Grey circles: odd digits (Given). The
// white/grey-bordered circle at R7C5 is the arrows' shared bulb outline, not
// an odd-digit circle -- "opaque grey circles" names fill colour, and this
// one's fill is white.

return [
  new Shape('9x9'),

  // Odd-digit circles (solid grey fill), from the two underlays.
  new Given('R5C4', 1, 3, 5, 7, 9),
  new Given('R5C6', 1, 3, 5, 7, 9),

  // Arrows: all six share the R7C5 bulb ("bunny ears/whiskers" radiating
  // out); each arm is an independent constraint summing to R7C5.
  new Arrow('R7C5', 'R6C6', 'R6C7', 'R5C8'),
  new Arrow('R7C5', 'R7C6', 'R7C7', 'R6C8'),
  new Arrow('R7C5', 'R8C6', 'R8C7', 'R9C8'),
  new Arrow('R7C5', 'R7C4', 'R7C3', 'R6C2'),
  new Arrow('R7C5', 'R6C4', 'R5C3', 'R5C2'),
  new Arrow('R7C5', 'R8C4', 'R8C3', 'R9C2'),

  // Purple lines (Renban).
  new Renban('R9C1', 'R8C1'),
  new Renban('R9C4', 'R8C3', 'R7C3', 'R6C3', 'R5C3'),
  new Renban('R5C7', 'R4C6', 'R3C7', 'R3C8', 'R3C9', 'R2C8', 'R2C7'),
  new Renban('R3C6', 'R3C5', 'R2C5', 'R1C6', 'R1C5', 'R2C4'),

  // Green lines (Whisper, difference >= 5).
  new Whisper(5, 'R8C9', 'R9C9'),
  new Whisper(5, 'R9C6', 'R8C7', 'R7C7', 'R6C7', 'R5C7'),
  new Whisper(5, 'R4C4', 'R3C4', 'R2C4'),
  new Whisper(5, 'R3C1', 'R2C1', 'R1C1', 'R1C2'),

  // Grey lines (Palindrome), each 2 cells.
  new Palindrome('R4C1', 'R3C2'),
  new Palindrome('R5C3', 'R4C4'),
  new Palindrome('R3C6', 'R2C7'),
];
