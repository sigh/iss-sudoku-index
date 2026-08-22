// Title: Don't You Dare
// Author: Bakpao
// Video: https://www.youtube.com/watch?v=jzIFuJEuX5g
// Source: https://app.crackingthecryptic.com/sudoku/J3nbjRB8H8

// Normal sudoku rules (rows, columns, boxes all-different) apply. Each cage
// is a killer cage: digits do not repeat within it and it sums to the shown
// total. Cage cell lists below are transcribed from the puzzle's drawn cage
// geometry, top-left cell first as drawn.

return [
  new Shape('9x9'),

  new Cage(13, 'R4C2', 'R4C1', 'R3C1', 'R2C1'),
  new Cage(13, 'R2C2', 'R2C3', 'R2C4', 'R1C4'),
  new Cage(14, 'R2C5', 'R2C6', 'R2C7', 'R1C7'),
  new Cage(24, 'R2C8', 'R2C9', 'R3C9', 'R4C9'),
  new Cage(25, 'R4C4', 'R4C5', 'R4C6', 'R3C6'),
  new Cage(20, 'R4C7', 'R5C7', 'R6C7'),
  new Cage(11, 'R5C8', 'R5C9'),
  new Cage(19, 'R6C9', 'R7C9', 'R8C9', 'R8C8'),
  new Cage(21, 'R6C4', 'R6C5', 'R6C6', 'R7C6'),
  new Cage(13, 'R9C7', 'R8C7', 'R8C6', 'R8C5'),
  new Cage(14, 'R9C4', 'R8C4', 'R8C3', 'R8C2'),
  new Cage(13, 'R8C1', 'R7C1', 'R6C1', 'R6C2'),
];
