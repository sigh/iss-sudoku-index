// Title: TvZ StarCraft Sudoku
// Author: Matt Iverson
// Video: https://www.youtube.com/watch?v=-2huF9FMi2I
// Source: https://cracking-the-cryptic.web.app/sudoku/M3DN73JQf4

// Standard 9x9 sudoku (default rows/cols/boxes; the source's nine regions are
// the ordinary 3x3 boxes) plus the 24 printed givens.
//
// The source carries no rules text at all. Besides the givens it draws only
// two things whose meaning nothing printed fixes, and both are omitted here:
//
//   1. 28 solid background squares in two colours -- 13 orange and 15 purple
//      -- covering the anti-diagonal of every 3x3 box plus the extra cell
//      R1C1. No legend, letter or caption accompanies them.
//   2. Six solid background squares in the margin, yellow-green just outside
//      the top-right grid corner and red just outside the bottom-left corner,
//      three at each corner.
//
// Givens transcribed from the printed digit of each cell.

return [
  new Shape('9x9'),

  new Given('R1C1', 6),
  new Given('R1C3', 9),
  new Given('R1C6', 7),
  new Given('R1C9', 8),
  new Given('R2C2', 8),
  new Given('R2C5', 6),
  new Given('R2C8', 9),
  new Given('R3C1', 7),
  new Given('R3C4', 4),
  new Given('R3C7', 5),
  new Given('R4C3', 7),
  new Given('R4C6', 8),
  new Given('R4C9', 5),
  new Given('R5C2', 6),
  new Given('R5C5', 4),
  new Given('R6C4', 6),
  new Given('R6C7', 4),
  new Given('R7C3', 4),
  new Given('R7C9', 6),
  new Given('R8C5', 5),
  new Given('R8C8', 7),
  new Given('R9C1', 9),
  new Given('R9C4', 7),
  new Given('R9C7', 8),
];
