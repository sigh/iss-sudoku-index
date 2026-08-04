// Title: No Idea
// Author: Rysmyth
// Video: https://www.youtube.com/watch?v=zqJ4K1QsqYY
// Source: https://app.crackingthecryptic.com/sudoku/TPh3mNmrp6

// Normal sudoku rules apply (standard rows/columns/3x3 boxes, default Shape).
// No givens.
//
// Quadruple circles: the four digits shown must appear in the surrounding
// 2x2 cells. Each circle's digits are drawn as two stacked two-digit lines
// in the source art; the digit set below is their union.
//
// Thermometer: digits strictly increase from the bulb along the drawn path.
//
// Palindrome lines: the digit sequence reads the same forwards and
// backwards.
//
// Outside diagonal-sum clue "24": the digits along the marked diagonal sum
// to 24 (Little Killer style; diagonal runs from R4C1 down-right to R9C6).

return [
  new Shape('9x9'),

  // Quadruple circles (topLeftCell, ...values); positions are the four
  // inner box-corner intersections.
  new Quad('R3C3', 2, 4, 8, 9),
  new Quad('R3C6', 1, 5, 6, 7),
  new Quad('R6C3', 1, 2, 7, 9),
  new Quad('R6C6', 3, 4, 5, 8),

  // Thermometer: bulb R4C9, increasing along the drawn path.
  new Thermo('R4C9', 'R3C8', 'R3C9', 'R2C8', 'R1C9', 'R2C9'),

  // Palindrome lines (orange).
  new Palindrome(
    'R4C6', 'R4C7', 'R4C8', 'R5C8', 'R5C7', 'R6C7', 'R7C8', 'R6C8', 'R7C9',
    'R8C8', 'R7C7', 'R8C7', 'R9C6', 'R8C6', 'R7C5', 'R6C4', 'R5C4', 'R4C4',
    'R3C5', 'R2C5', 'R2C4', 'R2C3', 'R1C2', 'R2C1', 'R3C1', 'R4C1', 'R4C2',
    'R5C1', 'R6C1', 'R7C1'
  ),
  new Palindrome(
    'R5C2', 'R6C2', 'R7C3', 'R8C2', 'R9C2', 'R8C3', 'R7C4', 'R8C5', 'R9C5',
    'R8C4', 'R9C4', 'R9C3'
  ),

  // Outside diagonal sum: total 24 over the diagonal starting R4C1,
  // running down-right to R9C6.
  LittleKiller.fromCells(
    24,
    cellGraph('9x9').ray('R4C1', 1, 1),
    cellGeometry('9x9')
  ),
];
