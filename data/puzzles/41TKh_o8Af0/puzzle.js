// Title: Herringbone
// Author: Qodec
// Video: https://www.youtube.com/watch?v=41TKh_o8Af0
// Source: https://app.crackingthecryptic.com/sudoku/9pHpmQqr79

// Normal sudoku (default row/column/box all-different). Cages sum to the
// corner total (Cage also enforces no repeats within a cage, the standard
// killer-cage reading; the rules never say otherwise). The 16 two-cell
// diagonal lines split into two styles by the drawn circle: a circled end is
// a thermometer bulb (Thermo enforces strictly increasing from the first
// cell given), an uncircled line is a palindrome (Palindrome on a 2-cell
// line enforces the two cells are equal). Bulb identity for each Thermo
// comes from the underlay circle coordinates, which coincide with one end
// of each th=12 line in the payload.

return [
  new Shape('9x9'),

  new Cage(20, 'R1C1', 'R1C2', 'R1C3'),
  new Cage(5, 'R1C4', 'R1C5'),
  new Cage(10, 'R2C7', 'R2C8'),
  new Cage(18, 'R4C1', 'R5C1', 'R6C1'),
  new Cage(12, 'R7C9', 'R8C9'),
  new Cage(18, 'R8C3', 'R9C3', 'R9C2'),
  new Cage(17, 'R9C4', 'R9C5'),

  new Thermo('R3C1', 'R4C2'),
  new Thermo('R3C3', 'R4C4'),
  new Thermo('R3C5', 'R4C6'),
  new Thermo('R3C7', 'R4C8'),
  new Thermo('R7C2', 'R6C3'),
  new Thermo('R7C4', 'R6C5'),
  new Thermo('R7C6', 'R6C7'),
  new Thermo('R7C8', 'R6C9'),

  new Palindrome('R3C2', 'R4C3'),
  new Palindrome('R3C4', 'R4C5'),
  new Palindrome('R3C6', 'R4C7'),
  new Palindrome('R3C8', 'R4C9'),
  new Palindrome('R7C1', 'R6C2'),
  new Palindrome('R7C3', 'R6C4'),
  new Palindrome('R7C5', 'R6C6'),
  new Palindrome('R7C7', 'R6C8'),
];
