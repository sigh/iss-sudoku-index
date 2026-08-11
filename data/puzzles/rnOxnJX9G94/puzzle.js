// Title: Medley
// Author: Marvin Kannhaeuser
// Video: https://www.youtube.com/watch?v=rnOxnJX9G94
// Source: https://app.crackingthecryptic.com/sudoku/R4pBr43gb4

// Rules: normal sudoku (rows/cols/boxes all-different, the drawn 3x3 boxes
// match the default). Two totalled 2-cell cages and one no-total 9-cell
// cage, all-different within every cage regardless of total. Main diagonal
// R1C1..R9C9 contains 1-9 once each (Diagonal(-1) is the "\" direction).
// Three 2x2 white-circle Quads: each named digit appears at least once in
// its 2x2. Two arrows: sum of the arm cells equals the bulb digit (bulb is
// the Arrow's first cell). One two-cell grey palindrome forces its two
// cells equal. The grey-square cell R9C9 must be even. Three X marks
// (sum 10), four black dots (ratio 1:2), five white dots (consecutive) on
// adjacent cell pairs.
//
// Omitted: none. A few drawn styling stubs render nothing and are not
// clues.

return [
  new Shape('9x9'),

  // Cages.
  new Cage(12, 'R1C7', 'R1C8'),
  new Cage(12, 'R7C1', 'R8C1'),
  // No printed total: all-different only. Spans boxes 6, 8 and 9.
  new AllDifferent(
    'R7C5', 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R7C8', 'R6C8', 'R5C8', 'R5C7'),

  // Main diagonal (blue line R1C1-R9C9): 1-9 once each.
  new Diagonal(-1),

  // White circles: each is a 2x2 Quad naming digits that must each appear
  // at least once in the 2x2 (topLeft cell identifies the square).
  new Quad('R1C1', 6, 7, 8),
  new Quad('R2C2', 2, 4, 9),
  new Quad('R3C3', 2, 7, 8),

  // Arrows: first cell is the bulb (sum target), remaining cells the arm.
  new Arrow('R9C3', 'R8C4', 'R7C4'),
  new Arrow('R3C9', 'R4C8', 'R4C7'),

  // Two-cell grey palindrome: forces the pair equal.
  new Palindrome('R7C6', 'R6C7'),

  // Grey square: R9C9 must be even.
  new Given('R9C9', 2, 4, 6, 8),

  // X marks: sum to 10.
  new X('R8C2', 'R8C3'),
  new X('R9C1', 'R9C2'),
  new X('R1C9', 'R2C9'),

  // Black dots: ratio 1:2.
  new BlackDot('R7C4', 'R8C4'),
  new BlackDot('R5C5', 'R5C6'),
  new BlackDot('R5C7', 'R5C8'),
  new BlackDot('R7C8', 'R7C9'),

  // White dots: consecutive.
  new WhiteDot('R4C7', 'R4C8'),
  new WhiteDot('R1C4', 'R1C5'),
  new WhiteDot('R3C6', 'R3C7'),
  new WhiteDot('R6C8', 'R6C9'),
  new WhiteDot('R5C5', 'R6C5'),
];
