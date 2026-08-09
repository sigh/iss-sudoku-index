// Title: The Crown
// Author: Questionable_Compensation
// Video: https://www.youtube.com/watch?v=l-9OrqUmF3Y
// Source: https://app.crackingthecryptic.com/sudoku/dmghGBhQbJ
//
// Normal sudoku rules apply, with standard 3x3 boxes (regions array matches
// the default boxes). Cages show their sums (no all-different note in the
// rules, but Cage enforces it, matching standard killer-cage convention).
// Digits on an arrow sum to the digit in the circle. A digit on a grey
// circle is odd -- encoded as a restricted Given, since ISS has no
// dedicated Odd class. Any set of three sequential cells along an orange
// (entropic) line must contain a low (1-3), middle (4-6), and high (7-9)
// digit -- the built-in Entropic class enforces this per sliding window of
// 3 along the given cell order.
//
// Two orange entropic lines are drawn: a straight line along row 7, and a
// closed "crown" loop around rows 2-6 whose top edge zigzags between rows 2
// and 3 (diagonal steps in the drawn path -- the rule constrains sequence
// order along the line, not grid adjacency). Entropic's built-in handler
// only slides windows along the given (non-wrapping) cell list, so the
// closed loop's cell list below repeats its first two cells at the end;
// that reproduces the two wrap-around windows without changing any other
// window.
const crownLoop = [
  'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1',
  'R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R6C8', 'R6C9',
  'R5C9', 'R4C9', 'R3C9', 'R2C9',
  'R3C8', 'R2C7', 'R3C6', 'R2C5', 'R3C4', 'R2C3', 'R3C2',
];

return [
  new Shape('9x9'),

  // Cages (drawn totals; top-left, top-right, bottom-left, bottom-mid,
  // bottom-right 3-cell cages).
  new Cage(10, 'R1C1', 'R1C2', 'R1C3'),
  new Cage(16, 'R1C7', 'R1C8', 'R1C9'),
  new Cage(18, 'R7C1', 'R8C1', 'R9C1'),
  new Cage(14, 'R7C5', 'R8C5', 'R9C5'),
  new Cage(9, 'R7C9', 'R8C9', 'R9C9'),

  // Arrows: circle cell first, then the arm cells whose digits sum to it.
  new Arrow('R3C5', 'R4C5', 'R5C5'),
  new Arrow('R9C7', 'R9C8', 'R9C9'),
  new Arrow('R9C3', 'R9C2', 'R9C1'),

  // Grey circles are odd. The arrow bulbs are drawn white-filled with a grey
  // border (the standard arrow-circle style); the two standalone circles on
  // the crown loop (no arrow) are drawn solid grey-filled -- only these
  // match "a grey circle" and get the odd restriction.
  new Given('R2C1', 1, 3, 5, 7, 9),
  new Given('R2C9', 1, 3, 5, 7, 9),

  // Entropic lines.
  new Entropic('R7C1', 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8', 'R7C9'),
  new Entropic(...crownLoop, crownLoop[0], crownLoop[1]),
];
