// Title: My First Puzzle
// Author: DC
// Video: https://www.youtube.com/watch?v=7VjrR28PwZc
// Source: https://sudokupad.app/ccuy2qpupj

// Normal sudoku rules apply.
// White dot: consecutive digits.
// Black dot: one digit is double the other.
// X (edge): digits sum to 10.
// V (edge): digits sum to 5.
// Thermometer: digits increase from bulb to tip.
// Arrow: digits along the arrow sum to the digit in the attached circle
//   (the circled cell is the first arrow cell).
// Green line: neighbouring digits along the line differ by at least 5.

return [
  new Shape('9x9'),

  // White dots (consecutive).
  new WhiteDot('R3C7', 'R4C7'),
  new WhiteDot('R8C8', 'R9C8'),
  new WhiteDot('R9C4', 'R9C5'),
  new WhiteDot('R7C4', 'R7C5'),
  new WhiteDot('R2C2', 'R3C2'),

  // Black dots (double).
  new BlackDot('R1C6', 'R1C7'),
  new BlackDot('R1C7', 'R2C7'),
  new BlackDot('R4C3', 'R5C3'),
  new BlackDot('R4C1', 'R4C2'),

  // X dots (sum to 10).
  new X('R3C2', 'R4C2'),
  new X('R1C2', 'R1C3'),
  new X('R4C7', 'R5C7'),
  new X('R6C8', 'R6C9'),

  // V dots (sum to 5).
  new V('R3C5', 'R3C6'),
  new V('R3C5', 'R4C5'),
  new V('R7C1', 'R7C2'),

  // Thermometer (bulb at R5C1).
  new Thermo('R5C1', 'R4C2', 'R4C3', 'R4C4', 'R5C4'),

  // Arrows (circle cell first, then the arm).
  new Arrow('R7C3', 'R7C2', 'R8C2'),
  new Arrow('R8C4', 'R9C4', 'R8C5'),
  new Arrow('R9C6', 'R9C5', 'R8C5'),
  new Arrow('R7C6', 'R8C6', 'R8C7'),
  new Arrow('R4C6', 'R5C5', 'R4C5', 'R3C6'),

  // Green lines (adjacent digits differ by at least 5).
  new Whisper(5, 'R1C4', 'R1C3', 'R2C3', 'R3C4', 'R4C3', 'R5C2', 'R6C3'),
  new Whisper(5, 'R5C3', 'R6C4', 'R7C5', 'R6C6', 'R6C7', 'R7C8', 'R8C8', 'R8C7', 'R9C7'),
  new Whisper(5, 'R3C8', 'R2C8', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9'),
];
