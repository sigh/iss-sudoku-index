// Title: Whirlygig
// Author: Tallcat
// Video: https://www.youtube.com/watch?v=mNKUQYGv12M
// Source: https://tinyurl.com/tc-whirly

// Normal sudoku rules on a 9x9 grid with standard 3x3 boxes (no custom
// regions drawn). Renban lines require consecutive, non-repeating digits in
// any order. German Whisper lines require adjacent digits to differ by at
// least 5, with repeats on a line otherwise allowed.

return [
  new Shape('9x9'),

  new Given('R4C7', 6),
  new Given('R9C1', 3),

  // Renban lines (pink), cell order as drawn in the source payload.
  new Renban('R4C4', 'R3C5', 'R2C5', 'R1C5'),
  new Renban('R6C6', 'R7C5', 'R8C5', 'R9C5'),
  new Renban('R6C4', 'R5C3', 'R5C2', 'R5C1'),
  new Renban('R4C6', 'R5C7', 'R5C8', 'R5C9'),
  new Renban('R7C9', 'R8C9', 'R9C9'),
  new Renban('R3C1', 'R2C1', 'R1C1'),
  new Renban('R1C9', 'R1C8', 'R1C7'),

  // German Whisper lines (green), cell order as drawn in the source payload.
  new Whisper(5, 'R4C5', 'R3C6', 'R3C7', 'R3C8', 'R3C9'),
  new Whisper(5, 'R5C6', 'R6C7', 'R7C7', 'R8C7', 'R9C7'),
  new Whisper(5, 'R6C5', 'R7C4', 'R7C3', 'R7C2', 'R7C1'),
  new Whisper(5, 'R5C4', 'R4C3', 'R3C3', 'R2C3', 'R1C3'),
  new Whisper(5, 'R8C2', 'R9C2'),
  new Whisper(5, 'R8C3', 'R8C4'),
];
