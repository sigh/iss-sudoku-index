// Title: Wrapped
// Author: Sotehr
// Video: https://www.youtube.com/watch?v=HmYktrkXLCc
// Source: https://sudokupad.app/wvau08bs7u

// Normal sudoku rules apply.
// Renban line (pink, solid): unordered set of consecutive digits, no repeats.
// German whisper line (green, hollow): adjacent cells differ by at least 5.
// Region sum line (blue, dashed): equal sum within each 3x3-box segment.
// Black Kropki dot: one digit is double the other.
// White Kropki dot: digits are consecutive.
// No given digits; the grid is determined purely by these lines and dots.

return [
  new Shape('9x9'),

  // Renban lines (pink)
  new Renban('R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7'),
  new Renban('R5C3', 'R4C3', 'R3C3', 'R3C4', 'R3C5'),
  new Renban('R8C4', 'R8C5', 'R8C6', 'R8C7', 'R7C8', 'R6C8', 'R5C8', 'R4C8'),

  // German whisper lines (green), minimum adjacent difference of 5
  new Whisper(5, 'R6C1', 'R7C1', 'R8C2'),
  new Whisper(5, 'R8C3', 'R7C4', 'R6C5', 'R6C6', 'R5C6', 'R4C7', 'R3C8'),
  new Whisper(5, 'R6C2', 'R5C2', 'R4C2', 'R3C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6'),

  // Region sum lines (blue), equal sum per 3x3-box segment
  new RegionSumLine('R7C2', 'R6C3', 'R5C4', 'R4C4', 'R4C5', 'R3C6', 'R2C7'),
  new RegionSumLine('R2C8', 'R3C9', 'R4C9'),
  new RegionSumLine('R7C5', 'R7C6', 'R7C7', 'R6C7', 'R5C7'),

  // Kropki dots
  new WhiteDot('R6C3', 'R7C3'),
  new WhiteDot('R3C7', 'R4C7'),
  new WhiteDot('R7C4', 'R7C5'),
  new WhiteDot('R3C5', 'R3C6'),
  new BlackDot('R7C7', 'R7C8'),
  new BlackDot('R3C2', 'R3C3'),
];
