// Title: Kropki DotS
// Author: Nityant Agarwal
// Video: https://www.youtube.com/watch?v=A-Wsb-4z2Wg
// Source: https://sudokupad.app/BtghmrqfDb

// Normal Sudoku applies. Adjacent cells along each green stroke differ by at
// least 5. Black dots are 2:1 ratios; white dots are consecutive. No negative
// Kropki rule is stated, so unmarked adjacent pairs have no dot restriction.
// Green paths and dot locations are transcribed from the drawn source geometry.
return [
  new Shape('9x9'),
  new Given('R1C6', 9),
  new Given('R9C4', 1),

  new Whisper(5,
    'R3C5', 'R4C5', 'R5C6', 'R6C7', 'R7C7', 'R8C6', 'R9C5',
    'R8C4', 'R7C3', 'R6C3', 'R5C4', 'R4C3', 'R3C3', 'R2C4',
    'R1C5', 'R2C6', 'R3C7', 'R4C7', 'R5C6'),
  // This second Whisper encodes the branch beginning at the main stroke's R5C4.
  new Whisper(5, 'R5C4', 'R6C5', 'R7C5'),

  new BlackDot('R2C1', 'R3C1'),
  new BlackDot('R2C9', 'R3C9'),
  new BlackDot('R4C5', 'R5C5'),
  new BlackDot('R5C5', 'R6C5'),
  new WhiteDot('R6C1', 'R7C1'),
  new WhiteDot('R6C9', 'R7C9'),
  new WhiteDot('R8C3', 'R9C3'),
  new WhiteDot('R8C7', 'R9C7'),
];
