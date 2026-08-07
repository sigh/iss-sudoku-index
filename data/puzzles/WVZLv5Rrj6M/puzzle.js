// Title: Merry-Go-Round
// Author: Kestrel
// Video: https://www.youtube.com/watch?v=WVZLv5Rrj6M
// Source: https://app.crackingthecryptic.com/sudoku/g4nPPf8jLh

// Normal sudoku rules apply (default row/column/box all-different, standard
// boxes per the payload's `regions` array). Cage digits are all-different and
// sum to the labelled total; one cage is drawn with no total, so it is
// all-different only. Not all dots/X/V dominoes are given, so absence of a
// mark carries no constraint (no StrictXV / negative-dot global is added).

return [
  new Shape('9x9'),

  // Cages (killer-style: unique digits, sum to total). One cage (R2C6-8,
  // R3C6) is drawn with no total.
  new Cage(40, 'R1C1', 'R1C2', 'R1C3', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1'),
  new Cage(12, 'R3C3', 'R3C4'),
  new Cage('', 'R2C6', 'R2C7', 'R2C8', 'R3C6'),
  new Cage(20, 'R4C8', 'R5C8', 'R6C8'),
  new Cage(16, 'R6C9', 'R7C9', 'R8C9', 'R9C9'),
  new Cage(29, 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5'),

  // White dots: consecutive digits.
  new WhiteDot('R7C7', 'R7C8'),
  new WhiteDot('R2C3', 'R2C4'),
  new WhiteDot('R3C2', 'R4C2'),

  // Black dots: 1:2 ratio.
  new BlackDot('R3C1', 'R3C2'),
  new BlackDot('R3C8', 'R4C8'),
  new BlackDot('R8C5', 'R8C6'),
  new BlackDot('R8C2', 'R8C3'),

  // X dominoes: digits sum to 10.
  new X('R7C1', 'R7C2'),
  new X('R5C1', 'R5C2'),
  new X('R5C4', 'R5C5'),
  new X('R4C5', 'R4C6'),

  // V dominoes: digits sum to 5.
  new V('R4C5', 'R5C5'),
  new V('R9C8', 'R9C9'),
  new V('R8C7', 'R9C7'),
];
