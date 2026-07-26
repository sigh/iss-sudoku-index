// Title: Slow Burn
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=TFndflLwmoQ
// Source: https://sudokupad.app/james-sinclair/slow-burn

// Normal sudoku rules apply. Cages: sum of digits equals the top-left total,
// digits all-different within a cage. Arrows: sum of the line cells equals
// the circled cell's digit; line digits may repeat. Shaded-square cells must
// be even; the shaded-circle cell must be odd. There is no native Odd/Even
// class, so each parity cell is a Given restricted to the odd or even digits.

// Cages (top-left total, cells) -- transcribed from the source payload's
// cage list, cross-checked against the cage-tint background shading.
const cages = [
  new Cage(15, 'R3C4', 'R3C5', 'R4C3', 'R4C4', 'R5C3'),
  new Cage(26, 'R8C8', 'R8C9', 'R9C8', 'R9C9'),
  new Cage(14, 'R2C5', 'R2C6'),
  new Cage(6, 'R2C8', 'R2C9'),
  new Cage(14, 'R5C2', 'R6C2'),
  new Cage(9, 'R8C2', 'R9C2'),
  new Cage(9, 'R9C4', 'R9C5'),
  new Cage(5, 'R6C4', 'R7C4'),
  new Cage(5, 'R4C6', 'R4C7'),
  new Cage(9, 'R4C9', 'R5C9'),
];

// Arrows (circle cell first, then line cells) -- decoded from the source
// payload's drawn arrow waypoints. Each arrow's two non-bulb waypoints land
// exactly on cell centres, giving an unambiguous straight two-cell line;
// R8C8 and R6C7 each anchor two arrows sharing one drawn circle.
const arrows = [
  new Arrow('R2C2', 'R3C3', 'R4C4'),
  new Arrow('R8C8', 'R7C9', 'R6C9'),
  new Arrow('R8C8', 'R9C7', 'R9C6'),
  new Arrow('R6C7', 'R5C6', 'R6C5'),
  new Arrow('R6C7', 'R7C6', 'R7C5'),
];

// Shaded-square cells (must be even) and the shaded-circle cell (must be
// odd) -- decoded from the source payload's small dark square/circle marks
// at R2C2, R1C5, R7C2, R2C7. R2C2 also carries arrow A's circle above.
const evens = [
  new Given('R2C2', 2, 4, 6, 8),
  new Given('R1C5', 2, 4, 6, 8),
  new Given('R7C2', 2, 4, 6, 8),
];
const odds = [
  new Given('R2C7', 1, 3, 5, 7, 9),
];

return [
  new Shape('9x9'),
  ...cages,
  ...arrows,
  ...evens,
  ...odds,
];
