// Title: StarCraft Sudoku
// Author: Alice
// Video: https://www.youtube.com/watch?v=h4tpMbROJJY
// Source: https://cracking-the-cryptic.web.app/sudoku/3MB4bh3GMH

// Standard 9x9 sudoku; the source's nine regions are the ordinary 3x3 boxes.
//
// A caption printed in the lane below the grid, one fragment under each column
// and read left to right, is the puzzle's only written rule:
//   "Z = 1,2,3;  T = 4,5,6;  P = 7,8,9."
// Each letter is printed on the colour of one of the three groups of shaded
// cells (Z purple, T yellow-green, P sky-blue), so the caption is the legend
// for the shading: a shaded cell holds one of the three digits its colour
// names. Encoded below as a multi-value Given per shaded cell.
//
// Omitted: the video description states the rules are given in the video, and
// the caption above is the only rule the source writes down. Any further
// spoken rule is not present in the source and is not encoded, so this
// encoding does not pin the grid down.

return [
  new Shape('9x9'),

  // Printed givens, read off the grid.
  new Given('R1C1', 8),
  new Given('R1C7', 2),
  new Given('R2C5', 7),
  new Given('R3C2', 3),
  new Given('R3C4', 5),
  new Given('R3C8', 6),
  new Given('R4C2', 4),
  new Given('R4C4', 1),
  new Given('R4C9', 2),
  new Given('R5C3', 8),
  new Given('R5C9', 9),
  new Given('R7C8', 5),
  new Given('R8C6', 1),
  new Given('R9C3', 4),
  new Given('R9C4', 9),
  new Given('R9C9', 7),

  // Shaded cells, read off the coloured background squares.
  // Z, purple:
  new Given('R2C6', 1, 2, 3),
  new Given('R6C1', 1, 2, 3),
  new Given('R7C2', 1, 2, 3),
  new Given('R8C9', 1, 2, 3),
  // T, yellow-green:
  new Given('R1C3', 4, 5, 6),
  new Given('R4C6', 4, 5, 6),
  new Given('R5C2', 4, 5, 6),
  new Given('R5C5', 4, 5, 6),
  new Given('R6C8', 4, 5, 6),
  new Given('R7C6', 4, 5, 6),
  // P, sky-blue:
  new Given('R1C8', 7, 8, 9),
  new Given('R5C6', 7, 8, 9),
  new Given('R7C1', 7, 8, 9),
];
