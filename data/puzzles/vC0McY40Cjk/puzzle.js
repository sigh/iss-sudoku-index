// Title: Colorful Whispers
// Author: Sneppix
// Video: https://www.youtube.com/watch?v=vC0McY40Cjk
// Source: https://sudokupad.app/10d7569and

// Normal Sudoku rules apply.
// German Whispers (green lines): adjacent digits differ by at least 5.
// Dutch Whispers (orange lines): adjacent digits differ by at least 4.
// Inequality sign between two cells points toward the smaller of the two.

return [
  new Shape('9x9'),

  // German Whispers (green), difference >= 5
  new Whisper(5, 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'),
  new Whisper(5, 'R5C2', 'R5C3', 'R5C4'),
  new Whisper(5, 'R5C8', 'R5C9'),
  new Whisper(5, 'R1C3', 'R2C3', 'R3C3', 'R4C3'),
  new Whisper(5, 'R1C2', 'R2C2'),
  new Whisper(5, 'R2C5', 'R2C6', 'R2C7'),
  new Whisper(5, 'R2C9', 'R3C9', 'R4C9'),
  new Whisper(5, 'R6C9', 'R7C9', 'R8C9'),
  new Whisper(5, 'R7C4', 'R8C4'),

  // Dutch Whispers (orange), difference >= 4
  new Whisper(4, 'R1C1', 'R2C1', 'R3C1'),
  new Whisper(4, 'R5C5', 'R5C6', 'R5C7'),
  new Whisper(4, 'R7C2', 'R8C2', 'R9C2'),
  new Whisper(4, 'R7C3', 'R8C3', 'R9C3'),
  new Whisper(4, 'R6C6', 'R6C7', 'R6C8'),

  // Inequality: R7C7 > R7C8
  new GreaterThan('R7C7', 'R7C8'),
];
