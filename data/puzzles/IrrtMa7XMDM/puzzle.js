// Title: RAT RUN 38: Synchronicity
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=IrrtMa7XMDM
// Source: https://sudokupad.app/up5nrki10o

// Partial encoding. ISS represents the normal Sudoku grid plus the static
// digit clues. The discovered two-path maze rule is documented in notes.md.
return [
  new Shape('9x9'),

  // Blackcurrants: one digit is double the other.
  new BlackDot('R2C4', 'R2C5'),
  new BlackDot('R3C4', 'R4C4'),

  // Purple arrows point to the smaller of the two adjacent digits.
  new GreaterThan('R8C6', 'R8C5'),
  new GreaterThan('R8C9', 'R9C9'),
];
