// Title: Fourteen Plus Seven
// Author: BoB
// Video: https://www.youtube.com/watch?v=Qt0wEqrsgkI
// Source: https://app.crackingthecryptic.com/sudoku/FNdmDN3NnR

// Normal sudoku rules apply. Digits on an arrow sum to the pill's number,
// read left to right. Black dots join a 1:2 ratio, white dots join
// consecutive digits; the rules explicitly say not all dots are given, so
// no negative constraint is added for unmarked adjacent pairs.
//
// Both arrows are closed loops: the arm leaves the pill on one side and
// re-enters the grid area adjacent to the pill's other side. Arrow A's pill
// is R2C4-R2C5-R2C6 and its 32-cell arm is the grid's entire border ring.
// Arrow B's pill is R7C5-R7C6 and its 14-cell arm is the border of the
// 5x5 block rows3-7/cols3-7 minus the two pill cells. `PillArrow` takes the
// pill cells (any order -- it sorts them itself) followed by the arm cells.

const arrows = [
  new PillArrow(3, 'R2C4', 'R2C5', 'R2C6',
    'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9',
    'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9',
    'R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2', 'R9C1',
    'R8C1', 'R7C1', 'R6C1', 'R5C1', 'R4C1', 'R3C1', 'R2C1', 'R1C1',
    'R1C2', 'R1C3', 'R1C4'),
  new PillArrow(2, 'R7C5', 'R7C6',
    'R7C7', 'R6C7', 'R5C7', 'R4C7', 'R3C7',
    'R3C6', 'R3C5', 'R3C4', 'R3C3',
    'R4C3', 'R5C3', 'R6C3', 'R7C3', 'R7C4'),
];

const whiteDots = [
  // Kropki white dots (consecutive digits).
  new WhiteDot('R6C1', 'R6C2'),
  new WhiteDot('R1C7', 'R2C7'),
  new WhiteDot('R2C7', 'R3C7'),
  new WhiteDot('R1C3', 'R2C3'),
  new WhiteDot('R2C3', 'R3C3'),
  new WhiteDot('R9C6', 'R9C7'),
  new WhiteDot('R9C3', 'R9C4'),
];

const blackDots = [
  // Kropki black dots (1:2 ratio).
  new BlackDot('R1C4', 'R2C4'),
  new BlackDot('R1C5', 'R2C5'),
  new BlackDot('R1C6', 'R2C6'),
  new BlackDot('R4C1', 'R5C1'),
  new BlackDot('R6C1', 'R7C1'),
  new BlackDot('R3C3', 'R4C3'),
  new BlackDot('R3C7', 'R4C7'),
  new BlackDot('R4C5', 'R5C5'),
  new BlackDot('R7C4', 'R8C4'),
  new BlackDot('R7C5', 'R8C5'),
  new BlackDot('R7C6', 'R8C6'),
  new BlackDot('R4C9', 'R5C9'),
  new BlackDot('R5C9', 'R6C9'),
  new BlackDot('R6C9', 'R7C9'),
];

return [
  new Shape('9x9'),
  ...arrows,
  ...whiteDots,
  ...blackDots,
];
