// Title: Sudoku Meets Tetris
// Author: Ryan Oswald
// Video: https://www.youtube.com/watch?v=qqhwBX1VozQ
// Source: https://cracking-the-cryptic.web.app/sudoku/FL2ND6b6MF

// Standard 9x9 sudoku (default rows/cols/boxes; the source's nine regions are
// the ordinary 3x3 boxes) plus the 13 printed givens.
//
// The source carries no rules text at all. Besides the givens the only thing it
// draws is 28 cells of solid light-grey background, all one colour and carrying
// no numeral, letter or legend. They form seven disjoint orthogonally connected
// four-cell pieces -- tetrominoes:
//
//   R1C2 R1C3 R2C2 R3C2 | R1C7 R1C8 R2C8 R2C9 | R3C4 R3C5 R3C6 R4C5
//   R4C1 R5C1 R6C1 R6C2 | R5C8 R5C9 R6C8 R6C9 | R7C3 R8C3 R9C3 R9C4
//   R7C7 R8C7 R9C6 R9C7
//
// Nothing printed says what those groups require of their digits, so the grey
// shading is omitted from the encoding.
//
// Givens transcribed from the printed digit of each cell.

return [
  new Shape('9x9'),

  new Given('R1C1', 7),
  new Given('R1C5', 8),
  new Given('R1C9', 9),
  new Given('R3C3', 6),
  new Given('R3C7', 7),
  new Given('R5C1', 2),
  new Given('R5C5', 4),
  new Given('R5C9', 5),
  new Given('R7C3', 2),
  new Given('R7C7', 3),
  new Given('R9C1', 8),
  new Given('R9C5', 6),
  new Given('R9C9', 7),
];
