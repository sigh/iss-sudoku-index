// Title: Vortex
// Author: A_Majestic_Hobo
// Video: https://www.youtube.com/watch?v=4knssXzaLeY
// Source: https://app.crackingthecryptic.com/sudoku/248dtDfGnD

// Normal sudoku rules apply (standard 3x3 box regions -- Shape('9x9')
// supplies rows/columns/boxes, matching the 9 whole-box regions in the
// payload). Digits on a purple line are a set of consecutive, non-repeating
// digits in any order -- Renban, whose DESCRIPTION matches verbatim. Cells
// separated by a white dot differ by one (WhiteDot); cells separated by a
// black dot are in a 1:2 ratio (BlackDot); not all dots are given, so no
// negative (absence-implies-no-relation) constraint is added anywhere else.
// Digits on an arrow sum to the number in its circle (Arrow: first cell is
// the bulb, remaining cells the arm); every arrow here has a one-cell arm,
// so each is an equality between the bulb and its single arm cell. Cages
// show their sums (Cage, which also bars repeats; every cage below is a
// 2-cell domino confined to one row or column, so the repeat bar is already
// implied by base sudoku either way).

return [
  new Shape('9x9'),

  new Given('R1C1', 9),
  new Given('R1C9', 8),
  new Given('R3C7', 3),
  new Given('R7C3', 9),
  new Given('R9C1', 7),
  new Given('R9C9', 6),

  // Purple lines (Renban), cell order as drawn.
  new Renban('R1C4', 'R2C5', 'R2C6'),
  new Renban('R4C8', 'R4C9'),
  new Renban('R4C3', 'R4C2', 'R5C2', 'R4C1'),
  new Renban('R8C6', 'R9C6', 'R9C5'),

  // White dots (difference of one), as drawn.
  new WhiteDot('R3C4', 'R3C5'),
  new WhiteDot('R3C4', 'R4C4'),
  new WhiteDot('R5C3', 'R6C3'),
  new WhiteDot('R6C3', 'R6C4'),
  new WhiteDot('R3C7', 'R4C7'),

  // Black dots (1:2 ratio), as drawn.
  new BlackDot('R4C7', 'R5C7'),
  new BlackDot('R4C6', 'R4C7'),
  new BlackDot('R6C6', 'R7C6'),
  new BlackDot('R7C5', 'R7C6'),
  new BlackDot('R2C2', 'R2C3'),

  // Arrows: bulb cell (circle) then arm cells, as drawn. The four
  // bulbs/arms trace a diamond around the grid's centre (the "Vortex").
  new Arrow('R4C4', 'R3C5'),
  new Arrow('R4C6', 'R5C7'),
  new Arrow('R6C6', 'R7C5'),
  new Arrow('R6C4', 'R5C3'),

  // Cages (sum, cells), as drawn.
  new Cage(10, 'R1C5', 'R2C5'),
  new Cage(5, 'R1C6', 'R2C6'),
  new Cage(11, 'R2C8', 'R2C9'),
  new Cage(10, 'R5C8', 'R5C9'),
  new Cage(5, 'R6C8', 'R6C9'),
  new Cage(5, 'R4C1', 'R4C2'),
  new Cage(10, 'R5C1', 'R5C2'),
  new Cage(10, 'R6C1', 'R6C2'),
  new Cage(10, 'R8C1', 'R8C2'),
  new Cage(5, 'R8C4', 'R9C4'),
  new Cage(10, 'R8C5', 'R9C5'),
  new Cage(11, 'R8C8', 'R9C8'),
];
