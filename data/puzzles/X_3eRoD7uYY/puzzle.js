// Title: Hourglass
// Author: Sudoku Joker
// Video: https://www.youtube.com/watch?v=X_3eRoD7uYY
// Source: https://sudokupad.app/46kiwzb3b5

// Normal sudoku rules apply.
//
// Region Sum line (blue): divided into sections by the 3x3 box borders; each
// section has the same sum. The line crosses the centre box (box 5) three
// times, and per the stated rule all of those crossings count together as a
// single section rather than three separate ones, so the box-5 cells are
// grouped into one EqualSum segment instead of using RegionSumLine (which
// would otherwise split each box-5 crossing into its own equal-sum segment).
//
// Dutch Whisper (orange): adjacent digits on a line differ by at least 4.
// There are four separate orange lines; two of them share the cell R7C5.
//
// X / V: the two cells joined by a letter sum to 10 (X) or 5 (V).

return [
  new Shape('9x9'),

  // Region Sum line (blue), one section per box, box 5 merged into one.
  new EqualSum(
    ['R2C3', 'R3C3'],
    ['R2C4', 'R2C5', 'R2C6'],
    ['R2C7', 'R3C7'],
    ['R4C4', 'R4C6', 'R5C5', 'R6C4', 'R6C6'],
    ['R7C3', 'R8C3'],
    ['R8C4', 'R8C5', 'R8C6'],
    ['R7C7', 'R8C7'],
  ),

  // Dutch Whisper lines (orange), adjacent difference >= 4.
  new Whisper(4, 'R2C3', 'R2C2', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R2C8', 'R2C7'),
  new Whisper(4, 'R8C3', 'R8C2', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R8C8', 'R8C7'),
  new Whisper(4, 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7'),
  new Whisper(4, 'R5C5', 'R6C5', 'R7C5', 'R8C4'),
  new Whisper(4, 'R7C5', 'R8C6'),

  // X (=10) / V (=5) sums.
  new Sum(10, 'R1C2', 'R1C3'),
  new Sum(10, 'R4C2', 'R4C3'),
  new Sum(10, 'R4C4', 'R4C5'),
  new Sum(10, 'R6C5', 'R6C6'),
  new Sum(5, 'R6C7', 'R6C8'),
  new Sum(10, 'R9C7', 'R9C8'),
];
