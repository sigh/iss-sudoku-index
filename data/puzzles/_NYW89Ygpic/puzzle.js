// Title: Scattershot
// Author: TotallyNormalCat
// Video: https://www.youtube.com/watch?v=_NYW89Ygpic
// Source: https://app.crackingthecryptic.com/sudoku/DbqfnTp2hR

// Normal sudoku rules apply (default row/column/box all-different, standard
// 3x3 boxes -- the drawn regions match the default partition).
// Arrows: digits along the arrow sum to the digit in that arrow's circle.
// Black dot: the two digits it separates have a ratio of 1:2.
// White dot: the two digits it separates have a difference of 1.
// Rules text: "Not all dots are given" -- only the drawn dots are encoded;
// no negative (StrictKropki-style) constraint is added over undrawn adjacent
// pairs, since the rules explicitly disclaim exhaustive marking.

// Arrows: bulb cell first, then arm cells in path order.
// Circle underlays confirm the four bulb cells (R4C6, R6C4, R7C7, R3C3);
// arrows #3 and #4 share the R7C7 bulb.
const arrows = [
  new Arrow('R4C6', 'R3C7', 'R2C8', 'R1C9'),
  new Arrow('R6C4', 'R7C3', 'R8C2', 'R9C1'),
  new Arrow('R3C3', 'R4C4', 'R5C4'),
  new Arrow('R7C7', 'R6C6', 'R5C6'),
  new Arrow('R7C7', 'R8C8', 'R7C9'),
];
// A sixth "arrow" entry in the payload renders nothing (no coordinates) and
// is not a drawn clue -- omitted.

// Black (ratio 1:2) dots, transcribed from the drawn overlays by fill color.
const blackDots = [
  new BlackDot('R6C2', 'R6C3'),
  new BlackDot('R5C8', 'R5C9'),
];

// White (difference 1) dots, transcribed from the drawn overlays by fill color.
const whiteDots = [
  new WhiteDot('R5C1', 'R5C2'),
  new WhiteDot('R4C2', 'R4C3'),
  new WhiteDot('R2C2', 'R2C3'),
  new WhiteDot('R2C3', 'R2C4'),
  new WhiteDot('R3C5', 'R3C6'),
  new WhiteDot('R3C8', 'R3C9'),
  new WhiteDot('R2C9', 'R3C9'),
  new WhiteDot('R7C8', 'R8C8'),
  new WhiteDot('R8C7', 'R8C8'),
  new WhiteDot('R8C3', 'R9C3'),
  new WhiteDot('R9C2', 'R9C3'),
  new WhiteDot('R7C1', 'R8C1'),
  new WhiteDot('R7C1', 'R7C2'),
  new WhiteDot('R4C5', 'R5C5'),
  new WhiteDot('R5C5', 'R6C5'),
  new WhiteDot('R1C7', 'R1C8'),
  new WhiteDot('R1C7', 'R2C7'),
];

return [
  new Shape('9x9'),
  ...arrows,
  ...blackDots,
  ...whiteDots,
];
