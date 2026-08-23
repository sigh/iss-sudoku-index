// Title: The Odd One
// Author: Joseph Nehme
// Video: https://www.youtube.com/watch?v=2oPrQ_hCags
// Source: https://app.crackingthecryptic.com/sudoku/7T4HppdMRT

// Standard killer sudoku: normal sudoku rules (default row/column/box
// all-different), plus cages summing to the digit printed in each cage's
// top-left cell, with no digit repeated within a cage. Cage cells and totals
// transcribed from the payload's `cages` array (10 real entries; the rest are
// metadata stubs).

return [
  new Shape('9x9'),

  new Cage(12, 'R2C4', 'R3C4', 'R3C3', 'R4C3'),
  new Cage(12, 'R2C5', 'R3C5', 'R3C6', 'R3C7'),
  new Cage(12, 'R2C8', 'R3C8', 'R4C8', 'R4C7'),
  new Cage(12, 'R4C5', 'R5C5', 'R5C6', 'R6C6'),
  new Cage(12, 'R4C2', 'R5C2', 'R5C3', 'R6C3'),
  new Cage(20, 'R6C1', 'R6C2', 'R7C2', 'R7C3'),
  new Cage(28, 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4'),
  new Cage(12, 'R7C5', 'R8C5', 'R8C4', 'R8C3'),
  new Cage(12, 'R8C8', 'R9C8', 'R9C7', 'R9C9'),
  new Cage(27, 'R7C8', 'R7C9', 'R6C9', 'R5C9', 'R4C9'),
];
