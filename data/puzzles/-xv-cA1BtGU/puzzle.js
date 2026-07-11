// Title: Ringing the changes
// Author: Fool on Hill
// Video: https://www.youtube.com/watch?v=-xv-cA1BtGU
// Source: https://sudokupad.app/zhsltyic9o

// Normal sudoku rules (default 3x3 boxes). No given digits.
//
// German whisper (green): four closed loops, each running around the four
// cells of a 2x2 square in a grid corner. Adjacent digits along a loop
// differ by at least 5.
//
// Renban (pink): three small three-cell lines, plus one nine-cell line
// forming the central cross (drawn as two crossing diagonals sharing the
// centre cell, but stated in the rules to be a single line). Digits on each
// line form a consecutive, non-repeating set in any order.
//
// Kropki dots: a black dot means one digit is double the other; a white dot
// means the two digits are consecutive. Not all such pairs are dotted.

return [
  new Shape('9x9'),

  // German whisper loops (corner 2x2 squares).
  new Whisper(5, 'R1C1', 'R1C2', 'R2C2', 'R2C1', 'R1C1'),
  new Whisper(5, 'R1C8', 'R1C9', 'R2C9', 'R2C8', 'R1C8'),
  new Whisper(5, 'R8C1', 'R8C2', 'R9C2', 'R9C1', 'R8C1'),
  new Whisper(5, 'R8C8', 'R8C9', 'R9C9', 'R9C8', 'R8C8'),

  // Small three-cell Renban lines.
  new Renban('R4C3', 'R5C3', 'R5C4'),
  new Renban('R3C5', 'R3C6', 'R4C5'),
  new Renban('R5C6', 'R6C7', 'R5C7'),

  // Central cross: one nine-cell Renban line (two diagonals sharing R5C5).
  new Renban(
    'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3',
    'R7C7', 'R6C6', 'R4C4', 'R3C3'),

  // Black (double) dots.
  new BlackDot('R1C2', 'R1C3'),
  new BlackDot('R2C1', 'R3C1'),
  new BlackDot('R5C2', 'R6C2'),
  new BlackDot('R5C6', 'R5C7'),

  // White (consecutive) dots.
  new WhiteDot('R2C7', 'R2C8'),
  new WhiteDot('R2C9', 'R3C9'),
  new WhiteDot('R7C1', 'R8C1'),
  new WhiteDot('R9C3', 'R9C4'),
];
