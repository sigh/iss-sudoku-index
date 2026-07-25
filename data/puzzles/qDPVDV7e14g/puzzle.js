// Title: Balancing Act
// Author: LJC
// Video: https://www.youtube.com/watch?v=qDPVDV7e14g
// Source: https://sudokupad.app/mh5g6b4vwo

// Normal sudoku rules apply (rows, columns, boxes); boxes are the standard
// 3x3 regions, so no explicit region constraint is needed.
// Arrows: the digit in the circle equals the sum of the digits along the
// rest of the arrow.
// Killer cages: digits in a cage don't repeat, and sum to the total shown in
// the top-left corner when a total is given; one cage has no total.
// Kropki: a white dot between two cells means those two digits are
// consecutive.

return [
  new Shape('9x9'),

  // Killer cages, transcribed from the drawn cage outlines.
  // The first cage has no total shown (sum 0 = uniqueness-only per Cage
  // semantics); it also happens to contain both circle cells of the two
  // arrows that cross the box boundary between R3-5,C4-6.
  new Cage(0, 'R3C4', 'R3C5', 'R4C4', 'R4C5', 'R5C4', 'R5C5', 'R6C4', 'R6C5'),
  new Cage(16, 'R8C1', 'R8C2'),
  new Cage(16, 'R1C9', 'R2C8', 'R2C9'),
  new Cage(5, 'R4C1', 'R5C1'),
  new Cage(9, 'R3C8', 'R4C8'),

  // Arrows. Circle cell first, then arm cells, transcribed from the drawn
  // arrow paths (waypoints snapped to cell centres) cross-checked against
  // the matching circle marks.
  new Arrow('R3C4', 'R4C3', 'R4C2', 'R4C1'),
  new Arrow('R6C5', 'R5C6', 'R5C7', 'R5C8', 'R4C9'),
  new Arrow('R8C3', 'R9C4', 'R9C5', 'R9C6'),
  new Arrow('R7C6', 'R8C7', 'R8C8'),
  new Arrow('R1C4', 'R2C3', 'R2C2', 'R2C1'),
  // Single-cell arm: the arrow only passes through one cell besides the
  // circle, so that cell's digit must equal the circle's digit.
  new Arrow('R3C6', 'R2C7'),

  // Kropki white dots, transcribed from the small white-filled,
  // black-bordered edge marks between cell pairs (white fill matches the
  // rules' "white dot" wording).
  new WhiteDot('R1C5', 'R2C5'),
  new WhiteDot('R3C3', 'R4C3'),
  new WhiteDot('R5C3', 'R6C3'),
];
