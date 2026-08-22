// Title: Dec 24, 2021: Thermwich
// Author: clover!
// Video: https://www.youtube.com/watch?v=RToyNMs8sFQ
// Source: https://tinyurl.com/3xxaw4fe

// Normal sudoku rules apply (default row/column/box all-different, added by
// Shape). Digits along a thermometer must strictly increase, starting from
// the round bulb (encoded with Thermo, bulb first). A value outside the grid
// is a sandwich clue: it gives the sum of the digits strictly between the 1
// and the 9 in that row or column (encoded with Sandwich.fromCells against
// the full row/column, so direction and canonical id come from the cells).

const row = (r) => [1, 2, 3, 4, 5, 6, 7, 8, 9].map((c) => makeCellId(r, c));
const col = (c) => [1, 2, 3, 4, 5, 6, 7, 8, 9].map((r) => makeCellId(r, c));

return [
  new Shape('9x9'),

  new Given('R1C1', 1),
  new Given('R2C7', 9),
  new Given('R3C5', 6),
  new Given('R3C7', 8),
  new Given('R5C3', 7),
  new Given('R5C5', 1),
  new Given('R5C7', 4),
  new Given('R7C2', 1),
  new Given('R7C3', 8),
  new Given('R7C5', 4),
  new Given('R9C9', 2),

  // Thermometers, listed bulb-first. The top-left pair and bottom-right pair
  // each share their bulb cell (R1C1 / R9C9 respectively).
  new Thermo('R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1'),
  new Thermo('R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5'),
  new Thermo('R9C9', 'R8C9', 'R7C9', 'R6C9', 'R5C9'),
  new Thermo('R9C9', 'R9C8', 'R9C7', 'R9C6', 'R9C5'),

  // Sandwich sums: row 1 = 9, row 5 = 12, row 9 = 5, column 1 = 15,
  // column 5 = 11, column 9 = 4.
  Sandwich.fromCells(9, row(1), cellGeometry('9x9')),
  Sandwich.fromCells(12, row(5), cellGeometry('9x9')),
  Sandwich.fromCells(5, row(9), cellGeometry('9x9')),
  Sandwich.fromCells(15, col(1), cellGeometry('9x9')),
  Sandwich.fromCells(11, col(5), cellGeometry('9x9')),
  Sandwich.fromCells(4, col(9), cellGeometry('9x9')),
];
